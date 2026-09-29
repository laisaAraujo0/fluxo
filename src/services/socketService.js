import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL, { autoConnect: true, reconnection: true });

export const authenticateSocket = () => {
  const token = localStorage.getItem('token');
  if (token) socket.emit('authenticate', { token });
};

socket.on('connect', authenticateSocket);

export const subscribeToBroadcast = (eventName, callback) => socket.on(eventName, callback);
export const unsubscribeFromBroadcast = (eventName, callback) => socket.off(eventName, callback);
export const isSocketConnected = () => socket.connected;
export default socket;
