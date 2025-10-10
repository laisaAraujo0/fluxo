import { useState, useEffect } from 'react';
import { Sparkles, MapPin, TrendingUp, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EventCard from '@/components/EventCard';
import recommendationService from '@/services/recommendationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RecommendedEvents = ({ limit = 6 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendations();
    checkUserLocation();
  }, []);

  const checkUserLocation = () => {
    const location = recommendationService.getUserLocation();
    setUserLocation(location);
  };

  const loadRecommendations = async () => {
    setLoading(true);
    
    try {
      const response = await recommendationService.getRecommendations(limit);
      
      if (response.success) {
        setRecommendations(response.data);
      } else {
        toast.error('Erro ao carregar recomendações');
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      toast.error('Erro ao carregar recomendações');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (evento) => {
    // Registrar interação
    recommendationService.registrarInteracao(evento, 'visualizacao');
    navigate(`/eventos/${evento.id}`);
  };

  const handleConfigureLocation = () => {
    navigate('/perfil', { state: { tab: 'localizacao' } });
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Recomendado para Você
            </CardTitle>
            <CardDescription>
              {userLocation 
                ? `Eventos selecionados especialmente para sua região`
                : 'Configure sua localização para receber recomendações personalizadas'
              }
            </CardDescription>
          </div>
          
          {!userLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfigureLocation}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Configurar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {userLocation 
                ? 'Nenhuma recomendação disponível no momento'
                : 'Configure sua localização para receber recomendações personalizadas'
              }
            </p>
            {!userLocation && (
              <Button onClick={handleConfigureLocation}>
                <MapPin className="h-4 w-4 mr-2" />
                Configurar Localização
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((evento) => (
              <div key={evento.id} className="relative">
                <div onClick={() => handleEventClick(evento)}>
                  <EventCard evento={evento} />
                </div>
                
                {/* Badge de Score de Relevância */}
                {evento.scoreRelevancia && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge 
                      className={`${getScoreBadgeColor(evento.scoreRelevancia)} text-white`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {Math.round(evento.scoreRelevancia)}% match
                    </Badge>
                  </div>
                )}

                {/* Badge de Distância */}
                {evento.distancia && (
                  <div className="absolute top-12 right-2 z-10">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {evento.distancia} km
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botão para ver mais recomendações */}
        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/eventos', { state: { recomendacoes: true } })}
            >
              Ver Todas as Recomendações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedEvents;

