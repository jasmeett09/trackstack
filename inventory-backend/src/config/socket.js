let ioInstance = null;

const buildOrganizationRoom = (organizationId) => `organization:${organizationId}`;
const buildSessionRoom = (sessionId) => `session:${sessionId}`;
const buildUserRoom = (userId) => `user:${userId}`;

const initSocket = (server, sessionMiddleware) => {
  const { Server } = require("socket.io");
  const authService = require("../services/authService");
  const keys = require("./keys");

  ioInstance = new Server(server, {
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      const serverOrigin = `${keys.isProduction ? "https" : "http"}://${req.headers.host}`;
      callback(null, !origin || origin === serverOrigin || keys.allowedOrigins.includes(origin));
    },
    cors: {
      origin: keys.allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });
  ioInstance.engine.use((req, res, next) =>
    req._query.sid === undefined ? sessionMiddleware(req, res, next) : next()
  );
  ioInstance.use(async (socket, next) => {
    const userId = socket.request.session?.passport?.user;
    if (!userId) return next(new Error("Please log in to receive real-time updates."));

    try {
      const user = await authService.getUserById(userId);
      if (!user?.organizationId) return next(new Error("This session no longer has organization access."));
      socket.data.userId = user.id;
      socket.data.organizationId = user.organizationId;
      return next();
    } catch {
      return next(new Error("Could not verify the current session."));
    }
  });

  ioInstance.on("connection", (socket) => {
    const { userId, organizationId } = socket.data;
    socket.join([
      buildOrganizationRoom(organizationId),
      buildSessionRoom(socket.request.sessionID),
      buildUserRoom(userId)
    ]);
    socket.emit("stock:connected", { message: "Real-time stock updates are active." });

    const expiresAt = new Date(socket.request.session.cookie.expires).getTime();
    if (Number.isFinite(expiresAt)) {
      const expiry = setTimeout(() => socket.disconnect(true), Math.max(0, expiresAt - Date.now()));
      socket.once("disconnect", () => clearTimeout(expiry));
    }
  });

  return ioInstance;
};

const getSocket = () => ioInstance;

const disconnectSessionSockets = (sessionId) => {
  if (sessionId) ioInstance?.in(buildSessionRoom(sessionId)).disconnectSockets(true);
};

const disconnectUserSockets = (userId) => {
  if (userId) ioInstance?.in(buildUserRoom(userId)).disconnectSockets(true);
};

const emitToOrganization = (organizationId, eventName, payload) => {
  if (!ioInstance || !organizationId) {
    return;
  }

  ioInstance.to(buildOrganizationRoom(organizationId.toString())).emit(eventName, payload);
};

module.exports = {
  initSocket,
  getSocket,
  disconnectSessionSockets,
  disconnectUserSockets,
  emitToOrganization
};
