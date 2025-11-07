import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Upload, Calendar, Clock, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import FormField, { validators } from '@/components/FormField';
import { formatarCEP, validarCEP } from '@/lib/cep';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import eventService from '@/services/eventService';
import categoryService from '@/services/categoryService';
import locationService from '@/services/locationService';

const RegistroEvento = ({ onVoltar, onEventoAdicionado, eventoParaEditar }) => {
  const { user, isAuthenticated } = useUser();
  const [categories, setCategories] = useState([]);
  const [coordenadas, setCoordenadas] = useState(null);
  const [carregandoCoordenadas, setCarregandoCoordenadas] = useState(false);
  const [formData, setFormData] = useState({
    titulo: eventoParaEditar?.titulo || '',
    descricao: eventoParaEditar?.descricao || '',
    categoria: eventoParaEditar?.categoria || '',
    cep: eventoParaEditar?.cep || '',
    endereco: eventoParaEditar?.endereco || '',
    numero: eventoParaEditar?.numero || '',
    complemento: eventoParaEditar?.complemento || '',
    bairro: eventoParaEditar?.bairro || '',
    cidade: eventoParaEditar?.cidade || '',
    estado: eventoParaEditar?.estado || '',
    dataInicio: eventoParaEditar?.dataInicio || '',
    dataFim: eventoParaEditar?.dataFim || '',
    horario: eventoParaEditar?.horario || '',
    preco: eventoParaEditar?.preco || '',
    prioridade: eventoParaEditar?.prioridade || 'media',
    fotos: []
  });
  const [existingImage, setExistingImage] = useState(eventoParaEditar?.imageUrl || null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const allCategories = categoryService.getAllCategories();
    setCategories(allCategories);
  }, []);

  useEffect(() => {
    const buscarCoordenadas = async () => {
      if (formData.cep && validarCEP(formData.cep)) {
        setCarregandoCoordenadas(true);
        try {
          const resultado = await locationService.buscarCEP(formData.cep);
          if (resultado.success && resultado.data.coordenadas) {
            setCoordenadas(resultado.data.coordenadas);
          }
        } catch (error) {
          console.error('Erro ao buscar coordenadas:', error);
        } finally {
          setCarregandoCoordenadas(false);
        }
      }
    };

    const debounceTimer = setTimeout(buscarCoordenadas, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.cep]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (e) => {
    const value = e.target.value;
    const cepFormatado = formatarCEP(value);
    handleInputChange('cep', cepFormatado);
    
    if (!validarCEP(value)) return;
    
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
      let imageUrl = existingImage || '';
      if (formData.fotos && formData.fotos.length > 0) {
        const file = formData.fotos[0];
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      let eventoAtualizado;
      if (eventoParaEditar) {
        eventoAtualizado = await eventService.updateEvent(eventoParaEditar.id, {
          ...formData,
          coordenadas: coordenadas,
          imageUrl: imageUrl,
        }, user.id);
      } else {
        eventoAtualizado = await eventService.createEvent({
          ...formData,
          coordenadas: coordenadas,
          imageUrl: imageUrl,
        }, user);
      }
      
      toast.success(`Evento ${eventoParaEditar ? 'atualizado' : 'criado'} com sucesso!`);
      
      if (onEventoAdicionado) {
        onEventoAdicionado(eventoAtualizado);
      }
      
      onVoltar();
    } catch (error) {
      console.error('Erro ao processar evento:', error);
      toast.error('Erro ao processar evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Máximo 10MB.`);
        return false;
      }
      return true;
    });
    
    setFormData(prev => ({ ...prev, fotos: validFiles }));
    setExistingImage(null);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} arquivo(s) adicionado(s)`);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
    if (existingImage) setExistingImage(null);
    toast.success('Foto removida');
  };

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto flex-grow px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Login Necessário</h2>
          <p className="mt-4 text-muted-foreground">Você precisa estar logado para criar um evento.</p>
          <Button onClick={onVoltar} className="mt-6">Voltar</Button>
        </div>
      </div>
    );
  }

  //loclizacao add
  const handleMinhaLocalizacao = async () => {
  if (!navigator.geolocation) {
    toast.error("Geolocalização não é suportada neste navegador.");
    return;
  }

  setCarregandoCoordenadas(true);
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setCoordenadas({ latitude, longitude });

      try {
        // Chama um serviço para converter coordenadas em endereço (Reverse Geocoding)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();

        const address = data.address || {};

        setFormData((prev) => ({
          ...prev,
          endereco: address.road || "",
          bairro: address.suburb || address.neighbourhood || "",
          cidade: address.city || address.town || address.village || "",
          estado: address.state || "",
          cep: address.postcode || "",
        }));

        toast.success("Localização obtida com sucesso!");
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        toast.error("Erro ao obter o endereço da localização.");
      } finally {
        setCarregandoCoordenadas(false);
      }
    },
    (error) => {
      console.error("Erro de geolocalização:", error);
      toast.error("Não foi possível obter sua localização.");
      setCarregandoCoordenadas(false);
    }
  );
};

  return (
    <div className="container mx-auto flex-grow px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" onClick={onVoltar} className="flex items-center gap-2 p-0 h-auto hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {eventoParaEditar ? 'Editar Evento' : 'Criar Novo Evento'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {eventoParaEditar ? 'Atualize os detalhes do seu evento.' : 'Compartilhe um evento com a sua comunidade. Preencha os detalhes abaixo.'}
          </p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>{eventoParaEditar ? 'Editando como:' : 'Criando como:'}</strong> {user?.nome || user?.name || 'Usuário'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField id="event-title" label="Título do Evento" type="text" value={formData.titulo} onChange={(e) => handleInputChange('titulo', e.target.value)} placeholder="Ex: Feira de Artesanato no Parque Central" required validation={validators.minLength(10)} helperText="Mínimo de 10 caracteres" />
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <div className="mt-2">
              <Textarea id="description" name="description" value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} placeholder="Descreva o evento com o máximo de detalhes possível..." rows={4} className="block w-full py-3 px-4" required />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <div className="mt-2">
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger className="w-full py-3 px-4">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icone} {cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fotos */}
          <div>
            <Label htmlFor="fotos">Fotos do Evento</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span></p>
                  <p className="text-xs text-muted-foreground">PNG, JPG ou GIF (MAX. 10MB)</p>
                </div>
                <input id="file-upload" name="fotos" type="file" className="hidden" onChange={handleFileUpload} accept="image/png, image/jpeg, image/gif" />
              </label>
            </div>
            {(formData.fotos.length > 0 || existingImage) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImage && (
                  <div className="relative group">
                    <img src={existingImage} alt="Imagem existente" className="w-full h-24 object-contain rounded-lg bg-muted" />
                    <button type="button" onClick={() => setExistingImage(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                  </div>
                )}
                {formData.fotos.map((file, index) => (
                  <div key={index} className="relative group">
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-24 object-contain rounded-lg bg-muted" />
                    <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Endereço e Localização */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Localização</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMinhaLocalizacao}
                disabled={carregandoCoordenadas}
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {carregandoCoordenadas ? "Carregando..." : "Minha Localização"}
              </Button>
            </div>
            <FormField id="cep" label="CEP" type="text" value={formData.cep} onChange={handleCepChange} placeholder="00000-000" required validation={validators.cep} />
            <FormField id="endereco" label="Endereço" type="text" value={formData.endereco} onChange={(e) => handleInputChange('endereco', e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <FormField id="numero" label="Número" type="text" value={formData.numero} onChange={(e) => handleInputChange('numero', e.target.value)} />
              <FormField id="complemento" label="Complemento" type="text" value={formData.complemento} onChange={(e) => handleInputChange('complemento', e.target.value)} />
            </div>
            <FormField id="bairro" label="Bairro" type="text" value={formData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <FormField id="cidade" label="Cidade" type="text" value={formData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)} required />
              <FormField id="estado" label="Estado" type="text" value={formData.estado} onChange={(e) => handleInputChange('estado', e.target.value)} required />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="ghost" onClick={onVoltar} className="mr-4">Cancelar</Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (eventoParaEditar ? 'Atualizando...' : 'Criando...') : (eventoParaEditar ? 'Salvar Alterações' : 'Criar Evento')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroEvento;
