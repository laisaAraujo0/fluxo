const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Cria uma nova notificação para um usuário.
 * @param {string} userId - ID do usuário a ser notificado.
 * @param {('LIKE'|'COMMENT'|'APPROVAL'|'UPDATE')} type - Tipo da notificação.
 * @param {string} content - Conteúdo da notificação.
 * @returns {Promise<object>} A notificação criada.
 */
async function createNotification(userId, type, content) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        content,
      },
    });
    // TODO: Implementar lógica para notificação em tempo real (ex: Socket.io)
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw new Error('Não foi possível criar a notificação.');
  }
}

/**
 * Busca todas as notificações não lidas de um usuário.
 * @param {string} userId - ID do usuário.
 * @returns {Promise<object[]>} Lista de notificações.
 */
async function getUnreadNotifications(userId) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Marca uma notificação como lida.
 * @param {string} notificationId - ID da notificação.
 * @returns {Promise<object>} A notificação atualizada.
 */
async function markAsRead(notificationId) {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      read: true,
    },
  });
}

/**
 * Marca todas as notificações não lidas de um usuário como lidas.
 * @param {string} userId - ID do usuário.
 * @returns {Promise<object>} O resultado da operação.
 */
async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

module.exports = {
  createNotification,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
};
