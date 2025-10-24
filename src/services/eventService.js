// Service para gerenciar eventos
class EventService {
  constructor() {
    this.events = this.loadEvents();
    this.nextId = this.getNextId();
  }

  // Carregar eventos do localStorage
  loadEvents() {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      return JSON.parse(savedEvents);
    }
    
    // Eventos iniciais com estrutura atualizada
    return [
      {
        id: 1,
        titulo: "Buraco na Rua Principal - Centro",
        descricao: "Buraco grande na via principal causando transtornos no trânsito e riscos para pedestres e veículos.",
        categoria: 'infraestrutura',
        localizacao: 'centro',
        endereco: 'Rua Principal, 123 - Centro',
        dataInicio: '2024-12-10',
        dataFim: '2024-12-10',
        horario: 'Problema permanente',
        preco: 'Reportado',
        organizador: 'Cidadão João Silva',
        participantes: 45,
        avaliacoes: 2.1,
        status: 'pendente',
        prioridade: 'alta',
        imagem: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKZr1g30scy6QiorRb98rU1SW13tijIq_AJ2KM-4NwLkpVzO9O8N0z0cVlCjqrZOpLxklr-C2ZFR4-xYnQLSnUwEup8E5u5GE9-orKpo3nco7kk7KXZLPPrw3CWvS9PPs-uZrOIXyXWtj-PUDcjyHZBP9EI_xrMJ2jzrSmVs6E7eJsyqIQv92XAZ_leXopv5reRvrYdjQHiY8B-naMSe0CHfcM-ndREILx0_BRdgsJAh5kU3Z0yCtr7ssszmHm7QqOhZNkiSr4Gm0",
        tags: ['infraestrutura', 'trânsito', 'urgente'],
        autorId: 'user-1',
        autorNome: 'João Silva',
        autorAvatar: null,
        curtidas: [],
        comentarios: [],
        createdAt: '2024-12-10T10:00:00Z',
        updatedAt: '2024-12-10T10:00:00Z'
      },
      {
        id: 2,
        titulo: "Feira de Artesanato no Parque Central",
        descricao: "Descubra peças únicas de artesãos locais em uma feira repleta de criatividade e tradição.",
        categoria: 'cultura',
        localizacao: 'centro',
        endereco: 'Parque Central, Centro',
        dataInicio: '2024-12-15',
        dataFim: '2024-12-15',
        horario: '09:00 - 17:00',
        preco: 'Gratuito',
        organizador: 'Prefeitura Municipal',
        participantes: 150,
        avaliacoes: 4.8,
        status: 'ativo',
        prioridade: 'baixa',
        imagem: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4phROEA8Q6SjAe5C7zXyd6mKedMgHoOiu-buU27-v5Ug61KmNgTIfMnEd1cBXzJH1L02QGiZ8aLQQgMfLwZigMT7gE-uOhAIuEHnlYmGuYvv57IFUHQNnd3N_Fd4ZjQIlPHabigm6CfsrzXCkjgBuC6Bs0TSuyHS9aZD38MVYkjJglJg4RhFJZVdQ9N0ywiDBrg3biFslBFbWQRd8N81x1f5bxKS8GsUPS0GaUrrJidlPmrQEtjST-6gLxPB2TLCQenkCcqvBit4",
        tags: ['artesanato', 'cultura', 'família'],
        autorId: 'user-2',
        autorNome: 'Prefeitura Municipal',
        autorAvatar: null,
        curtidas: [],
        comentarios: [],
        createdAt: '2024-12-08T14:30:00Z',
        updatedAt: '2024-12-08T14:30:00Z'
      }
    ];
  }

  // Salvar eventos no localStorage
  saveEvents() {
    localStorage.setItem('events', JSON.stringify(this.events));
  }

  // Obter próximo ID
  getNextId() {
    const maxId = this.events.reduce((max, event) => Math.max(max, event.id), 0);
    return maxId + 1;
  }

  // Criar novo evento
  createEvent(eventData, user) {
    const newEvent = {
      id: this.nextId++,
      titulo: eventData.titulo,
      descricao: eventData.descricao,
      categoria: eventData.categoria,
      localizacao: eventData.localizacao || 'não especificada',
      endereco: `${eventData.endereco}${eventData.numero ? ', ' + eventData.numero : ''}${eventData.complemento ? ', ' + eventData.complemento : ''} - ${eventData.bairro}, ${eventData.cidade}/${eventData.estado}`,
      dataInicio: eventData.dataInicio || new Date().toISOString().split('T')[0],
      dataFim: eventData.dataFim || eventData.dataInicio || new Date().toISOString().split('T')[0],
      horario: eventData.horario || 'A definir',
      preco: eventData.preco || 'Gratuito',
      organizador: user.nome || user.name || 'Usuário Anônimo',
      participantes: 0,
      avaliacoes: 0,
      status: 'pendente',
      prioridade: eventData.prioridade || 'media',
      fotos: eventData.fotos || [],
      imagem: eventData.imagem || (eventData.fotos && eventData.fotos.length > 0 ? eventData.fotos[0] : "https://lh3.googleusercontent.com/aida-public/AB6AXuBKZr1g30scy6QiorRb98rU1SW13tijIq_AJ2KM-4NwLkpVzO9O8N0z0cVlCjqrZOpLxklr-C2ZFR4-xYnQLSnUwEup8E5u5GE9-orKpo3nco7kk7KXZLPPrw3CWvS9PPs-uZrOIXyXWtj-PUDcjyHZBP9EI_xrMJ2jzrSmVs6E7eJsyqIQv92XAZ_leXopv5reRvrYdjQHiY8B-naMSe0CHfcM-ndREILx0_BRdgsJAh5kU3Z0yCtr7ssszhHm7QqOhZNkiSr4Gm0"),
      tags: this.generateTags(eventData.categoria, eventData.titulo),
      autorId: user.id,
      autorNome: user.nome || user.name || 'Usuário Anônimo',
      autorAvatar: user.avatar || null,
      coordenadas: eventData.coordenadas || null,
      cep: eventData.cep || null,
      curtidas: [],
      comentarios: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    this.saveEvents();
    return newEvent;
  }

  // Gerar tags baseadas na categoria e título
  generateTags(categoria, titulo) {
    const tags = [categoria];
    
    const tituloLower = titulo.toLowerCase();
    if (tituloLower.includes('buraco')) tags.push('buraco');
    if (tituloLower.includes('iluminação')) tags.push('iluminação');
    if (tituloLower.includes('semáforo')) tags.push('semáforo');
    if (tituloLower.includes('água')) tags.push('água');
    if (tituloLower.includes('lixo')) tags.push('lixo');
    if (tituloLower.includes('feira')) tags.push('feira');
    if (tituloLower.includes('música')) tags.push('música');
    if (tituloLower.includes('esporte')) tags.push('esporte');
    if (tituloLower.includes('urgente')) tags.push('urgente');
    
    return [...new Set(tags)]; // Remove duplicatas
  }

  // Obter todos os eventos
  getAllEvents() {
    return this.events;
  }

  // Obter evento por ID
  getEventById(id) {
    return this.events.find(event => event.id === parseInt(id));
  }

  // Obter eventos por usuário
  getEventsByUser(userId) {
    return this.events.filter(event => event.autorId === userId);
  }

  // Curtir/descurtir evento
  toggleLike(eventId, userId) {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const likeIndex = event.curtidas.findIndex(like => like.userId === userId);
    
    if (likeIndex > -1) {
      // Remove curtida
      event.curtidas.splice(likeIndex, 1);
    } else {
      // Adiciona curtida
      event.curtidas.push({
        userId,
        createdAt: new Date().toISOString()
      });
    }

    event.updatedAt = new Date().toISOString();
    this.saveEvents();
    return event;
  }

  // Adicionar comentário
  addComment(eventId, userId, userName, content) {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const newComment = {
      id: Date.now(),
      userId,
      userName,
      content,
      createdAt: new Date().toISOString()
    };

    event.comentarios.push(newComment);
    event.updatedAt = new Date().toISOString();
    this.saveEvents();
    return newComment;
  }

  // Remover comentário
  removeComment(eventId, commentId, userId) {
    const event = this.getEventById(eventId);
    if (!event) return false;

    const commentIndex = event.comentarios.findIndex(
      comment => comment.id === commentId && comment.userId === userId
    );

    if (commentIndex > -1) {
      event.comentarios.splice(commentIndex, 1);
      event.updatedAt = new Date().toISOString();
      this.saveEvents();
      return true;
    }

    return false;
  }

  // Atualizar evento
  updateEvent(eventId, updates, userId) {
    const event = this.getEventById(eventId);
    if (!event || event.autorId !== userId) return null;

    Object.assign(event, updates, { updatedAt: new Date().toISOString() });
    this.saveEvents();
    return event;
  }

  // Obter eventos com coordenadas
  getEventsWithCoordinates() {
    return this.events.filter(event => event.coordenadas);
  }

  // Atualizar coordenadas de um evento
  updateEventCoordinates(eventId, coordenadas, userId) {
    const event = this.getEventById(eventId);
    if (!event || event.autorId !== userId) return null;

    event.coordenadas = coordenadas;
    event.updatedAt = new Date().toISOString();
    this.saveEvents();
    return event;
  }

  // Deletar evento
  deleteEvent(eventId, userId) {
    const eventIndex = this.events.findIndex(
      event => event.id === parseInt(eventId) && event.autorId === userId
    );

    if (eventIndex > -1) {
      const deletedEvent = this.events.splice(eventIndex, 1)[0];
      this.saveEvents();
      return deletedEvent;
    }

    return null;
  }

  // Filtrar eventos
  filterEvents(filters) {
    return this.events.filter(event => {
      const matchesSearch = !filters.search || 
        event.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.descricao.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesCategory = !filters.categoria || filters.categoria === 'todos' || 
        event.categoria === filters.categoria;
      
      const matchesLocation = !filters.cidade || 
        event.endereco.toLowerCase().includes(filters.cidade.toLowerCase());
      
      const matchesStatus = !filters.status || filters.status === 'todos' || 
        event.status === filters.status.replace(' ', '_');
      
      const matchesDateStart = !filters.dataInicio || 
        new Date(event.dataInicio) >= new Date(filters.dataInicio);
      
      const matchesDateEnd = !filters.dataFim || 
        new Date(event.dataInicio) <= new Date(filters.dataFim);

      return matchesSearch && matchesCategory && matchesLocation && 
        matchesStatus && matchesDateStart && matchesDateEnd;
    });
  }

  // Obter estatísticas
  getStats() {
    return {
      total: this.events.length,
      pendentes: this.events.filter(e => e.status === 'pendente').length,
      ativos: this.events.filter(e => e.status === 'ativo').length,
      resolvidos: this.events.filter(e => e.status === 'resolvido').length,
      totalCurtidas: this.events.reduce((sum, e) => sum + e.curtidas.length, 0),
      totalComentarios: this.events.reduce((sum, e) => sum + e.comentarios.length, 0)
    };
  }
}

// Instância singleton
const eventService = new EventService();

export default eventService;
