import eventService from './eventService';

// Service para gerenciar atividades do usuário
class UserActivityService {
  constructor() {
    this.activities = this.loadActivities();
  }

  // Carregar atividades do localStorage
  loadActivities() {
    const savedActivities = localStorage.getItem('userActivities');
    if (savedActivities) {
      return JSON.parse(savedActivities);
    }
    return {};
  }

  // Salvar atividades no localStorage
  saveActivities() {
    localStorage.setItem('userActivities', JSON.stringify(this.activities));
  }

  // Registrar atividade do usuário
  recordActivity(userId, type, data) {
    if (!userId) return;

    if (!this.activities[userId]) {
      this.activities[userId] = {
        eventosCreated: [],
        curtidas: [],
        comentarios: [],
        totalActivities: 0
      };
    }

    const userActivities = this.activities[userId];
    const timestamp = new Date().toISOString();

    switch (type) {
      case 'evento_criado':
        userActivities.eventosCreated.push({
          eventoId: data.eventoId,
          titulo: data.titulo,
          categoria: data.categoria,
          timestamp
        });
        break;

      case 'curtida':
        const existingLike = userActivities.curtidas.find(
          like => like.eventoId === data.eventoId
        );
        if (!existingLike) {
          userActivities.curtidas.push({
            eventoId: data.eventoId,
            titulo: data.titulo,
            timestamp
          });
        }
        break;

      case 'curtida_removida':
        userActivities.curtidas = userActivities.curtidas.filter(
          like => like.eventoId !== data.eventoId
        );
        break;

      case 'comentario':
        userActivities.comentarios.push({
          eventoId: data.eventoId,
          titulo: data.titulo,
          comentario: data.comentario,
          timestamp
        });
        break;

      case 'comentario_removido':
        userActivities.comentarios = userActivities.comentarios.filter(
          comment => comment.comentarioId !== data.comentarioId
        );
        break;
    }

    // Atualizar contador total
    userActivities.totalActivities = 
      userActivities.eventosCreated.length + 
      userActivities.curtidas.length + 
      userActivities.comentarios.length;

    this.saveActivities();
  }

  // Obter atividades do usuário
  getUserActivities(userId) {
    if (!userId || !this.activities[userId]) {
      return {
        eventosCreated: [],
        curtidas: [],
        comentarios: [],
        totalActivities: 0
      };
    }

    return this.activities[userId];
  }

  // Obter eventos criados pelo usuário
  getUserEvents(userId) {
    const allEvents = eventService.getAllEvents();
    return allEvents.filter(event => event.autorId === userId);
  }

  // Obter eventos curtidos pelo usuário
  getUserLikedEvents(userId) {
    const allEvents = eventService.getAllEvents();
    return allEvents.filter(event => 
      event.curtidas && event.curtidas.some(like => like.userId === userId)
    );
  }

  // Obter comentários do usuário
  getUserComments(userId) {
    const allEvents = eventService.getAllEvents();
    const userComments = [];

    allEvents.forEach(event => {
      if (event.comentarios) {
        event.comentarios.forEach(comment => {
          if (comment.userId === userId) {
            userComments.push({
              ...comment,
              eventoId: event.id,
              eventoTitulo: event.titulo
            });
          }
        });
      }
    });

    return userComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Obter estatísticas do usuário
  getUserStats(userId) {
    const userEvents = this.getUserEvents(userId);
    const userLikedEvents = this.getUserLikedEvents(userId);
    const userComments = this.getUserComments(userId);

    // Calcular curtidas recebidas nos eventos do usuário
    const totalLikesReceived = userEvents.reduce((sum, event) => 
      sum + (event.curtidas?.length || 0), 0
    );

    // Calcular comentários recebidos nos eventos do usuário
    const totalCommentsReceived = userEvents.reduce((sum, event) => 
      sum + (event.comentarios?.length || 0), 0
    );

    return {
      eventosCreated: userEvents.length,
      eventosLiked: userLikedEvents.length,
      comentariosFeitos: userComments.length,
      curtidasRecebidas: totalLikesReceived,
      comentariosRecebidos: totalCommentsReceived,
      totalActivities: userEvents.length + userLikedEvents.length + userComments.length
    };
  }

  // Obter atividade recente do usuário
  getRecentActivity(userId, limit = 10) {
    const userEvents = this.getUserEvents(userId);
    const userLikedEvents = this.getUserLikedEvents(userId);
    const userComments = this.getUserComments(userId);

    const activities = [];

    // Adicionar eventos criados
    userEvents.forEach(event => {
      activities.push({
        type: 'evento_criado',
        timestamp: event.createdAt,
        data: {
          titulo: event.titulo,
          categoria: event.categoria,
          eventoId: event.id
        }
      });
    });

    // Adicionar curtidas (aproximação baseada na data do evento)
    userLikedEvents.forEach(event => {
      const userLike = event.curtidas.find(like => like.userId === userId);
      if (userLike) {
        activities.push({
          type: 'curtida',
          timestamp: userLike.createdAt || event.createdAt,
          data: {
            titulo: event.titulo,
            eventoId: event.id
          }
        });
      }
    });

    // Adicionar comentários
    userComments.forEach(comment => {
      activities.push({
        type: 'comentario',
        timestamp: comment.createdAt,
        data: {
          titulo: comment.eventoTitulo,
          comentario: comment.content,
          eventoId: comment.eventoId
        }
      });
    });

    // Ordenar por data (mais recente primeiro) e limitar
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Limpar atividades do usuário
  clearUserActivities(userId) {
    if (this.activities[userId]) {
      delete this.activities[userId];
      this.saveActivities();
    }
  }

  // Obter usuários mais ativos
  getMostActiveUsers(limit = 5) {
    const userStats = {};
    
    Object.keys(this.activities).forEach(userId => {
      const stats = this.getUserStats(userId);
      userStats[userId] = stats.totalActivities;
    });

    return Object.entries(userStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([userId, activities]) => ({ userId, activities }));
  }

  // Sincronizar atividades com eventos (para garantir consistência)
  syncActivities() {
    const allEvents = eventService.getAllEvents();
    
    // Limpar atividades antigas
    this.activities = {};

    // Recriar atividades baseadas nos eventos atuais
    allEvents.forEach(event => {
      // Registrar criação do evento
      this.recordActivity(event.autorId, 'evento_criado', {
        eventoId: event.id,
        titulo: event.titulo,
        categoria: event.categoria
      });

      // Registrar curtidas
      if (event.curtidas) {
        event.curtidas.forEach(like => {
          this.recordActivity(like.userId, 'curtida', {
            eventoId: event.id,
            titulo: event.titulo
          });
        });
      }

      // Registrar comentários
      if (event.comentarios) {
        event.comentarios.forEach(comment => {
          this.recordActivity(comment.userId, 'comentario', {
            eventoId: event.id,
            titulo: event.titulo,
            comentario: comment.content
          });
        });
      }
    });
  }
}

// Instância singleton
const userActivityService = new UserActivityService();

export default userActivityService;
