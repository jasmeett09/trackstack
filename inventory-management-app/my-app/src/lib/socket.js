const SOCKET_SCRIPT_ID = 'socket-io-client-script';

let socketPromise = null;
let activeIdentity = null;
let connectHandlerBound = false;

const trimTrailingSlash = (value = '') => value.replace(/\/$/, '');

const socketBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
);

const buildSocketScriptUrl = () => (
  socketBaseUrl ? `${socketBaseUrl}/socket.io/socket.io.js` : '/socket.io/socket.io.js'
);

const loadSocketClient = () => new Promise((resolve, reject) => {
  if (window.io) {
    resolve(window.io);
    return;
  }

  const existingScript = document.getElementById(SOCKET_SCRIPT_ID);

  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(window.io), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Failed to load socket client.')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = SOCKET_SCRIPT_ID;
  script.src = buildSocketScriptUrl();
  script.async = true;
  script.onload = () => resolve(window.io);
  script.onerror = () => reject(new Error('Failed to load socket client.'));
  document.body.appendChild(script);
});

const emitOrganizationJoin = (socket) => {
  if (!socket || !activeIdentity?.organizationId || !activeIdentity?.userId) {
    return;
  }

  socket.emit('organization:join', {
    organizationId: activeIdentity.organizationId,
    userId: activeIdentity.userId
  });
};

export const getOrganizationSocket = async ({ organizationId, userId }) => {
  if (!socketPromise) {
    socketPromise = loadSocketClient().then((io) => {
      if (typeof io !== 'function') {
        throw new Error('Socket client is unavailable.');
      }

      return io(socketBaseUrl || undefined, {
        withCredentials: true
      });
    });
  }

  const socket = await socketPromise;
  activeIdentity = {
    organizationId: organizationId?.toString?.() || '',
    userId: userId?.toString?.() || ''
  };

  if (!connectHandlerBound) {
    socket.on('connect', () => {
      emitOrganizationJoin(socket);
    });
    connectHandlerBound = true;
  }

  emitOrganizationJoin(socket);
  return socket;
};

export const subscribeToOrganizationSocket = async ({ organizationId, userId, handlers = {} }) => {
  const socket = await getOrganizationSocket({ organizationId, userId });
  const entries = Object.entries(handlers).filter(([, handler]) => typeof handler === 'function');

  entries.forEach(([eventName, handler]) => {
    socket.on(eventName, handler);
  });

  return () => {
    entries.forEach(([eventName, handler]) => {
      socket.off(eventName, handler);
    });
  };
};
