const SOCKET_SCRIPT_ID = 'socket-io-client-script';

let socketPromise = null;

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

const getOrganizationSocket = async () => {
  if (!socketPromise) {
    socketPromise = loadSocketClient().then((io) => {
      if (typeof io !== 'function') {
        throw new Error('Socket client is unavailable.');
      }

      return io(socketBaseUrl || undefined, {
        withCredentials: true,
        autoConnect: false
      });
    });
  }

  const socket = await socketPromise;
  if (!socket.active) socket.connect();
  return socket;
};

export const disconnectOrganizationSocket = () => {
  socketPromise?.then((socket) => socket.disconnect()).catch(() => {});
};

export const subscribeToOrganizationSocket = async ({ handlers = {} }) => {
  const socket = await getOrganizationSocket();
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
