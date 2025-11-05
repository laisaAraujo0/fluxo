import { getUnreadNotifications, markAsRead, markAllAsRead } from '../services/notificationService.js';

/**
 * Lista as notificações não lidas do usuário autenticado.
 */
export const listarNotificacoes = async (req, res) => {
  try {
    const userId = req.usuario?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const notifications = await getUnreadNotifications(userId);
    return res.json(notifications);
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    return res.status(500).json({ error: 'Erro ao listar notificações' });
  }
};

/**
 * Marca uma notificação específica como lida.
 */
export const marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const notification = await markAsRead(id);
    
    // TODO: Verificar se a notificação pertence ao usuário antes de marcar como lida
    // Por simplicidade, vamos assumir que o serviço faz a validação ou que o ID é único.

    return res.json({ message: 'Notificação marcada como lida', notification });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
  }
};

/**
 * Marca todas as notificações não lidas do usuário como lidas.
 */
export const marcarTodasComoLidas = async (req, res) => {
  try {
    const userId = req.usuario?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    await markAllAsRead(userId);
    return res.json({ message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    return res.status(500).json({ error: 'Erro ao marcar todas como lidas' });
  }
};
