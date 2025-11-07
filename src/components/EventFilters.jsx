import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Calendar, MapPin, Filter } from 'lucide-react';

const EventFilters = ({ onFiltersApply }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    categoria: '',
    cidade: '',
    status: '',
    dataInicio: '',
    dataFim: '',
  });

  const handleInputChange = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    if (onFiltersApply) onFiltersApply(tempFilters);
    setIsVisible(false); // fecha painel ao aplicar
  };

  return (
    <div className="relative">
      {/* Botão para mostrar filtros */}
      <Button onClick={() => setIsVisible(!isVisible)} className="flex items-center gap-2 mb-4 bg-white text-black dark:bg-gray-900 hover:bg-gray-300">
        <Filter className="h-3 w-4" /> Filtros
      </Button>

      <div className="relative">
        {/* Painel de filtros — só aparece quando isVisible = true */}
        {isVisible && (
          <div className="bg-card border rounded-xl p-4 md:p-6 shadow-sm">
            {/* Grid responsivo */}
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
            {/* Botão Aplicar */}
            <div className="flex justify-end sm:justify-between flex-wrap gap-2">
              <Button
                onClick={handleApply}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-200 text-black dark:bg-gray-900 hover:bg-gray-300"
              >
                <Filter className="h-4 w-4 " />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFilters;
