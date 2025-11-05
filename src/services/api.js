// Serviço de API para busca de eventos
// Este serviço simula chamadas a uma API real, incluindo delays e tratamento de erros

const API_DELAY = 500; // Simular delay de rede

// Dados mockados de eventos
const eventosData = [
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
    tags: ['infraestrutura', 'trânsito', 'urgente']
  },
  {
    id: 2,
    titulo: "Iluminação Pública Defeituosa - Zona Norte",
    descricao: "Vários postes de luz queimados na região, causando insegurança durante a noite.",
    categoria: 'infraestrutura',
    localizacao: 'zona-norte',
    endereco: 'Avenida das Flores, 456 - Zona Norte',
    dataInicio: '2024-12-08',
    dataFim: '2024-12-08',
    horario: 'Problema noturno',
    preco: 'Reportado',
    organizador: 'Cidadã Maria Santos',
    participantes: 32,
    avaliacoes: 2.3,
    status: 'em_andamento',
    prioridade: 'alta',
    imagem: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4phROEA8Q6SjAe5C7zXyd6mKedMgHoOiu-buU27-v5Ug61KmNgTIfMnEd1cBXzJH1L02QGiZ8aLQQgMfLwZigMT7gE-uOhAIuEHnlYmGuYvv57IFUHQNnd3N_Fd4ZjQIlPHabigm6CfsrzXCkjgBuC6Bs0TSuyHS9aZD38MVYkjJglJg4RhFJZVdQ9N0ywiDBrg3biFslBFbWQRd8N81x1f5bxKS8GsUPS0GaUrrJidlPmrQEtjST-6gLxPB2TLCQenkCcqvBit4",
    tags: ['iluminação', 'segurança', 'infraestrutura']
  },
  {
    id: 3,
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
    tags: ['artesanato', 'cultura', 'família']
  },
  {
    id: 4,
    titulo: "Concerto de Jazz ao Ar Livre",
    descricao: "Aproveite uma noite mágica de música jazz sob as estrelas com artistas renomados.",
    categoria: 'musica',
    localizacao: 'zona-sul',
    endereco: 'Anfiteatro do Parque das Águas',
    dataInicio: '2024-12-20',
    dataFim: '2024-12-20',
    horario: '19:00 - 22:00',
    preco: 'R$ 25,00',
    organizador: 'Associação Cultural Jazz',
    participantes: 300,
    avaliacoes: 4.9,
    status: 'ativo',
    prioridade: 'baixa',
    imagem: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP6HjMKtqkk8R4vsnsIUm3ZJOdznaYeIRVrTCQSfnlLPCHqe0YCrh6bWzY3zqbodD3B-5WFEE2PQuouNRSrYPOBVtN7VnZtKyExHQbWPPkChS_AZA79lF8ISFc8uNqSar9zipi5NWA6Aej_eSEPNUlNy6iWnSUVzGjHpH1LRk8_MBBd8Tcg91LkJLpi2gfhZ4mN627TWFN-9C0kgzGw0JtO05tdIbKw6KjKTHV7C2tIGa6wTI2dAkmVlFkKI_kJE5Ak8WyDz2aFRE",
    tags: ['jazz', 'música', 'noite']
  },
  {
    id: 5,
    titulo: "Oficina de Jardinagem Urbana",
    descricao: "Aprenda técnicas sustentáveis para cultivar seu próprio jardim na cidade.",
    categoria: 'educacao',
    localizacao: 'zona-norte',
    endereco: 'Centro Comunitário Norte',
    dataInicio: '2024-12-18',
    dataFim: '2024-12-18',
    horario: '14:00 - 17:00',
    preco: 'R$ 15,00',
    organizador: 'Instituto Verde Urbano',
    participantes: 45,
    avaliacoes: 4.7,
    status: 'ativo',
    prioridade: 'baixa',
    imagem: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiRusMqqN00JFM-rxA8qZvFeLzXV_NLRP7oF0v_MOlQ7hUu55V2BAx7lm2T-3FrOXgSAGNvE4HDNWwDmv0YEtHVshljuwR-iUQBdwAR_zxjuxp64r-Ft11Mp11oP4eahTeC6nluwDtyXEO6jIMh66pEBj3RTbyNYBjDwXEuxXlhhuxJ-29kQtdooVAByvOsYIQOKcx5fW0ayddtOWF64cJ0zRnqq_6AXa80xGmAEiasGEqSN2JhhbTQlAiAKITO3X-rKfed595PXQ",
    tags: ['jardinagem', 'sustentabilidade', 'educação']
  }
];

