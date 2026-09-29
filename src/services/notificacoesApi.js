import { api } from './api';

export const buscarNotificacoes = async () => {
  try {
    const { data } = await api.get('/api/notifications');
    return {
      success: true,
      data,
      total: data.length,
      naoLidas: data.filter((n) => !n.read).length,
    };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Erro ao buscar notificações', data: [] };
  }
};

export const marcarComoLida = async (id) => {
  try { await api.put(`/api/notifications/${id}/read`); return { success: true }; }
  catch { return { success: false }; }
};

export const marcarTodasComoLidas = async () => {
  try { await api.put('/api/notifications/read-all'); return { success: true }; }
  catch { return { success: false }; }
};

export const deletarNotificacao = async () => ({ success: false, error: 'Notificações são mantidas no histórico do sistema.' });
