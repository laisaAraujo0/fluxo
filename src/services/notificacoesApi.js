// Serviço de API para notificações
// Este serviço simula chamadas a uma API real de notificações

const API_DELAY = 300; // Simular delay de rede

// Dados mockados de notificações
let notificacoesData = [
  {
    id: 1,
    tipo: 'evento',
    titulo: 'Novo evento próximo a você',
    mensagem: 'Feira de Artesanato no Parque Central acontece amanhã',
    lida: false,
    data: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
    link: '/eventos/7',
    icone: 'calendar'
  },
  {
    id: 2,
    tipo: 'reclamacao',
    titulo: 'Atualização na sua reclamação',
    mensagem: 'Sua reclamação sobre iluminação pública foi atualizada para "Em andamento"',
    lida: false,
    data: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
    link: '/reclamacoes/2',
    icone: 'alert-circle'
  },
  {
    id: 3,
    tipo: 'sistema',
    titulo: 'Bem-vindo ao Mapa da Realidade',
    mensagem: 'Explore eventos e reclamações na sua região',
    lida: true,
    data: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
    link: '/',
    icone: 'info'
  },
  {
    id: 4,
    tipo: 'evento',
    titulo: 'Lembrete de evento',
    mensagem: 'O Concerto de Jazz ao Ar Livre começa em 2 dias',
    lida: true,
    data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dias atrás
    link: '/eventos/8',
    icone: 'calendar'
  },
  {
    id: 5,
    tipo: 'reclamacao',
    titulo: 'Nova resposta',
    mensagem: 'A prefeitura respondeu sua reclamação sobre buraco na rua',
    lida: true,
    data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 dias atrás
    link: '/reclamacoes/1',
    icone: 'message-circle'
  }
];

// Função auxiliar para simular delay de rede
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Buscar todas as notificações do usuário
export const buscarNotificacoes = async (usuarioId) => {
  await delay(API_DELAY);
  
  try {
    // Em uma API real, filtraria por usuarioId
    return {
      success: true,
      data: notificacoesData,
      total: notificacoesData.length,
      naoLidas: notificacoesData.filter(n => !n.lida).length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar notificações',
      data: []
    };
  }
};

// Buscar notificações não lidas
export const buscarNotificacoesNaoLidas = async (usuarioId) => {
  await delay(API_DELAY);
  
  try {
    const naoLidas = notificacoesData.filter(n => !n.lida);
    
    return {
      success: true,
      data: naoLidas,
      total: naoLidas.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar notificações não lidas',
      data: []
    };
  }
};

// Marcar notificação como lida
export const marcarComoLida = async (notificacaoId) => {
  await delay(API_DELAY);
  
  try {
    const notificacao = notificacoesData.find(n => n.id === notificacaoId);
    
    if (!notificacao) {
      return {
        success: false,
        error: 'Notificação não encontrada'
      };
    }
    
    notificacao.lida = true;
    
    return {
      success: true,
      data: notificacao,
      message: 'Notificação marcada como lida'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao marcar notificação como lida'
    };
  }
};

// Marcar todas as notificações como lidas
export const marcarTodasComoLidas = async (usuarioId) => {
  await delay(API_DELAY);
  
  try {
    notificacoesData = notificacoesData.map(n => ({
      ...n,
      lida: true
    }));
    
    return {
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao marcar todas as notificações como lidas'
    };
  }
};

// Deletar notificação
export const deletarNotificacao = async (notificacaoId) => {
  await delay(API_DELAY);
  
  try {
    const index = notificacoesData.findIndex(n => n.id === notificacaoId);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Notificação não encontrada'
      };
    }
    
    notificacoesData.splice(index, 1);
    
    return {
      success: true,
      message: 'Notificação deletada com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao deletar notificação'
    };
  }
};

// Criar nova notificação (simulando push do backend)
export const criarNotificacao = async (notificacaoData) => {
  await delay(API_DELAY);
  
  try {
    const novaNotificacao = {
      id: notificacoesData.length + 1,
      ...notificacaoData,
      lida: false,
      data: new Date().toISOString()
    };
    
    notificacoesData.unshift(novaNotificacao);
    
    return {
      success: true,
      data: novaNotificacao,
      message: 'Notificação criada com sucesso'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao criar notificação'
    };
  }
};

// Simular recebimento de notificações em tempo real
export const simularNotificacaoTempoReal = (callback) => {
  // Simular recebimento de notificação a cada 30 segundos
  const interval = setInterval(async () => {
    const tiposNotificacao = ['evento', 'reclamacao', 'sistema'];
    const tipo = tiposNotificacao[Math.floor(Math.random() * tiposNotificacao.length)];
    
    const notificacao = {
      tipo,
      titulo: `Nova notificação de ${tipo}`,
      mensagem: `Você tem uma nova atualização sobre ${tipo}`,
      link: '/',
      icone: tipo === 'evento' ? 'calendar' : tipo === 'reclamacao' ? 'alert-circle' : 'info'
    };
    
    const resultado = await criarNotificacao(notificacao);
    
    if (resultado.success && callback) {
      callback(resultado.data);
    }
  }, 30000); // 30 segundos
  
  return () => clearInterval(interval);
};

export default {
  buscarNotificacoes,
  buscarNotificacoesNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas,
  deletarNotificacao,
  criarNotificacao,
  simularNotificacaoTempoReal
};

