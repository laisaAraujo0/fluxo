import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Utilitário para busca de CEP usando a API ViaCEP com geolocalização
 */

/**
 * Busca informações de endereço pelo CEP
 * @param {string} cep - CEP a ser consultado (com ou sem formatação)
 * @returns {Promise<Object>} Dados do endereço ou erro
 */
export const buscarCEP = async (cep) => {
  try {
    // Remove caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Valida se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos');
    }
    
    // Valida se o CEP não é uma sequência inválida
    if (/^(\d)\1{7}$/.test(cepLimpo)) {
      throw new Error('CEP inválido');
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro na consulta do CEP');
    }
    
    const data = await response.json();
    
    // Verifica se o CEP foi encontrado
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      success: true,
      data: {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge,
        gia: data.gia,
        ddd: data.ddd,
        siafi: data.siafi,
        regiao: getRegiaoPorUF(data.uf),
        coordenadas: await buscarCoordenadas(data)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Busca coordenadas aproximadas baseadas no endereço
 * @param {Object} endereco - Dados do endereço
 * @returns {Promise<Object>} Coordenadas lat/lng
 */
const buscarCoordenadas = async (endereco) => {
  try {
    // Simular coordenadas baseadas na localidade (em produção, usar API de geocoding)
    const coordenadasCidades = {
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
      'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
      'Salvador': { lat: -12.9714, lng: -38.5014 },
      'Brasília': { lat: -15.7939, lng: -47.8828 },
      'Fortaleza': { lat: -3.7319, lng: -38.5267 },
      'Recife': { lat: -8.0476, lng: -34.8770 },
      'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
      'Manaus': { lat: -3.1190, lng: -60.0217 },
      'Curitiba': { lat: -25.4244, lng: -49.2654 }
    };
    
    const coordenadas = coordenadasCidades[endereco.localidade] || 
                       coordenadasCidades['São Paulo']; // Default
    
    return coordenadas;
  } catch (error) {
    return { lat: -23.5505, lng: -46.6333 }; // São Paulo como fallback
  }
};

/**
 * Determina a região do Brasil baseada na UF
 * @param {string} uf - Unidade Federativa
 * @returns {string} Nome da região
 */
const getRegiaoPorUF = (uf) => {
  const regioes = {
    'AC': 'Norte', 'AL': 'Nordeste', 'AP': 'Norte', 'AM': 'Norte',
    'BA': 'Nordeste', 'CE': 'Nordeste', 'DF': 'Centro-Oeste',
    'ES': 'Sudeste', 'GO': 'Centro-Oeste', 'MA': 'Nordeste',
    'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'MG': 'Sudeste',
    'PA': 'Norte', 'PB': 'Nordeste', 'PR': 'Sul', 'PE': 'Nordeste',
    'PI': 'Nordeste', 'RJ': 'Sudeste', 'RN': 'Nordeste',
    'RS': 'Sul', 'RO': 'Norte', 'RR': 'Norte', 'SC': 'Sul',
    'SP': 'Sudeste', 'SE': 'Nordeste', 'TO': 'Norte'
  };
  
  return regioes[uf] || 'Não identificada';
};

/**
 * Busca a localização atual do usuário
 * @returns {Promise<Object>} Coordenadas e endereço aproximado
 */
export const buscarLocalizacaoAtual = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Buscar CEP aproximado baseado nas coordenadas
          const endereco = await buscarEnderecoPorCoordenadas(latitude, longitude);
          
          resolve({
            success: true,
            data: {
              coordenadas: { lat: latitude, lng: longitude },
              endereco: endereco,
              precisao: position.coords.accuracy
            }
          });
        } catch (error) {
          resolve({
            success: true,
            data: {
              coordenadas: { lat: latitude, lng: longitude },
              endereco: null,
              precisao: position.coords.accuracy
            }
          });
        }
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout na obtenção da localização';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
};

/**
 * Busca endereço aproximado baseado em coordenadas
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Dados do endereço
 */
const buscarEnderecoPorCoordenadas = async (lat, lng) => {
  // Em produção, usar uma API de geocoding reverso
  // Por enquanto, simular baseado em coordenadas conhecidas
  const cidadesProximas = [
    { nome: 'São Paulo', lat: -23.5505, lng: -46.6333, uf: 'SP', cep: '01310-100' },
    { nome: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, uf: 'RJ', cep: '20040-020' },
    { nome: 'Belo Horizonte', lat: -19.9167, lng: -43.9345, uf: 'MG', cep: '30112-000' },
    { nome: 'Salvador', lat: -12.9714, lng: -38.5014, uf: 'BA', cep: '40070-110' },
    { nome: 'Brasília', lat: -15.7939, lng: -47.8828, uf: 'DF', cep: '70040-010' }
  ];
  
  // Encontrar a cidade mais próxima
  let cidadeMaisProxima = cidadesProximas[0];
  let menorDistancia = calcularDistancia(lat, lng, cidadeMaisProxima.lat, cidadeMaisProxima.lng);
  
  cidadesProximas.forEach(cidade => {
    const distancia = calcularDistancia(lat, lng, cidade.lat, cidade.lng);
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      cidadeMaisProxima = cidade;
    }
  });
  
  return {
    localidade: cidadeMaisProxima.nome,
    uf: cidadeMaisProxima.uf,
    cep: cidadeMaisProxima.cep,
    regiao: getRegiaoPorUF(cidadeMaisProxima.uf),
    distancia: Math.round(menorDistancia)
  };
};

