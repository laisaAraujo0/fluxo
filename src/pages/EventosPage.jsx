import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DetalheEvento from '@/components/DetalheEvento';
import RegistroEvento from '@/components/RegistroEvento';
import EventFilters from '@/components/EventFilters';
import EventCard from '@/components/EventCard';
import { useUser } from '@/contexts/UserContext';
import eventService from '@/services/eventService';
import { toast } from 'sonner';

const EventosPage = () => {
  const { user, isAuthenticated } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('lista');
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [sortBy, setSortBy] = useState('data');
  const [favoriteEvents, setFavoriteEvents] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState({});
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar eventos na inicialização
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setIsLoading(true);
    try {
      const allEvents = eventService.getAllEvents();
      setEventos(allEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  // Callback para quando um evento é atualizado (curtida, comentário)
  const handleEventoUpdate = (updatedEvent) => {
    setEventos(prevEventos => 
      prevEventos.map(evento => 
        evento.id === updatedEvent.id ? updatedEvent : evento
      )
    );
  };

  // Callback para quando um novo evento é adicionado
  const handleEventoAdicionado = (novoEvento) => {
    setEventos(prevEventos => [novoEvento, ...prevEventos]);
    toast.success('Evento adicionado com sucesso!');
  };

  // Filtrar e ordenar eventos
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = eventos.filter(evento => {
      const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evento.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !activeFilters.categoria || activeFilters.categoria === 'todos' || 
                             evento.categoria === activeFilters.categoria;
      
      const matchesLocation = !activeFilters.cidade || 
                             evento.endereco.toLowerCase().includes(activeFilters.cidade.toLowerCase());
      
      const matchesStatus = !activeFilters.status || activeFilters.status === 'todos' || 
                           evento.status === activeFilters.status.replace(' ', '_');
      
      const matchesDateStart = !activeFilters.dataInicio || 
                              new Date(evento.dataInicio) >= new Date(activeFilters.dataInicio);
      
      const matchesDateEnd = !activeFilters.dataFim || 
                            new Date(evento.dataInicio) <= new Date(activeFilters.dataFim);

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus && 
             matchesDateStart && matchesDateEnd;
    });

    // Ordenar eventos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'data':
          return new Date(b.createdAt) - new Date(a.createdAt); // Mais recentes primeiro
        case 'titulo':
          return a.titulo.localeCompare(b.titulo);
        case 'popularidade':
          return (b.curtidas?.length || 0) - (a.curtidas?.length || 0);
        case 'comentarios':
          return (b.comentarios?.length || 0) - (a.comentarios?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [eventos, searchTerm, activeFilters, sortBy]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters, sortBy]);

  const handleEventoClick = (evento) => {
    setEventoSelecionado(evento);
    setCurrentView('detalhes');
  };

  const handleNovoEvento = () => {
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para criar um evento');
      return;
    }
    setCurrentView('registro');
  };

  const handleVoltarLista = () => {
    setCurrentView('lista');
    setEventoSelecionado(null);
  };

  const handleToggleFavorite = (eventoId) => {
    setFavoriteEvents(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventoId)) {
        newFavorites.delete(eventoId);
      } else {
        newFavorites.add(eventoId);
      }
      return newFavorites;
    });
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  if (currentView === 'detalhes' && eventoSelecionado) {
    return (
      <DetalheEvento 
        evento={eventoSelecionado} 
        onVoltar={handleVoltarLista}
        onEventoUpdate={handleEventoUpdate}
      />
    );
  }

  if (currentView === 'registro') {
    return (
      <RegistroEvento 
        onVoltar={handleVoltarLista}
        onEventoAdicionado={handleEventoAdicionado}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Eventos da Comunidade
            </h1>
            <p className="mt-2 text-muted-foreground">
              Descubra e participe de eventos em sua região, ou crie novos eventos para sua comunidade.
            </p>
          </div>
          <Button 
            onClick={handleNovoEvento}
            className="flex items-center gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Novo Evento
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{eventos.length}</div>
            <div className="text-sm text-muted-foreground">Total de Eventos</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {eventos.filter(e => e.status === 'ativo').length}
            </div>
            <div className="text-sm text-muted-foreground">Eventos Ativos</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">
              {eventos.filter(e => e.status === 'pendente').length}
            </div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">
              {eventos.reduce((sum, e) => sum + (e.curtidas?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total de Curtidas</div>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data">Mais Recentes</SelectItem>
              <SelectItem value="titulo">Título A-Z</SelectItem>
              <SelectItem value="popularidade">Mais Curtidos</SelectItem>
              <SelectItem value="comentarios">Mais Comentados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros Avançados */}
        <EventFilters onFiltersApply={handleFiltersChange} />
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando eventos...</p>
          </div>
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                <Search className="h-full w-full" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Nenhum evento encontrado
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm || Object.keys(activeFilters).length > 0
                  ? 'Tente ajustar os filtros de pesquisa.'
                  : 'Seja o primeiro a criar um evento para sua comunidade!'}
              </p>
              {(!searchTerm && Object.keys(activeFilters).length === 0) && (
                <Button onClick={handleNovoEvento} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Evento
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Grid de Eventos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((evento) => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                  onEventoClick={handleEventoClick}
                  onEventoUpdate={handleEventoUpdate}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center space-x-2 mt-8">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventosPage;
