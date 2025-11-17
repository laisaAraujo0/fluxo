import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Loader2, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import locationService from '@/services/locationService';

const CEPInput = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Carregar localização salva do usuário
    const savedLocation = locationService.getUserLocation();
    setUserLocation(savedLocation);
  }, []);

  const formatCEP = (value) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (digits.length <= 5) {
      return digits;
    } else {
      return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
    }
  };

  const handleCEPChange = (e) => {
    const formattedCEP = formatCEP(e.target.value);
    setCep(formattedCEP);
  };

  const handleCEPSubmit = async (e) => {
    e.preventDefault();
    
    if (!cep.trim()) {
      toast.error('Digite um CEP válido');
      return;
    }

    if (!locationService.isValidCEP(cep)) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setIsLoading(true);

    try {
      const resultado = await locationService.setUserLocationByCEP(cep);
      
      if (resultado.success) {
        setUserLocation(resultado.data);
        setIsOpen(false);
        setCep('');
        
        // Navegar para a página de mapas com os dados do CEP
        navigate('/mapas', {
          state: {
            cep: resultado.data.cep,
            endereco: resultado.data.endereco,
            coordenadas: resultado.data.coordenadas,
            centralizarMapa: true,
            localizacaoAtual: false
          }
        });
        
        toast.success(`Localização definida: ${resultado.data.endereco.localidade}, ${resultado.data.endereco.uf}`);
      } else {
        toast.error(resultado.error || 'Erro ao buscar CEP');
      }
    } catch (error) {
      toast.error('Erro ao processar CEP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const resultado = await locationService.getCurrentPosition();
      
      if (resultado.success) {
        setUserLocation(resultado.data);
        setIsOpen(false);
        
        // Navegar para a página de mapas com a localização atual
        navigate('/mapas', {
          state: {
            endereco: resultado.data.endereco,
            coordenadas: resultado.data.coordenadas,
            centralizarMapa: true,
            localizacaoAtual: true
          }
        });
        
        toast.success('Localização atual obtida com sucesso!');
      } else {
        toast.error(resultado.error || 'Erro ao obter localização');
      }
    } catch (error) {
      toast.error('Erro ao obter localização atual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLocation = () => {
    locationService.clearUserLocation();
    setUserLocation(null);
    toast.info('Localização removida');
  };

  const handleLocationClick = () => {
    if (userLocation && userLocation.coordenadas) {
      // Navegar para a página de mapas com a localização salva
      navigate('/mapas', {
        state: {
          cep: userLocation.cep,
          endereco: userLocation.endereco,
          coordenadas: userLocation.coordenadas,
          centralizarMapa: true,
          localizacaoAtual: userLocation.tipo === 'gps'
        }
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Exibir localização atual se existir */}
      {userLocation && (
        <div className="hidden sm:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLocationClick}
            className="flex items-center space-x-2 text-xs max-w-[200px] truncate"
          >
            <MapPin className="h-3 w-3 text-primary" />
            <span className="truncate">
              {userLocation.endereco?.localidade || 'Localização'}, {userLocation.endereco?.uf || ''}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearLocation}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Popover de entrada de CEP */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">
              {userLocation ? 'Alterar' : 'Definir'} Localização
            </span>
            <span className="sm:hidden">CEP</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Definir Localização</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Digite seu CEP para personalizar os eventos e mapas da sua região
              </p>
            </div>

            {/* Formulário de CEP */}
            <form onSubmit={handleCEPSubmit} className="space-y-3">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Digite seu CEP (ex: 01310-100)"
                  value={cep}
                  onChange={handleCEPChange}
                  maxLength={9}
                  className="pr-10"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !cep.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Definir Localização
                  </>
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Botão de localização atual */}
            <Button
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obtendo...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  Usar Localização Atual
                </>
              )}
            </Button>

            {/* Informações sobre a localização atual */}
            {userLocation && (
              <div className="border-t pt-3">
                <div className="text-xs text-muted-foreground mb-2">
                  Localização atual:
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {userLocation.tipo === 'gps' ? 'GPS' : 'CEP'}
                    </Badge>
                    <span className="text-xs truncate max-w-[150px]">
                      {userLocation.endereco?.localidade}, {userLocation.endereco?.uf}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearLocation}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CEPInput;
