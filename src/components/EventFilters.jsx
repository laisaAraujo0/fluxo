import { useState } from 'react';
import { Filter, Calendar, MapPin, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const EventFilters = ({ onFilterChange, activeFilters = {} }) => {
  const [filters, setFilters] = useState({
    categoria: activeFilters.categoria || '',
    dataInicio: activeFilters.dataInicio || '',
    dataFim: activeFilters.dataFim || '',
    cidade: activeFilters.cidade || '',
    raio: activeFilters.raio || '',
    status: activeFilters.status || ''
  });

  const categorias = [
    'Todos',
    'Cultura',
    'Esporte',
    'Educação',
    'Saúde',
    'Meio Ambiente',
    'Tecnologia',
    'Política',
    'Outros'
  ];

  const statusOptions = [
    'Todos',
    'Próximos',
    'Em andamento',
    'Finalizados'
  ];

  const raioOptions = [
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '25', label: '25 km' },
    { value: '50', label: '50 km' },
    { value: '100', label: '100 km' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      categoria: '',
      dataInicio: '',
      dataFim: '',
      cidade: '',
      raio: '',
      status: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>
            Refine sua busca por eventos usando os filtros abaixo
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 ">
          {/* Categoria */}
          <div className="space-y-2 pl-3">
            <Label htmlFor="categoria" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categoria
            </Label>
            <Select
              value={filters.categoria}
              onValueChange={(value) => handleFilterChange('categoria', value)}
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2 pl-3">
            <Label htmlFor="status" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status.toLowerCase()}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          <div className="space-y-2 pl-3">
            <Label htmlFor="dataInicio">Data Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={filters.dataInicio}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
            />
          </div>

          {/* Data Fim */}
          <div className="space-y-2 pl-3">
            <Label htmlFor="dataFim">Data Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={filters.dataFim}
              onChange={(e) => handleFilterChange('dataFim', e.target.value)}
            />
          </div>

          {/* Cidade */}
          <div className="space-y-2 pl-3">
            <Label htmlFor="cidade" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Cidade
            </Label>
            <Input
              id="cidade"
              placeholder="Digite a cidade"
              value={filters.cidade}
              onChange={(e) => handleFilterChange('cidade', e.target.value)}
            />
          </div>

          {/* Raio de Distância */}
          <div className="space-y-2 pl-3">
            <Label htmlFor="raio">Raio de Distância</Label>
            <Select
              value={filters.raio}
              onValueChange={(value) => handleFilterChange('raio', value)}
            >
              <SelectTrigger id="raio">
                <SelectValue placeholder="Selecione o raio" />
              </SelectTrigger>
              <SelectContent>
                {raioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* Filtros Ativos */}
          {activeFilterCount > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Filtros Ativos:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <Badge key={key} variant="secondary" className="gap-1">
                      {key}: {value}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange(key, '')}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventFilters;

