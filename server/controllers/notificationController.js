import { PrismaClient } from '@prisma/client';
import { getUnreadNotifications, markAsRead, markAllAsRead } from '../services/notificationService.js';

const prisma = new PrismaClient();

export const listarNotificacoes = async (req, res) => {
  try {
    const notifications = await getUnreadNotifications(req.usuario.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
};

export const marcarComoLida = async (req, res) => {
  try {
    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.usuario.id } });
    if (!notification) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json({ notification: await markAsRead(notification.id) });
  } catch {
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
};

export const marcarTodasComoLidas = async (req, res) => {
  try {
    await markAllAsRead(req.usuario.id);
    res.json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch {
    res.status(500).json({ error: 'Erro ao marcar notificações' });
  }
};
