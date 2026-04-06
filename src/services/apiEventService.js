// Serviço de API para eventos - conecta ao backend real
import api from './apiClient';

class ApiEventService {
  // Criar novo evento
  async createEvent(eventData) {
    try {
      const response = await api.post('/eventos', {
        title: eventData.titulo,
        description: eventData.descricao,
        location: eventData.endereco,
        category: eventData.categoria,
        imageUrl: eventData.imageUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  // Listar todos os eventos
  async getAllEvents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.categoria && filters.categoria !== 'todos') {
        params.append('category', filters.categoria);
      }
      if (filters.status && filters.status !== 'todos') {
        params.append('status', filters.status);
      }
      if (filters.cidade) {
        params.append('cidade', filters.cidade);
      }
      if (filters.pagina) {
        params.append('pagina', filters.pagina);
      }
      if (filters.limite) {
        params.append('limite', filters.limite);
      }

      const response = await api.get(`/eventos?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }

  // Obter evento por ID
  async getEventById(id) {
    try {
      const response = await api.get(`/eventos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    }
  }

  // Atualizar evento
  async updateEvent(id, eventData) {
    try {
      const response = await api.put(`/eventos/${id}`, {
        title: eventData.titulo,
        description: eventData.descricao,
        location: eventData.endereco,
        category: eventData.categoria,
        imageUrl: eventData.imageUrl,
        status: eventData.status,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  // Deletar evento
  async deleteEvent(id) {
    try {
      const response = await api.delete(`/eventos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }

  // Adicionar comentário
  async addComment(eventId, content) {
    try {
      const response = await api.post(`/eventos/${eventId}/comentarios`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  // Curtir/descurtir evento
  async toggleLike(eventId) {
    try {
      const response = await api.post(`/eventos/${eventId}/votar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao curtir evento:', error);
      throw error;
    }
  }

  // Obter estatísticas
  async getStats() {
    try {
      const response = await api.get('/eventos/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Obter estatísticas globais
  async getGlobalStats() {
    try {
      const response = await api.get('/eventos/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas globais:', error);
      throw error;
    }
  }
}

// Criar e exportar instância singleton
const apiEventService = new ApiEventService();

export default apiEventService;