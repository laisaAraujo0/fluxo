// Serviço de API para buscar reclamações
import { toast } from 'sonner';

const API_URL = '/api/reclamacoes';

// Função auxiliar para simular delay de rede (se necessário)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Busca a lista de reclamações com filtros opcionais.
 * @param {object} params - Parâmetros de filtro.
 * @param {string} [params.localidade] - Nome da cidade para filtrar.
 * @param {string} [params.uf] - Sigla do estado para filtrar.
 * @returns {Promise<{success: boolean, data: Array<object>, error: string}>}
 */
export const buscarReclamacoes = async (params = {}) => {
  // await delay(500); // Simular delay de rede
  
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_URL}?${queryParams}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar reclamações');
    }
    
    const data = await response.json();
    
    // Simular dados mockados no frontend se a API não retornar nada (apenas para desenvolvimento)
    if (!data.reclamacoes || data.reclamacoes.length === 0) {
      // Retornar os dados mockados que estavam na ReclamacoesPage.jsx
      const mockReclamacoes = [
        {
          id: 1,
          titulo: "Buraco na Rua Principal",
          status: "PENDING",
          priority: "HIGH",
          likes: 15,
          comentarios: 5,
          categoria: "Infraestrutura",
          estado: "SP",
          cidade: "São Paulo",
          location: "São Paulo, SP",
        },
        {
          id: 2,
          titulo: "Iluminação Pública Defeituosa",
          status: "RESOLVED",
          priority: "MEDIUM",
          likes: 20,
          comentarios: 10,
          categoria: "Serviços Públicos",
          estado: "RJ",
          cidade: "Rio de Janeiro",
          location: "Rio de Janeiro, RJ",
        },
        {
          id: 3,
          titulo: "Acúmulo de Lixo",
          status: "PENDING",
          priority: "LOW",
          likes: 5,
          comentarios: 2,
          categoria: "Meio Ambiente",
          estado: "SP",
          cidade: "São Paulo",
          location: "São Paulo, SP",
        },
        {
          id: 4,
          titulo: "Vazamento de Água",
          status: "RESOLVED",
          priority: "HIGH",
          likes: 25,
          comentarios: 15,
          categoria: "Saneamento",
          estado: "MG",
          cidade: "Belo Horizonte",
          location: "Belo Horizonte, MG",
        },
        {
          id: 5,
          titulo: "Pichação em Prédio Público",
          status: "PENDING",
          priority: "MEDIUM",
          likes: 10,
          comentarios: 3,
          categoria: "Segurança",
          estado: "RJ",
          cidade: "Rio de Janeiro",
          location: "Rio de Janeiro, RJ",
        },
      ];
      
      // Aplicar filtro de localização no mock
      let filteredMock = mockReclamacoes;
      if (params.localidade && params.uf) {
        filteredMock = mockReclamacoes.filter(r => 
          r.cidade === params.localidade && r.estado === params.uf
        );
      }
      
      return {
        success: true,
        data: filteredMock,
        total: filteredMock.length
      };
    }
    
    return {
      success: true,
      data: data.reclamacoes,
      total: data.reclamacoes.length
    };
  } catch (error) {
    toast.error(error.message);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

export default {
  buscarReclamacoes,
};
