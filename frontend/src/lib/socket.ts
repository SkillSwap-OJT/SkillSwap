import { io, Socket } from 'socket.io-client';
import { TOKEN_KEY } from '../api/client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  if (socket) {
    socket.connect();
    return socket;
  }

  const token = localStorage.getItem(TOKEN_KEY) || '';
  const base = (import.meta.env.VITE_API_BASE as string | undefined) || window.location.origin;

  socket = io(base, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