/**
 * Calcula distância entre duas coordenadas em km
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} Distância em km
 */
const calcularDistancia = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Formata CEP para exibição (00000-000)
 * @param {string} cep - CEP a ser formatado
 * @returns {string} CEP formatado
 */
export const formatarCEP = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Valida formato de CEP
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} True se válido
 */
export const validarCEP = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8 && !/^(\d)\1{7}$/.test(cepLimpo);
};

/**
 * Busca CEPs por endereço (busca reversa)
 * @param {string} uf - Estado (2 letras)
 * @param {string} cidade - Nome da cidade
 * @param {string} logradouro - Nome da rua/avenida
 * @returns {Promise<Object>} Lista de CEPs encontrados
 */
export const buscarCEPPorEndereco = async (uf, cidade, logradouro) => {
  try {
    if (!uf || !cidade || !logradouro) {
      throw new Error('UF, cidade e logradouro são obrigatórios');
    }
    
    if (uf.length !== 2) {
      throw new Error('UF deve conter 2 caracteres');
    }
    
    if (logradouro.length < 3) {
      throw new Error('Logradouro deve conter pelo menos 3 caracteres');
    }
    
    const response = await fetch(
      `https://viacep.com.br/ws/${uf}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`
    );
    
    if (!response.ok) {
      throw new Error('Erro na consulta do endereço');
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Nenhum CEP encontrado para este endereço');
    }
    
    return {
      success: true,
      data: data.map(item => ({
        cep: item.cep,
        logradouro: item.logradouro,
        complemento: item.complemento,
        bairro: item.bairro,
        localidade: item.localidade,
        uf: item.uf,
        ibge: item.ibge,
        gia: item.gia,
        ddd: item.ddd,
        siafi: item.siafi,
        regiao: getRegiaoPorUF(item.uf)
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Busca eventos próximos baseados na localização
 * @param {Object} coordenadas - Coordenadas { lat, lng }
 * @param {number} raio - Raio de busca em km
 * @returns {Promise<Array>} Lista de eventos próximos
 */
export const buscarEventosProximos = async (coordenadas, raio = 10) => {
  // Simular eventos próximos baseados na localização
  const eventosSimulados = [
    {
      id: 1,
      titulo: 'Buraco na Rua Principal',
      coordenadas: { lat: coordenadas.lat + 0.01, lng: coordenadas.lng + 0.01 },
      categoria: 'infraestrutura',
      distancia: 1.2
    },
    {
      id: 2,
      titulo: 'Iluminação Defeituosa',
      coordenadas: { lat: coordenadas.lat - 0.005, lng: coordenadas.lng + 0.008 },
      categoria: 'infraestrutura',
      distancia: 0.8
    },
    {
      id: 3,
      titulo: 'Lixo Acumulado',
      coordenadas: { lat: coordenadas.lat + 0.008, lng: coordenadas.lng - 0.012 },
      categoria: 'limpeza',
      distancia: 1.5
    }
  ];
  
  return eventosSimulados.filter(evento => evento.distancia <= raio);
};

/**
 * Hook personalizado para busca de CEP com debounce e geolocalização
 * @param {number} delay - Delay em ms para o debounce (padrão: 500ms)
 * @returns {Object} Funções e estados para busca de CEP
 */
export const useCEP = (delay = 500) => {
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState(null);
  const [error, setError] = useState(null);
  const [localizacaoAtual, setLocalizacaoAtual] = useState(null);
  const timeoutRef = useRef(null);
  
  const buscar = useCallback(async (cep) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setError(null);
    
    if (!cep || cep.replace(/\D/g, '').length < 8) {
      setEndereco(null);
      return;
    }
    
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      const resultado = await buscarCEP(cep);
      
      if (resultado.success) {
        setEndereco(resultado.data);
        setError(null);
      } else {
        setEndereco(null);
        setError(resultado.error);
      }
      
      setLoading(false);
    }, delay);
  }, [delay]);
  
  const obterLocalizacaoAtual = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await buscarLocalizacaoAtual();
      if (resultado.success) {
        setLocalizacaoAtual(resultado.data);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const limpar = useCallback(() => {
    setEndereco(null);
    setError(null);
    setLoading(false);
    setLocalizacaoAtual(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    loading,
    endereco,
    error,
    localizacaoAtual,
    buscar,
    obterLocalizacaoAtual,
    limpar
  };
};
