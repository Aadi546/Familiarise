import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
let socket;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }

  return socket;
}

export function connectFamilySocket({ fullName }) {
  const activeSocket = getSocket();
  activeSocket.auth = { fullName };

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  return activeSocket;
}
