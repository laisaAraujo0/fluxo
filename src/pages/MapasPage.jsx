import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Filter, Search, Navigation, Layers, Info, Eye, Heart, MessageCircle, Calendar, User, Zap, Plus, Minus, Settings, Target, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BuscaCEP from '@/components/BuscaCEP';
import MapaAvancado from '@/components/MapaAvancado';
import locationService from '@/services/locationService';
import eventService from '@/services/eventService';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const MapasPage = () => {
  const { user, isAuthenticated } = useUser();
  const location = useLocation();
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({
    categoria: '',
    status: '',
    raio: [10], // km
    mostrarResolvidos: true,
    busca: '',
    prioridade: ''
  });
  const [localizacaoAtual, setLocalizacaoAtual] = useState(null);
  const [dadosCEP, setDadosCEP] = useState(null);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState('mapa');
  const [mostrarRaio, setMostrarRaio] = useState(true);
  const [coordenadasCentralizar, setCoorenadasCentralizar] = useState(null);
  const mapRef = useRef(null);

  // Carregar eventos do eventService
  useEffect(() => {
    const eventosCarregados = eventService.getAllEvents();
    
    // Adicionar coordenadas simuladas aos eventos se não tiverem
    const eventosComCoordenadas = eventosCarregados.map(evento => {
      if (!evento.coordenadas) {
        // Gerar coordenadas aleatórias próximas a São Paulo
        const baseLat = -23.5505;
        const baseLng = -46.6333;
        const randomLat = baseLat + (Math.random() - 0.5) * 0.1;
        const randomLng = baseLng + (Math.random() - 0.5) * 0.1;
        
        return {
          ...evento,
          coordenadas: {
            lat: randomLat,
            lng: randomLng
          }
        };
      }
      return evento;
    });
    
    setEventos(eventosComCoordenadas);
    setEventosFiltrados(eventosComCoordenadas);
  }, []);

  // Carregar localização salva do usuário
  useEffect(() => {
    const savedLocation = locationService.getUserLocation();
    if (savedLocation) {
      setLocalizacaoAtual(savedLocation);
      if (savedLocation.coordenadas) {
        setCoorenadasCentralizar(savedLocation.coordenadas);
      }
    }
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, eventos]);

  // Processar dados recebidos via navegação (CEP do Navbar)
  useEffect(() => {
    if (location.state) {
      const { cep, endereco, coordenadas, centralizarMapa, localizacaoAtual: isCurrentLocation } = location.state;
      
      if (centralizarMapa && coordenadas) {
        // Configurar dados do CEP para exibição no mapa
        if (isCurrentLocation) {
          setLocalizacaoAtual({
            coordenadas: {
              lat: coordenadas.lat,
              lng: coordenadas.lng,
              precisao: coordenadas.precisao || 50
            },
            endereco,
            timestamp: new Date().toISOString(),
            tipo: 'gps'
          });
        } else {
          setDadosCEP({ 
            cep, 
            endereco, 
            coordenadas: {
              lat: coordenadas.lat,
              lng: coordenadas.lng,
              precisao: coordenadas.precisao || 'cep'
            }
          });
        }
        
        // Centralizar mapa nas coordenadas
        setCoorenadasCentralizar({
          lat: coordenadas.lat,
          lng: coordenadas.lng
        });
        
        // Filtrar eventos próximos
        filtrarEventosProximos(coordenadas.lat, coordenadas.lng, filtros.raio[0]);
        
        // Mostrar toast informativo
        const cidade = endereco?.localidade || 'localização';
        const uf = endereco?.uf || '';
        const tipoMsg = isCurrentLocation ? 'Localização atual obtida' : 'Mapa centralizado';
        toast.success(`${tipoMsg}: ${cidade}${uf ? `, ${uf}` : ''}`);
        
        // Limpar o state para evitar re-execução
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, filtros.raio]);

  const aplicarFiltros = () => {
    let eventosFiltrados = [...eventos];

    // Filtro por busca
    if (filtros.busca) {
      eventosFiltrados = eventosFiltrados.filter(evento => 
        evento.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        evento.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        evento.endereco?.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    // Filtro por categoria
    if (filtros.categoria) {
      eventosFiltrados = eventosFiltrados.filter(evento => evento.categoria === filtros.categoria);
    }

    // Filtro por status
    if (filtros.status) {
      eventosFiltrados = eventosFiltrados.filter(evento => evento.status === filtros.status);
    }

    // Filtro por prioridade
    if (filtros.prioridade) {
      eventosFiltrados = eventosFiltrados.filter(evento => evento.prioridade === filtros.prioridade);
    }

    // Filtro para mostrar/ocultar resolvidos
    if (!filtros.mostrarResolvidos) {
      eventosFiltrados = eventosFiltrados.filter(evento => evento.status !== 'resolvido');
    }

    // Filtro por raio (se houver localização atual ou CEP)
    const coordenadasReferencia = coordenadasCentralizar || localizacaoAtual?.coordenadas;
    if (coordenadasReferencia && filtros.raio[0] < 50) {
      eventosFiltrados = eventosFiltrados.filter(evento => {
        if (!evento.coordenadas) return false;
        
        const distancia = locationService.calcularDistancia(
          coordenadasReferencia.lat,
          coordenadasReferencia.lng,
          evento.coordenadas.lat,
          evento.coordenadas.lng
        );
        return distancia <= filtros.raio[0];
      });
    }

    // Priorizar eventos próximos
    if (coordenadasReferencia) {
      eventosFiltrados = eventosFiltrados.sort((a, b) => {
        if (!a.coordenadas || !b.coordenadas) return 0;
        
        const distanciaA = locationService.calcularDistancia(
          coordenadasReferencia.lat,
          coordenadasReferencia.lng,
          a.coordenadas.lat,
          a.coordenadas.lng
        );
        const distanciaB = locationService.calcularDistancia(
          coordenadasReferencia.lat,
          coordenadasReferencia.lng,
          b.coordenadas.lat,
          b.coordenadas.lng
        );
        return distanciaA - distanciaB;
      });
    }

    setEventosFiltrados(eventosFiltrados);
  };

  const filtrarEventosProximos = (lat, lng, raioKm) => {
    const eventosProximos = eventos.filter(evento => {
      if (!evento.coordenadas) return false;
      
      const distancia = locationService.calcularDistancia(
        lat, lng,
        evento.coordenadas.lat,
        evento.coordenadas.lng
      );
      return distancia <= raioKm;
    });
    
    if (eventosProximos.length > 0) {
      setEventosFiltrados(eventosProximos);
      toast.info(`${eventosProximos.length} eventos encontrados na região`);
    } else {
      toast.info('Nenhum evento encontrado nesta região');
    }
  };

  const handleObterLocalizacao = async () => {
    setLoading(true);
    try {
      const resultado = await locationService.getCurrentPosition();
      if (resultado.success) {
        setLocalizacaoAtual(resultado.data);
        setCoorenadasCentralizar(resultado.data.coordenadas);
        
        // Filtrar eventos próximos
        filtrarEventosProximos(
          resultado.data.coordenadas.lat,
          resultado.data.coordenadas.lng,
          filtros.raio[0]
        );
        
        toast.success('Localização obtida com sucesso!');
      } else {
        toast.error(resultado.error || 'Erro ao obter localização');
      }
    } catch (error) {
      toast.error('Erro ao obter localização atual');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getCategoriaColor = (categoria) => {
    const cores = {
      'infraestrutura': 'bg-blue-500',
      'seguranca': 'bg-red-500',
      'meio-ambiente': 'bg-green-500',
      'limpeza': 'bg-purple-500',
      'saneamento': 'bg-cyan-500',
      'mobilidade': 'bg-yellow-500',
      'outros': 'bg-gray-500'
    };
    return cores[categoria] || 'bg-gray-500';
  };

  const getStatusColor = (status) => {
    const cores = {
      'pendente': 'bg-yellow-500',
      'em_andamento': 'bg-blue-500',
      'resolvido': 'bg-green-500',
      'rejeitado': 'bg-red-500'
    };
    return cores[status] || 'bg-gray-500';
  };

  const getPrioridadeColor = (prioridade) => {
    const cores = {
      'alta': 'text-red-600',
      'urgente': 'text-red-700',
      'media': 'text-yellow-600',
      'baixa': 'text-green-600'
    };
    return cores[prioridade] || 'text-gray-600';
  };

  const handleEventoSelecionado = (evento) => {
    setEventoSelecionado(evento);
    console.log('Evento selecionado:', evento);
  };

  const limparFiltros = () => {
    setFiltros({
      categoria: '',
      status: '',
      raio: [10],
      mostrarResolvidos: true,
      busca: '',
      prioridade: ''
    });
    setEventoSelecionado(null);
  };

  const handleCentralizarMapa = () => {
    if (coordenadasCentralizar) {
      // Trigger re-render do mapa com centralização
      setCoorenadasCentralizar({ ...coordenadasCentralizar });
      toast.info('Mapa centralizado');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Mapa de Eventos
            </h2>
            <div className="space-y-1">
              <p className="text-muted-foreground">
                Visualize eventos reportados na sua região em tempo real
              </p>
              {(dadosCEP || localizacaoAtual) && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${localizacaoAtual ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                  <p className={`text-sm font-medium ${localizacaoAtual ? 'text-blue-600' : 'text-orange-600'}`}>
                    {localizacaoAtual ? 'Sua localização: ' : 'Centralizado em: '}
                    {(localizacaoAtual?.endereco?.localidade || dadosCEP?.endereco?.localidade)}, {' '}
                    {(localizacaoAtual?.endereco?.uf || dadosCEP?.endereco?.uf)}
                    {dadosCEP?.cep && ` - CEP ${dadosCEP.cep}`}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={modoVisualizacao === 'mapa' ? 'default' : 'outline'}
              onClick={() => setModoVisualizacao('mapa')}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Mapa
            </Button>
            <Button
              variant={modoVisualizacao === 'lista' ? 'default' : 'outline'}
              onClick={() => setModoVisualizacao('lista')}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Lista
            </Button>
          </div>
        </div>

        {/* Barra de busca e controles */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos por título, descrição ou endereço..."
                  value={filtros.busca}
                  onChange={(e) => handleFiltroChange('busca', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleObterLocalizacao}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {loading ? 'Obtendo...' : 'Minha Localização'}
                </Button>
                
                {coordenadasCentralizar && (
                  <Button
                    variant="outline"
                    onClick={handleCentralizarMapa}
                    className="flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Centralizar
                  </Button>
                )}
                
                
                <Sheet>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filtros Avançados</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      {/* Raio de busca */}
                      {coordenadasCentralizar && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Raio de busca: {filtros.raio[0]}km
                          </Label>
                          <Slider
                            value={filtros.raio}
                            onValueChange={(value) => handleFiltroChange('raio', value)}
                            max={50}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>1km</span>
                            <span>50km</span>
                          </div>
                        </div>
                      )}

                      {/* Mostrar raio no mapa */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mostrar-raio" className="text-sm">
                          Mostrar raio no mapa
                        </Label>
                        <Switch
                          id="mostrar-raio"
                          checked={mostrarRaio}
                          onCheckedChange={setMostrarRaio}
                        />
                      </div>

                      <Separator />

                      {/* Categoria */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Categoria</Label>
                        <Select
                          value={filtros.categoria}
                          onValueChange={(value) => handleFiltroChange('categoria', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as categorias" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas as categorias</SelectItem>
                            <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                            <SelectItem value="seguranca">Segurança</SelectItem>
                            <SelectItem value="meio-ambiente">Meio Ambiente</SelectItem>
                            <SelectItem value="limpeza">Limpeza</SelectItem>
                            <SelectItem value="saneamento">Saneamento</SelectItem>
                            <SelectItem value="mobilidade">Mobilidade</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Status</Label>
                        <Select
                          value={filtros.status}
                          onValueChange={(value) => handleFiltroChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos os status</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="resolvido">Resolvido</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Prioridade */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Prioridade</Label>
                        <Select
                          value={filtros.prioridade}
                          onValueChange={(value) => handleFiltroChange('prioridade', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as prioridades" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas as prioridades</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mostrar resolvidos */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mostrar-resolvidos" className="text-sm">
                          Mostrar resolvidos
                        </Label>
                        <Switch
                          id="mostrar-resolvidos"
                          checked={filtros.mostrarResolvidos}
                          onCheckedChange={(checked) => handleFiltroChange('mostrarResolvidos', checked)}
                        />
                      </div>

                      <Separator />

                      <Button variant="outline" onClick={limparFiltros} className="w-full">
                        Limpar Filtros
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Estatísticas */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total de eventos:</span>
                  <span className="font-medium">{eventos.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Filtrados:</span>
                  <span className="font-medium text-blue-600">{eventosFiltrados.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Pendentes:</span>
                  <span className="font-medium text-yellow-600">
                    {eventosFiltrados.filter(e => e.status === 'pendente').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Em andamento:</span>
                  <span className="font-medium text-blue-600">
                    {eventosFiltrados.filter(e => e.status === 'em_andamento').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Resolvidos:</span>
                  <span className="font-medium text-green-600">
                    {eventosFiltrados.filter(e => e.status === 'resolvido').length}
                  </span>
                </div>
                
                {coordenadasCentralizar && (
                  <>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Raio de busca:</span>
                        <span>{filtros.raio[0]}km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Localização:</span>
                        <span>
                          {localizacaoAtual ? 'GPS' : 'CEP'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-3">
            <Tabs value={modoVisualizacao} onValueChange={setModoVisualizacao} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mapa">Visualização em Mapa</TabsTrigger>
                <TabsTrigger value="lista">Visualização em Lista</TabsTrigger>
              </TabsList>

              {/* Tab do Mapa */}
              <TabsContent value="mapa" className="space-y-4">
                <MapaAvancado
                  eventos={eventosFiltrados}
                  coordenadasCentralizar={coordenadasCentralizar}
                  localizacaoAtual={localizacaoAtual}
                  dadosCEP={dadosCEP}
                  onEventoSelecionado={handleEventoSelecionado}
                  altura="600px"
                  zoom={13}
                  mostrarRaio={mostrarRaio}
                  raioKm={filtros.raio[0]}
                />

                {/* Detalhes do evento selecionado */}
                {eventoSelecionado && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{eventoSelecionado.titulo}</CardTitle>
                          <CardDescription>{eventoSelecionado.endereco}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEventoSelecionado(null)}>
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm">{eventoSelecionado.descricao}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{eventoSelecionado.categoria}</Badge>
                          <Badge variant={eventoSelecionado.status === 'resolvido' ? 'default' : 'outline'}>
                            {eventoSelecionado.status.replace('_', ' ')}
                          </Badge>
                          {eventoSelecionado.prioridade && (
                            <Badge variant="outline" className={getPrioridadeColor(eventoSelecionado.prioridade)}>
                              {eventoSelecionado.prioridade}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{eventoSelecionado.visualizacoes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span>{eventoSelecionado.curtidas?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span>{eventoSelecionado.comentarios?.length || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{eventoSelecionado.autorNome || 'Usuário'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(eventoSelecionado.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        <Button className="w-full">
                          Ver Detalhes Completos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab da Lista */}
              <TabsContent value="lista" className="space-y-4">
                {eventosFiltrados.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum evento encontrado com os filtros aplicados.
                      </p>
                      <Button variant="outline" onClick={limparFiltros} className="mt-4">
                        Limpar Filtros
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventosFiltrados.map((evento) => (
                      <Card key={evento.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEventoSelecionado(evento)}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{evento.titulo}</CardTitle>
                              <CardDescription className="text-xs">{evento.endereco}</CardDescription>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(evento.status)}`} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {evento.descricao}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            <Badge variant="secondary" className="text-xs">{evento.categoria}</Badge>
                            {evento.prioridade && (
                              <Badge variant="outline" className={`text-xs ${getPrioridadeColor(evento.prioridade)}`}>
                                {evento.prioridade}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {evento.visualizacoes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {evento.curtidas?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {evento.comentarios?.length || 0}
                              </span>
                            </div>
                            <span>{new Date(evento.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Integração com Busca de CEP */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Buscar Eventos por Localização</CardTitle>
            <CardDescription>
              Use a busca por CEP para encontrar eventos em uma localização específica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BuscaCEP 
              showEventosProximos={true}
              onEnderecoSelecionado={async (endereco) => {
                console.log('Endereço selecionado:', endereco);
                
                try {
                  // Buscar coordenadas para o endereço
                  const resultado = await locationService.buscarCEP(endereco.cep);
                  
                  if (resultado.success) {
                    setDadosCEP(resultado.data);
                    setCoorenadasCentralizar(resultado.data.coordenadas);
                    
                    // Filtrar eventos próximos
                    filtrarEventosProximos(
                      resultado.data.coordenadas.lat,
                      resultado.data.coordenadas.lng,
                      filtros.raio[0]
                    );
                    
                    toast.success(`Buscando eventos em ${endereco.localidade}, ${endereco.uf}`);
                  } else {
                    toast.error('Erro ao buscar coordenadas do CEP');
                  }
                } catch (error) {
                  toast.error('Erro ao processar localização');
                }
              }}
            />
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default MapasPage;
