import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, AlertCircle, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { validarCEP } from '@/lib/cep';
import { buscarEventosPorTermo } from '@/services/api';

const GlobalSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    eventos: [],
    reclamacoes: [],
    ceps: []
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Buscar em múltiplas fontes usando a API
  useEffect(() => {
    if (query.length < 2) {
      setResults({ eventos: [], reclamacoes: [], ceps: [] });
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    // Debounce da busca
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery) => {
    try {
      // Verificar se é um CEP
      const isCEP = validarCEP(searchQuery.replace(/\D/g, ''));
      
      // Buscar eventos usando a API
      const eventosResponse = await buscarEventosPorTermo(searchQuery);
      
      const mockResults = {
        eventos: eventosResponse.success ? eventosResponse.data : [],
        reclamacoes: isCEP ? [] : [
          {
            id: 1,
            titulo: `Reclamação sobre "${searchQuery}"`,
            status: 'Em análise',
            data: '2024-10-08'
          }
        ],
        ceps: isCEP ? [
          {
            cep: searchQuery.replace(/\D/g, ''),
            endereco: 'Endereço encontrado'
          }
        ] : []
      };

      setResults(mockResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults({ eventos: [], reclamacoes: [], ceps: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    switch (type) {
      case 'evento':
        navigate(`/eventos/${item.id}`);
        break;
      case 'reclamacao':
        navigate(`/reclamacoes?id=${item.id}`);
        break;
      case 'cep':
        navigate(`/mapas`, { state: { cep: item.cep } });
        break;
    }
    if (onClose) onClose();
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'cultura': 'bg-purple-500',
      'esporte': 'bg-blue-500',
      'educacao': 'bg-green-500',
      'saude': 'bg-red-500',
      'meio ambiente': 'bg-emerald-500',
      'tecnologia': 'bg-cyan-500',
      'musica': 'bg-pink-500',
      'gastronomia': 'bg-orange-500',
      'arte': 'bg-indigo-500',
      'infraestrutura': 'bg-gray-500',
      'outros': 'bg-gray-500'
    };
    return colors[categoria?.toLowerCase()] || 'bg-gray-500';
  };

  const totalResults = results.eventos.length + results.reclamacoes.length + results.ceps.length;

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos, reclamações, CEP..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="h-6 w-6 p-0 ml-1"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {showResults && query.length >= 2 && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-lg">
          <CardContent className="p-4">
            {totalResults === 0 && !loading && (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado encontrado para "{query}"
                </p>
              </div>
            )}

            {/* Resultados de CEP */}
            {results.ceps.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  CEPs
                </h3>
                {results.ceps.map((cep, index) => (
                  <div
                    key={index}
                    onClick={() => handleResultClick('cep', cep)}
                    className="p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  >
                    <p className="font-medium">{cep.cep}</p>
                    <p className="text-sm text-muted-foreground">{cep.endereco}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Resultados de Eventos */}
            {results.eventos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Eventos
                </h3>
                {results.eventos.map((evento) => (
                  <div
                    key={evento.id}
                    onClick={() => handleResultClick('evento', evento)}
                    className="p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 bg-cover bg-center rounded flex-shrink-0"
                        style={{ backgroundImage: `url("${evento.imagem}")` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium line-clamp-1">{evento.titulo}</p>
                          <Badge 
                            className={`${getCategoryColor(evento.categoria)} text-white text-xs flex-shrink-0`}
                          >
                            {evento.categoria}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{evento.endereco}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resultados de Reclamações */}
            {results.reclamacoes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Reclamações
                </h3>
                {results.reclamacoes.map((reclamacao) => (
                  <div
                    key={reclamacao.id}
                    onClick={() => handleResultClick('reclamacao', reclamacao)}
                    className="p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{reclamacao.titulo}</p>
                      </div>
                      <Badge variant="outline">{reclamacao.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(reclamacao.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;

