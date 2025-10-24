import { io } from 'socket.io-client';

// A URL do servidor de backend. 
// Deve ser configurável via variável de ambiente no Vite (import.meta.env.VITE_API_BASE_URL)
// Assumindo que a API e o Socket estão no mesmo host/porta
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Conecta ao servidor Socket.IO
// autoConnect: true para broadcast, já que não precisamos de autenticação para receber posts públicos
const socket = io(SOCKET_URL, {
  autoConnect: true,
  // Desabilita o reconnect automático para evitar loop infinito em caso de erro
  reconnection: true, 
  // O path padrão é /socket.io/
});

/**
 * Função para adicionar um listener para um evento de broadcast.
 * @param {string} eventName - Nome do evento (ex: 'event:new', 'complaint:new')
 * @param {function} callback - Função a ser executada quando o evento for recebido
 */
export const subscribeToBroadcast = (eventName, callback) => {
  socket.on(eventName, callback);
};

/**
 * Função para remover um listener de um evento.
 * @param {string} eventName - Nome do evento
 * @param {function} callback - Função de callback
 */
export const unsubscribeFromBroadcast = (eventName, callback) => {
  socket.off(eventName, callback);
};

/**
 * Função para verificar o status de conexão.
 * @returns {boolean}
 */
export const isSocketConnected = () => {
  return socket.connected;
};

export default socket;
