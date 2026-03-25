import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Filter, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DetalheEvento from '@/components/DetalheEvento';
import RegistroEvento from '@/components/RegistroEvento';
import EventCard from '@/components/EventCard';
import { useUser } from '@/contexts/UserContext';
import eventService from '@/services/eventService';
import { subscribeToBroadcast, unsubscribeFromBroadcast } from '@/services/socketService';
import { toast } from 'sonner';

const EventosPage = () => {
  const { isAuthenticated } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('lista');
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [sortBy, setSortBy] = useState('data');
  const [activeFilters, setActiveFilters] = useState({});
  const [eventos, setEventos] = useState([]);
  const [eventoParaEditar, setEventoParaEditar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros temporários
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    categoria: '',
    cidade: '',
    status: '',
    dataInicio: '',
    dataFim: '',
  });

  // ======== CARREGAMENTO E SOCKET ========
  useEffect(() => {
    loadEvents();
    subscribeToBroadcast('event:new', handleNewEventBroadcast);
    subscribeToBroadcast('event:updated', handleUpdatedEventBroadcast);
    subscribeToBroadcast('event:deleted', handleDeletedEventBroadcast);

    return () => {
      unsubscribeFromBroadcast('event:new', handleNewEventBroadcast);
      unsubscribeFromBroadcast('event:updated', handleUpdatedEventBroadcast);
      unsubscribeFromBroadcast('event:deleted', handleDeletedEventBroadcast);
    };
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

  const handleNewEventBroadcast = (novoEvento) => {
    setEventos((prev) => [novoEvento, ...prev]);
    toast.info(`Novo Evento Criado: ${novoEvento.title}`);
  };

  const handleUpdatedEventBroadcast = (updatedEvent) => {
    setEventos((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    toast.info(`Evento Atualizado: ${updatedEvent.title}`);
  };

  const handleDeletedEventBroadcast = ({ id }) => {
    setEventos((prev) => prev.filter((e) => e.id !== id));
    toast.warning('Evento Removido.');
  };

  // ======== FILTRAGEM E ORDENAÇÃO ========
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = eventos.filter((evento) => {
      const matchesSearch =
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        !activeFilters.categoria ||
        activeFilters.categoria === 'todos' ||
        evento.categoria === activeFilters.categoria;

      const matchesLocation =
        !activeFilters.cidade ||
        evento.endereco.toLowerCase().includes(activeFilters.cidade.toLowerCase());

      const matchesStatus =
        !activeFilters.status ||
        activeFilters.status === 'todos' ||
        evento.status === activeFilters.status.replace(' ', '_');

      const matchesDateStart =
        !activeFilters.dataInicio ||
        new Date(evento.dataInicio) >= new Date(activeFilters.dataInicio);

      const matchesDateEnd =
        !activeFilters.dataFim || new Date(evento.dataInicio) <= new Date(activeFilters.dataFim);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesStatus &&
        matchesDateStart &&
        matchesDateEnd
      );
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'data':
          return new Date(b.createdAt) - new Date(a.createdAt);
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

  const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters, sortBy]);

  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
    setIsFiltersVisible(false);
  };

  const handleInputChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  // ======== NAVEGAÇÃO ========
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
    setEventoParaEditar(null);
  };

  const handleVerDetalhes = (evento) => {
    setEventoSelecionado(evento);
    setCurrentView('detalhes');
  };

  const handleEventoAdicionado = (novoEvento) => {
    if (eventoParaEditar) {
      setEventos((prev) => prev.map((e) => (e.id === novoEvento.id ? novoEvento : e)));
      setEventoParaEditar(null);
      toast.success('Evento atualizado com sucesso!');
      handleVoltarLista();
      return;
    }
    setEventos((prev) => [novoEvento, ...prev]);
    toast.success('Evento adicionado com sucesso!');
  };

  // ======== RENDERIZAÇÃO DAS TELAS ========
  if (currentView === 'detalhes' && eventoSelecionado) {
    return (
      <DetalheEvento
        evento={eventoSelecionado}
        onVoltar={handleVoltarLista}
        onEventoUpdate={(e) =>
          setEventos((prev) => prev.map((ev) => (ev.id === e.id ? e : ev)))
        }
      />
    );
  }

  if (currentView === 'registro') {
    return (
      <RegistroEvento
        onVoltar={handleVoltarLista}
        onEventoAdicionado={handleEventoAdicionado}
        eventoParaEditar={eventoParaEditar}
      />
    );
  }

  // ======== PÁGINA PRINCIPAL ========
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Eventos da Comunidade</h1>
          <p className="mt-2 text-muted-foreground">
            Descubra e participe de eventos em sua região, ou crie novos eventos para sua comunidade.
          </p>
        </div>
        <Button onClick={handleNovoEvento} className="flex items-center gap-2" size="lg">
          <Plus className="h-5 w-5" /> Novo Evento
        </Button>
      </div>

      {/* Estatísticas */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="bg-card p-4 rounded-xl border shadow text-center w-full">
    <div className="text-xl font-bold text-primary">{eventos.length}</div>
    <div className="text-sm text-muted-foreground mt-1">Total de Eventos</div>
  </div>

  <div className="bg-card p-4 rounded-xl border shadow text-center w-full">
    <div className="text-xl font-bold text-green-600">
      {eventos.filter(e => e.status === 'ativo').length}
    </div>
    <div className="text-sm text-muted-foreground mt-1">Eventos Ativos</div>
  </div>

  <div className="bg-card p-4 rounded-xl border shadow text-center w-full">
    <div className="text-xl font-bold text-yellow-600">
      {eventos.filter(e => e.status === 'pendente').length}
    </div>
    <div className="text-sm text-muted-foreground mt-1">Pendentes</div>
  </div>
</div>


      {/* Barra de Pesquisa + Ordenação + Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4 mt-6">
        <div className="flex-1 min-w-240px relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Mais recentes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data">Mais Recentes</SelectItem>
            <SelectItem value="titulo">Título A-Z</SelectItem>
            <SelectItem value="popularidade">Mais Curtidos</SelectItem>
            <SelectItem value="comentarios">Mais Comentados</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="flex items-center gap-2 bg-white text-black dark:bg-gray-900 hover:bg-gray-300 rounded-lg shadow-sm border"
        >
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      {/* Painel de Filtros */}
      {isFiltersVisible && (
        <div className="bg-card border rounded-xl p-4 md:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            {/* Categoria */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
              <Select
                value={tempFilters.categoria}
                onValueChange={(v) => handleInputChange('categoria', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Cultura">Cultura</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Esportes">Esportes</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Cidade</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite uma cidade"
                  value={tempFilters.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Status</label>
              <Select
                value={tempFilters.status}
                onValueChange={(v) => handleInputChange('status', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Início */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Data Início</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={tempFilters.dataInicio}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Data Fim */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Data Fim</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={tempFilters.dataFim}
                  onChange={(e) => handleInputChange('dataFim', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <Button
              onClick={handleApplyFilters}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-200 text-black dark:bg-gray-900 hover:bg-gray-300"
            >
              <Filter className="h-4 w-4" /> Aplicar Filtros
            </Button>
          </div>
        </div>
      )}

      {/* 🔹 Lista de eventos */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando eventos...</p>
          </div>
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum evento encontrado</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm || Object.keys(activeFilters).length > 0
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Seja o primeiro a criar um evento para sua comunidade!'}
            </p>
            {!searchTerm && Object.keys(activeFilters).length === 0 && (
              <Button onClick={handleNovoEvento} className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Criar Primeiro Evento
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((evento) => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                  onEventoClick={() => handleVerDetalhes(evento)}
                  onEventoUpdate={(e) =>
                    setEventos((prev) => prev.map((ev) => (ev.id === e.id ? e : ev)))
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
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
