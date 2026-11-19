let ioInstance = null;

const buildOrganizationRoom = (organizationId) => `organization:${organizationId}`;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  const authService = require("../services/authService");
  const keys = require("./keys");

  ioInstance = new Server(server, {
    cors: {
      origin: keys.allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });
  ioInstance.on("connection", (socket) => {
    socket.emit("stock:connected", {
      message: "Real-time stock updates are active."
    });

    socket.on("organization:join", async ({ organizationId, userId } = {}) => {
      try {
        if (!organizationId || !userId) {
          socket.emit("organization:error", {
            message: "organizationId and userId are required to join notifications."
          });
          return;
        }

        const user = await authService.getUserById(userId.toString());

        if (!user || user.organizationId !== organizationId.toString()) {
          socket.emit("organization:error", {
            message: "You are not authorized to join this organization room."
          });
          return;
        }

        const room = buildOrganizationRoom(organizationId.toString());
        socket.join(room);
        socket.emit("organization:joined", {
          organizationId: organizationId.toString()
        });
      } catch (error) {
        socket.emit("organization:error", {
          message: "Could not connect to the organization room."
        });
      }
    });
  });

  return ioInstance;
};

const getSocket = () => ioInstance;

const emitToOrganization = (organizationId, eventName, payload) => {
  if (!ioInstance || !organizationId) {
    return;
  }

  ioInstance.to(buildOrganizationRoom(organizationId.toString())).emit(eventName, payload);
};

module.exports = {
  initSocket,
  getSocket,
  emitToOrganization
};
