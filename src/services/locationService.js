// Service para gerenciar localização e CEP do usuário
class LocationService {
  constructor() {
    this.userLocation = this.loadUserLocation();
  }

  // Carregar localização do usuário do localStorage
  loadUserLocation() {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      return JSON.parse(savedLocation);
    }
    return null;
  }

  // Salvar localização do usuário no localStorage
  saveUserLocation(locationData) {
    this.userLocation = locationData;
    localStorage.setItem('userLocation', JSON.stringify(locationData));
  }

  // Obter localização atual do usuário
  getUserLocation() {
    return this.userLocation;
  }

  // Buscar informações de CEP via API
  async buscarCEP(cep) {
    try {
      // Limpar CEP (remover caracteres especiais)
      const cepLimpo = cep.replace(/\D/g, '');
      
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      // Usar API ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      // Buscar coordenadas usando Nominatim (OpenStreetMap)
      const coordenadas = await this.buscarCoordenadas(data);

      return {
        success: true,
        data: {
          cep: data.cep,
          endereco: {
            logradouro: data.logradouro,
            complemento: data.complemento,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
            ibge: data.ibge,
            gia: data.gia,
            ddd: data.ddd,
            siafi: data.siafi
          },
          coordenadas: coordenadas,
          enderecoCompleto: `${data.logradouro ? data.logradouro + ', ' : ''}${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar coordenadas geográficas usando Nominatim
  async buscarCoordenadas(enderecoData) {
    try {
      const query = `${enderecoData.logradouro || ''} ${enderecoData.bairro} ${enderecoData.localidade} ${enderecoData.uf} Brasil`.trim();
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&countrycodes=br`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar coordenadas');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        // Fallback: buscar apenas por cidade e estado
        const fallbackQuery = `${enderecoData.localidade} ${enderecoData.uf} Brasil`;
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1&countrycodes=br`
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.length > 0) {
            return {
              lat: parseFloat(fallbackData[0].lat),
              lng: parseFloat(fallbackData[0].lon),
              precisao: 'cidade'
            };
          }
        }
        
        // Coordenadas padrão para São Paulo se não encontrar
        return {
          lat: -23.5505,
          lng: -46.6333,
          precisao: 'padrao'
        };
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        precisao: 'endereco'
      };
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      // Retornar coordenadas padrão em caso de erro
      return {
        lat: -23.5505,
        lng: -46.6333,
        precisao: 'padrao'
      };
    }
  }

  // Definir localização do usuário por CEP
  async setUserLocationByCEP(cep) {
    const resultado = await this.buscarCEP(cep);
    
    if (resultado.success) {
      const locationData = {
        cep: resultado.data.cep,
        endereco: resultado.data.endereco,
        coordenadas: resultado.data.coordenadas,
        enderecoCompleto: resultado.data.enderecoCompleto,
        timestamp: new Date().toISOString(),
        tipo: 'cep'
      };
      
      this.saveUserLocation(locationData);
      return { success: true, data: locationData };
    }
    
    return resultado;
  }

  // Obter localização atual via GPS
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            // Buscar endereço usando reverse geocoding
            const endereco = await this.reverseGeocode(latitude, longitude);
            
            const locationData = {
              coordenadas: {
                lat: latitude,
                lng: longitude,
                precisao: accuracy
              },
              endereco: endereco,
              enderecoCompleto: endereco.enderecoCompleto,
              timestamp: new Date().toISOString(),
              tipo: 'gps'
            };
            
            this.saveUserLocation(locationData);
            resolve({ success: true, data: locationData });
          } catch (error) {
            resolve({
              success: true,
              data: {
                coordenadas: {
                  lat: latitude,
                  lng: longitude,
                  precisao: accuracy
                },
                endereco: null,
                enderecoCompleto: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                timestamp: new Date().toISOString(),
                tipo: 'gps'
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
              errorMessage = 'Timeout ao obter localização';
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
  }

  // Reverse geocoding - obter endereço a partir de coordenadas
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }

      const data = await response.json();
      
      if (!data.address) {
        throw new Error('Endereço não encontrado');
      }

      const address = data.address;
      
      return {
        logradouro: address.road || address.pedestrian || '',
        numero: address.house_number || '',
        bairro: address.neighbourhood || address.suburb || address.district || '',
        localidade: address.city || address.town || address.village || address.municipality || '',
        uf: address.state || '',
        cep: address.postcode || '',
        pais: address.country || 'Brasil',
        enderecoCompleto: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      return {
        logradouro: '',
        numero: '',
        bairro: '',
        localidade: 'Localização desconhecida',
        uf: '',
        cep: '',
        pais: 'Brasil',
        enderecoCompleto: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
      };
    }
  }

  // Calcular distância entre dois pontos (em km)
  calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Verificar se uma coordenada está dentro de um raio
  isWithinRadius(centerLat, centerLng, pointLat, pointLng, radiusKm) {
    const distance = this.calcularDistancia(centerLat, centerLng, pointLat, pointLng);
    return distance <= radiusKm;
  }

  // Limpar localização do usuário
  clearUserLocation() {
    this.userLocation = null;
    localStorage.removeItem('userLocation');
  }

  // Formatar CEP
  formatCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
    }
    return cep;
  }

  // Validar CEP
  isValidCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }

  // Obter sugestões de localização baseadas em texto
  async searchLocations(query) {
    try {
      if (!query || query.length < 3) {
        return { success: true, data: [] };
      }

      const encodedQuery = encodeURIComponent(`${query} Brasil`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&countrycodes=br&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar localizações');
      }

      const data = await response.json();
      
      const suggestions = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.address,
        type: item.type,
        importance: item.importance
      }));

      return { success: true, data: suggestions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Instância singleton
const locationService = new LocationService();

export default locationService;