// Função auxiliar para simular delay de rede
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Buscar todos os eventos
export const buscarEventos = async (params = {}) => {
  await delay(API_DELAY);
  
  try {
    let eventos = [...eventosData];
    
    // Aplicar filtros se fornecidos
    if (params.categoria && params.categoria !== 'todos') {
      eventos = eventos.filter(e => e.categoria === params.categoria);
    }
    
    if (params.status && params.status !== 'todos') {
      eventos = eventos.filter(e => e.status === params.status);
    }
    
    if (params.cidade) {
      eventos = eventos.filter(e => 
        e.endereco.toLowerCase().includes(params.cidade.toLowerCase())
      );
    }
    
    if (params.dataInicio) {
      eventos = eventos.filter(e => new Date(e.dataInicio) >= new Date(params.dataInicio));
    }
    
    if (params.dataFim) {
      eventos = eventos.filter(e => new Date(e.dataInicio) <= new Date(params.dataFim));
    }
    
    return {
      success: true,
      data: eventos,
      total: eventos.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar eventos',
      data: []
    };
  }
};

// Buscar evento por ID
export const buscarEventoPorId = async (id) => {
  await delay(API_DELAY);
  
  try {
    const evento = eventosData.find(e => e.id === parseInt(id));
    
    if (!evento) {
      return {
        success: false,
        error: 'Evento não encontrado',
        data: null
      };
    }
    
    return {
      success: true,
      data: evento
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar evento',
      data: null
    };
  }
};

// Buscar eventos por termo de busca
export const buscarEventosPorTermo = async (termo) => {
  await delay(API_DELAY);
  
  try {
    if (!termo || termo.trim() === '') {
      return {
        success: true,
        data: eventosData,
        total: eventosData.length
      };
    }
    
    const termoLower = termo.toLowerCase();
    const eventos = eventosData.filter(e => 
      e.titulo.toLowerCase().includes(termoLower) ||
      e.descricao.toLowerCase().includes(termoLower) ||
      e.tags.some(tag => tag.toLowerCase().includes(termoLower)) ||
      e.categoria.toLowerCase().includes(termoLower)
    );
    
    return {
      success: true,
      data: eventos,
      total: eventos.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar eventos',
      data: []
    };
  }
};

// Criar novo evento
export const criarEvento = async (eventoData) => {
  await delay(API_DELAY);
  
  try {
    const novoEvento = {
      id: eventosData.length + 1,
      ...eventoData,
      participantes: 0,
      avaliacoes: 0,
      status: 'pendente',
      imagem: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKZr1g30scy6QiorRb98rU1SW13tijIq_AJ2KM-4NwLkpVzO9O8N0z0cVlCjqrZOpLxklr-C2ZFR4-xYnQLSnUwEup8E5u5GE9-orKpo3nco7kk7KXZLPPrw3CWvS9PPs-uZrOIXyXWtj-PUDcjyHZBP9EI_xrMJ2jzrSmVs6E7eJsyqIQv92XAZ_leXopv5reRvrYdjQHiY8B-naMSe0CHfcM-ndREILx0_BRdgsJAh5kU3Z0yCtr7ssszmHm7QqOhZNkiSr4Gm0"
    };
    
    eventosData.push(novoEvento);
    
    return {
      success: true,
      data: novoEvento,
      message: 'Evento criado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao criar evento',
      data: null
    };
  }
};

// Atualizar evento
export const atualizarEvento = async (id, eventoData) => {
  await delay(API_DELAY);
  
  try {
    const index = eventosData.findIndex(e => e.id === parseInt(id));
    
    if (index === -1) {
      return {
        success: false,
        error: 'Evento não encontrado',
        data: null
      };
    }
    
    eventosData[index] = {
      ...eventosData[index],
      ...eventoData
    };
    
    return {
      success: true,
      data: eventosData[index],
      message: 'Evento atualizado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao atualizar evento',
      data: null
    };
  }
};

// Deletar evento
export const deletarEvento = async (id) => {
  await delay(API_DELAY);
  
  try {
    const index = eventosData.findIndex(e => e.id === parseInt(id));
    
    if (index === -1) {
      return {
        success: false,
        error: 'Evento não encontrado'
      };
    }
    
    eventosData.splice(index, 1);
    
    return {
      success: true,
      message: 'Evento deletado com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao deletar evento'
    };
  }
};

// Buscar eventos por localização (CEP ou coordenadas)
export const buscarEventosPorLocalizacao = async (localizacao, raio = 10) => {
  await delay(API_DELAY);
  
  try {
    // Simular busca por localização
    // Em uma API real, isso usaria geolocalização para filtrar eventos próximos
    const eventos = eventosData.filter(e => 
      e.endereco.toLowerCase().includes(localizacao.toLowerCase())
    );
    
    return {
      success: true,
      data: eventos,
      total: eventos.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar eventos por localização',
      data: []
    };
  }
};

export default {
  buscarEventos,
  buscarEventoPorId,
  buscarEventosPorTermo,
  criarEvento,
  atualizarEvento,
  deletarEvento,
  buscarEventosPorLocalizacao
};

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
