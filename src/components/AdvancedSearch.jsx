import { useState } from 'react';
import PropTypes from 'prop-types'; // Adicionado para validação de props
import { Search, Filter, MapPin, Calendar, Tag, SlidersHorizontal, X } from 'lucide-react'; // 'User' removido
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdvancedSearch = ({ onSearch, onClose }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    location: '',
    dateRange: {
      from: null,
      to: null
    },
    status: '',
    priority: '',
    radius: [5], // km
    sortBy: 'relevance',
    includeResolved: true,
    onlyWithImages: false,
    minLikes: 0
  });

  const [activeFilters, setActiveFilters] = useState([]);

  const categories = [
    { value: 'infraestrutura', label: 'Infraestrutura' },
    { value: 'seguranca', label: 'Segurança' },
    { value: 'meio-ambiente', label: 'Meio Ambiente' },
    { value: 'mobilidade-urbana', label: 'Mobilidade Urbana' },
    { value: 'evento-comunitario', label: 'Evento Comunitário' },
    { value: 'iluminacao', label: 'Iluminação' },
    { value: 'limpeza', label: 'Limpeza' }
  ];

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'resolvido', label: 'Resolvido' },
    { value: 'rejeitado', label: 'Rejeitado' }
  ];

  const priorityOptions = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Média' },
    { value: 'baixa', label: 'Baixa' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevância' },
    { value: 'date', label: 'Data' },
    { value: 'likes', label: 'Curtidas' },
    { value: 'comments', label: 'Comentários' },
    { value: 'distance', label: 'Distância' }
  ];

  const updateSearchParam = (key, value) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateDateRange = (key, date) => {
    setSearchParams(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: date
      }
    }));
  };

  const addFilter = (type, value, label) => {
    const filterId = `${type}-${value}`;
    // Corrigido: Usando .some() ao invés de .find() para verificar a existência (melhor prática de linting)
    if (!activeFilters.some(f => f.id === filterId)) { 
      setActiveFilters(prev => [...prev, { id: filterId, type, value, label }]);
    }
  };

  const removeFilter = (filterId) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    
    // Limpar o valor correspondente nos parâmetros de busca
    const filter = activeFilters.find(f => f.id === filterId);
    if (filter) {
      updateSearchParam(filter.type, '');
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchParams({
      query: '',
      category: '',
      location: '',
      dateRange: { from: null, to: null },
      status: '',
      priority: '',
      radius: [5],
      sortBy: 'relevance',
      includeResolved: true,
      onlyWithImages: false,
      minLikes: 0
    });
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleQuickFilter = (type, value, label) => {
    updateSearchParam(type, value);
    addFilter(type, value, label);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Busca Avançada
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Barra de busca principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Digite palavras-chave, endereços ou descrições..."
            value={searchParams.query}
            onChange={(e) => updateSearchParam('query', e.target.value)}
            className="pl-10 text-base py-3"
          />
        </div>

        {/* Filtros rápidos */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Filtros Rápidos</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('status', 'pendente', 'Pendente')}
            >
              <Filter className="h-3 w-3 mr-1" />
              Pendentes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('priority', 'alta', 'Alta Prioridade')}
            >
              <Tag className="h-3 w-3 mr-1" />
              Alta Prioridade
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('category', 'infraestrutura', 'Infraestrutura')}
            >
              <Tag className="h-3 w-3 mr-1" />
              Infraestrutura
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearchParam('onlyWithImages', true)}
            >
              <Tag className="h-3 w-3 mr-1" />
              Com Fotos
            </Button>
          </div>
        </div>

        {/* Filtros ativos */}
        {activeFilters.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Filtros Ativos</Label>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Limpar Todos
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
                  {filter.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 p-0 hover:bg-transparent"
                    onClick={() => removeFilter(filter.id)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Filtros detalhados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Categoria */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Categoria</Label>
            <Select
              value={searchParams.category}
              onValueChange={(value) => {
                updateSearchParam('category', value);
                const category = categories.find(c => c.value === value);
                if (category) addFilter('category', value, category.label);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Status</Label>
            <Select
              value={searchParams.status}
              onValueChange={(value) => {
                updateSearchParam('status', value);
                const status = statusOptions.find(s => s.value === value);
                if (status) addFilter('status', value, status.label);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prioridade */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Prioridade</Label>
            <Select
              value={searchParams.priority}
              onValueChange={(value) => {
                updateSearchParam('priority', value);
                const priority = priorityOptions.find(p => p.value === value);
                if (priority) addFilter('priority', value, priority.label);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Localização e raio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Localização</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Digite um endereço ou CEP"
                value={searchParams.location}
                onChange={(e) => updateSearchParam('location', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Raio de busca: {searchParams.radius[0]} km
            </Label>
            <Slider
              value={searchParams.radius}
              onValueChange={(value) => updateSearchParam('radius', value)}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Período */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Período</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {searchParams.dateRange.from ? (
                    format(searchParams.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Data inicial"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={searchParams.dateRange.from}
                  onSelect={(date) => updateDateRange('from', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {searchParams.dateRange.to ? (
                    format(searchParams.dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Data final"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={searchParams.dateRange.to}
                  onSelect={(date) => updateDateRange('to', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Opções adicionais */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Opções Adicionais</Label>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includeResolved" className="text-sm">
              Incluir eventos resolvidos
            </Label>
            <Switch
              id="includeResolved"
              checked={searchParams.includeResolved}
              onCheckedChange={(checked) => updateSearchParam('includeResolved', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="onlyWithImages" className="text-sm">
              Apenas eventos com fotos
            </Label>
            <Switch
              id="onlyWithImages"
              checked={searchParams.onlyWithImages}
              onCheckedChange={(checked) => updateSearchParam('onlyWithImages', checked)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Mínimo de curtidas: {searchParams.minLikes}
            </Label>
            <Slider
              value={[searchParams.minLikes]}
              onValueChange={(value) => updateSearchParam('minLikes', value[0])}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Ordenação */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Ordenar por</Label>
          <Select
            value={searchParams.sortBy}
            onValueChange={(value) => updateSearchParam('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Botões de ação */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={clearAllFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar Eventos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Adicionado a validação de props
AdvancedSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdvancedSearch;