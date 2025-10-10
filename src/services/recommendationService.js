// Serviço de Recomendação baseado em CEP
// Sistema que sugere eventos relevantes com base na localização do usuário

import { buscarEventos } from './api';

class RecommendationService {
  constructor() {
    this.userPreferences = this.loadUserPreferences();
    this.userLocation = null;
  }

  // Carregar preferências do usuário do localStorage
  loadUserPreferences() {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      categoriasFavoritas: [],
      raioMaximo: 10, // km
      notificacoesAtivas: true
    };
  }

  // Salvar preferências do usuário
  saveUserPreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
  }

  // Definir localização do usuário
  setUserLocation(cep, coordenadas = null) {
    this.userLocation = { cep, coordenadas };
    localStorage.setItem('userLocation', JSON.stringify(this.userLocation));
  }

  // Obter localização do usuário
  getUserLocation() {
    if (!this.userLocation) {
      const saved = localStorage.getItem('userLocation');
      this.userLocation = saved ? JSON.parse(saved) : null;
    }
    return this.userLocation;
  }

  // Calcular distância aproximada entre dois CEPs (simulado)
  calcularDistancia(cep1, cep2) {
    // Em uma implementação real, usaríamos uma API de geolocalização
    // Aqui simulamos baseado nos primeiros dígitos do CEP
    const prefix1 = parseInt(cep1.substring(0, 2));
    const prefix2 = parseInt(cep2.substring(0, 2));
    
    // Distância aproximada em km baseada na diferença dos prefixos
    const distancia = Math.abs(prefix1 - prefix2) * 5;
    return distancia;
  }

  // Calcular score de relevância de um evento
  calcularScoreRelevancia(evento, userLocation, preferences) {
    let score = 0;

    // 1. Proximidade geográfica (peso: 40%)
    if (userLocation && userLocation.cep) {
      const distancia = this.calcularDistancia(
        userLocation.cep.replace(/\D/g, ''),
        evento.endereco.match(/\d{5}-?\d{3}/)?.[0]?.replace(/\D/g, '') || '00000000'
      );
      
      // Quanto mais próximo, maior o score
      const proximidadeScore = Math.max(0, 100 - (distancia * 2));
      score += proximidadeScore * 0.4;
    }

    // 2. Categoria favorita (peso: 30%)
    if (preferences.categoriasFavoritas.includes(evento.categoria)) {
      score += 30;
    }

    // 3. Avaliações (peso: 15%)
    if (evento.avaliacoes) {
      score += (evento.avaliacoes / 5) * 15;
    }

    // 4. Popularidade (peso: 10%)
    if (evento.participantes) {
      const popularidadeScore = Math.min(10, (evento.participantes / 100) * 10);
      score += popularidadeScore;
    }

    // 5. Atualidade (peso: 5%)
    if (evento.dataInicio) {
      const dataEvento = new Date(evento.dataInicio);
      const hoje = new Date();
      const diasAteEvento = Math.floor((dataEvento - hoje) / (1000 * 60 * 60 * 24));
      
      // Eventos mais próximos têm score maior
      if (diasAteEvento >= 0 && diasAteEvento <= 30) {
        score += Math.max(0, 5 - (diasAteEvento / 6));
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  // Obter recomendações personalizadas
  async getRecommendations(limit = 10) {
    try {
      const userLocation = this.getUserLocation();
      const preferences = this.userPreferences;

      // Buscar todos os eventos
      const response = await buscarEventos();
      
      if (!response.success) {
        return {
          success: false,
          error: 'Erro ao buscar eventos',
          data: []
        };
      }

      // Calcular score para cada evento
      const eventosComScore = response.data.map(evento => ({
        ...evento,
        scoreRelevancia: this.calcularScoreRelevancia(evento, userLocation, preferences)
      }));

      // Ordenar por score e pegar os top N
      const recomendacoes = eventosComScore
        .sort((a, b) => b.scoreRelevancia - a.scoreRelevancia)
        .slice(0, limit);

      return {
        success: true,
        data: recomendacoes,
        total: recomendacoes.length
      };
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return {
        success: false,
        error: 'Erro ao gerar recomendações',
        data: []
      };
    }
  }

  // Obter eventos próximos ao CEP do usuário
  async getEventosProximos(raioKm = null) {
    try {
      const userLocation = this.getUserLocation();
      
      if (!userLocation || !userLocation.cep) {
        return {
          success: false,
          error: 'Localização do usuário não definida',
          data: []
        };
      }

      const raio = raioKm || this.userPreferences.raioMaximo;
      const response = await buscarEventos();
      
      if (!response.success) {
        return response;
      }

      // Filtrar eventos dentro do raio
      const eventosProximos = response.data.filter(evento => {
        const cepEvento = evento.endereco.match(/\d{5}-?\d{3}/)?.[0];
        if (!cepEvento) return false;

        const distancia = this.calcularDistancia(
          userLocation.cep.replace(/\D/g, ''),
          cepEvento.replace(/\D/g, '')
        );

        return distancia <= raio;
      });

      // Adicionar distância a cada evento
      const eventosComDistancia = eventosProximos.map(evento => {
        const cepEvento = evento.endereco.match(/\d{5}-?\d{3}/)?.[0];
        const distancia = this.calcularDistancia(
          userLocation.cep.replace(/\D/g, ''),
          cepEvento.replace(/\D/g, '')
        );

        return {
          ...evento,
          distancia: distancia.toFixed(1)
        };
      });

      // Ordenar por distância
      eventosComDistancia.sort((a, b) => parseFloat(a.distancia) - parseFloat(b.distancia));

      return {
        success: true,
        data: eventosComDistancia,
        total: eventosComDistancia.length
      };
    } catch (error) {
      console.error('Erro ao buscar eventos próximos:', error);
      return {
        success: false,
        error: 'Erro ao buscar eventos próximos',
        data: []
      };
    }
  }

  // Registrar interação do usuário (para melhorar recomendações)
  registrarInteracao(evento, tipoInteracao) {
    // tipoInteracao: 'visualizacao', 'curtida', 'participacao', 'compartilhamento'
    const interacoes = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    
    interacoes.push({
      eventoId: evento.id,
      categoria: evento.categoria,
      tipo: tipoInteracao,
      timestamp: new Date().toISOString()
    });

    // Manter apenas as últimas 100 interações
    if (interacoes.length > 100) {
      interacoes.shift();
    }

    localStorage.setItem('userInteractions', JSON.stringify(interacoes));

    // Atualizar categorias favoritas baseado nas interações
    this.atualizarCategoriasFavoritas(interacoes);
  }

  // Atualizar categorias favoritas baseado no histórico de interações
  atualizarCategoriasFavoritas(interacoes) {
    const contagemCategorias = {};

    interacoes.forEach(interacao => {
      if (!contagemCategorias[interacao.categoria]) {
        contagemCategorias[interacao.categoria] = 0;
      }
      contagemCategorias[interacao.categoria]++;
    });

    // Pegar as 3 categorias mais interagidas
    const categoriasFavoritas = Object.entries(contagemCategorias)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoria]) => categoria);

    this.saveUserPreferences({ categoriasFavoritas });
  }

  // Obter estatísticas de recomendação
  getRecommendationStats() {
    const interacoes = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    const userLocation = this.getUserLocation();

    return {
      totalInteracoes: interacoes.length,
      categoriasFavoritas: this.userPreferences.categoriasFavoritas,
      raioMaximo: this.userPreferences.raioMaximo,
      localizacaoDefinida: !!userLocation,
      ultimaInteracao: interacoes.length > 0 ? interacoes[interacoes.length - 1].timestamp : null
    };
  }
}

// Criar instância única do serviço
const recommendationService = new RecommendationService();

export default recommendationService;

// Exportar funções individuais
export const {
  setUserLocation,
  getUserLocation,
  getRecommendations,
  getEventosProximos,
  registrarInteracao,
  saveUserPreferences,
  getRecommendationStats
} = recommendationService;

