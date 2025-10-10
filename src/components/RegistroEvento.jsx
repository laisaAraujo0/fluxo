import { useState } from 'react';
import { ArrowLeft, MapPin, Upload, Calendar, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import FormField, { validators } from '@/components/FormField';
import { formatarCEP, validarCEP } from '@/lib/cep';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import eventService from '@/services/eventService';

const RegistroEvento = ({ onVoltar, onEventoAdicionado }) => {
  const { user, isAuthenticated } = useUser();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    dataInicio: '',
    dataFim: '',
    horario: '',
    preco: '',
    prioridade: 'media',
    fotos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCepChange = async (e) => {
    const value = e.target.value;
    const cepFormatado = formatarCEP(value);
    handleInputChange('cep', cepFormatado);
    
    // Validar CEP
    if (!validarCEP(value)) {
      return;
    }
    
    // Buscar CEP
    try {
      const response = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
        toast.success('CEP encontrado com sucesso!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para criar um evento');
      return;
    }

    // Validar campos obrigatórios
    if (!formData.titulo || !formData.descricao || !formData.categoria) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (!formData.cep || !validarCEP(formData.cep)) {
      toast.error('Por favor, informe um CEP válido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar evento usando o eventService
      const novoEvento = eventService.createEvent(formData, user);
      
      console.log('Evento criado:', novoEvento);
      toast.success('Evento criado com sucesso!');
      
      // Callback para atualizar a lista de eventos
      if (onEventoAdicionado) {
        onEventoAdicionado(novoEvento);
      }
      
      // Voltar para a lista
      onVoltar();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar tamanho dos arquivos (máximo 10MB cada)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Máximo 10MB.`);
        return false;
      }
      return true;
    });
    
    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, ...validFiles]
    }));
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} arquivo(s) adicionado(s)`);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleInputChange('endereco', `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast.success('Localização atual obtida com sucesso!');
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          toast.error('Não foi possível obter sua localização atual.');
        }
      );
    } else {
      toast.error('Geolocalização não é suportada neste navegador.');
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
    toast.success('Foto removida');
  };

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto flex-grow px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Login Necessário
          </h2>
          <p className="mt-4 text-muted-foreground">
            Você precisa estar logado para criar um evento.
          </p>
          <Button onClick={onVoltar} className="mt-6">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex-grow px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onVoltar}
              className="flex items-center gap-2 p-0 h-auto hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Criar Novo Evento
          </h2>
          <p className="mt-2 text-muted-foreground">
            Compartilhe um evento com a sua comunidade. Preencha os detalhes abaixo.
          </p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Criando como:</strong> {user?.nome || user?.name || 'Usuário'}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título do Evento */}
          <FormField
            id="event-title"
            label="Título do Evento"
            type="text"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            placeholder="Ex: Feira de Artesanato no Parque Central"
            required
            validation={validators.minLength(10)}
            helperText="Mínimo de 10 caracteres"
          />

          {/* Descrição */}
          <div>
            <Label htmlFor="description">
              Descrição *
            </Label>
            <div className="mt-2">
              <Textarea
                id="description"
                name="description"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva o evento com o máximo de detalhes possível, incluindo o que será oferecido e pontos de referência."
                rows={4}
                className="block w-full py-3 px-4"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="category">
              Categoria *
            </Label>
            <div className="mt-2">
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger className="w-full py-3 px-4">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="cultura">Cultura</SelectItem>
                  <SelectItem value="esporte">Esporte</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="meio-ambiente">Meio Ambiente</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="gastronomia">Gastronomia</SelectItem>
                  <SelectItem value="musica">Música</SelectItem>
                  <SelectItem value="arte">Arte</SelectItem>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                  <SelectItem value="mobilidade-urbana">Mobilidade Urbana</SelectItem>
                  <SelectItem value="evento-comunitario">Evento Comunitário</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datas e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Início
              </Label>
              <div className="mt-2">
                <FormField
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dataFim" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Fim
              </Label>
              <div className="mt-2">
                <FormField
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => handleInputChange('dataFim', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Horário e Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </Label>
              <div className="mt-2">
                <FormField
                  id="horario"
                  type="text"
                  value={formData.horario}
                  onChange={(e) => handleInputChange('horario', e.target.value)}
                  placeholder="Ex: 09:00 - 17:00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="preco" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preço
              </Label>
              <div className="mt-2">
                <FormField
                  id="preco"
                  type="text"
                  value={formData.preco}
                  onChange={(e) => handleInputChange('preco', e.target.value)}
                  placeholder="Ex: Gratuito ou R$ 25,00"
                />
              </div>
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <Label htmlFor="prioridade">
              Prioridade
            </Label>
            <div className="mt-2">
              <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                <SelectTrigger className="w-full py-3 px-4">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CEP */}
          <FormField
            id="cep"
            label="CEP"
            type="text"
            value={formData.cep}
            onChange={handleCepChange}
            placeholder="00000-000"
            maxLength={9}
            required
            validation={validators.cep}
            helperText="Digite o CEP para preencher automaticamente o endereço"
          />

          {/* Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                id="endereco"
                label="Endereço"
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, Avenida..."
              />
            </div>
            <div>
              <FormField
                id="numero"
                label="Número"
                type="text"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                placeholder="123"
              />
            </div>
          </div>

          {/* Complemento e Bairro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                id="complemento"
                label="Complemento"
                type="text"
                value={formData.complemento}
                onChange={(e) => handleInputChange('complemento', e.target.value)}
                placeholder="Apto, Bloco..."
              />
            </div>
            <div>
              <FormField
                id="bairro"
                label="Bairro"
                type="text"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                id="cidade"
                label="Cidade"
                type="text"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="Nome da cidade"
              />
            </div>
            <div>
              <FormField
                id="estado"
                label="Estado"
                type="text"
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>

          {/* Botão de localização atual */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Usar Localização Atual
            </Button>
          </div>

          {/* Upload de Fotos */}
          <div>
            <Label>
              Fotos do Evento
            </Label>
            <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-border px-6 py-10">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                  >
                    <span>Clique para enviar</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">PNG, JPG até 10MB cada</p>
              </div>
            </div>
            
            {/* Lista de fotos selecionadas */}
            {formData.fotos.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Fotos selecionadas ({formData.fotos.length}):
                </p>
                <div className="space-y-2">
                  {formData.fotos.map((foto, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm text-muted-foreground truncate">
                        {foto.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botão de Submit */}
          <div className="border-t border-border pt-6">
            <Button
              type="submit"
              className="w-full flex justify-center py-3 px-4 text-base font-bold"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando Evento...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroEvento;
