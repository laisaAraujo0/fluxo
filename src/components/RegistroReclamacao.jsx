import { useState } from 'react';
import { ArrowLeft, MapPin, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField, { validators } from '@/components/FormField';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/services/api';

const RegistroReclamacao = ({ onVoltar, onReclamacaoAdicionada }) => {
  const { user, isAuthenticated } = useUser();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    localizacao: '',
    prioridade: 'LOW',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotos, setFotos] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);

        const maxSize = 10 * 1024 * 1024; 

        const arquivosValidos = files.filter((file) => {
            if (file.size > maxSize) {
            toast.error(
                `O arquivo ${file.name} é muito grande. O tamanho máximo é 10MB.`
            );
            return false;
            }

            return true;
        });

        setFotos(arquivosValidos);

        if (arquivosValidos.length > 0) {
            toast.success(`${arquivosValidos.length} foto(s) adicionada(s)!`);
        }
    };

    const removePhoto = (index) => {
        setFotos((prev) => prev.filter((_, i) => i !== index));

        toast.success('Foto removida.');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para registrar uma reclamação.');
      return;
    }

    if (!formData.titulo || !formData.descricao || !formData.localizacao) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.titulo.trim().length < 5) {
      toast.error('O título deve ter pelo menos 5 caracteres.');
      return;
    }

    if (formData.descricao.trim().length < 10) {
      toast.error('A descrição deve ter pelo menos 10 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';

        if (fotos.length > 0) {
        const file = fotos[0];

        imageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
        }

        const response = await api.post('/api/reclamacoes', {
        title: formData.titulo.trim(),
        description: formData.descricao.trim(),
        location: formData.localizacao.trim(),
        priority: formData.prioridade,
        imageUrl,
        });

      const novaReclamacao = response.data.reclamacao;

      toast.success('Reclamação registrada com sucesso!');

      if (onReclamacaoAdicionada) {
        onReclamacaoAdicionada(novaReclamacao);
      }

      onVoltar();

    } catch (error) {
      console.error('Erro ao criar reclamação:', error);

      const mensagem =
        error.response?.data?.error ||
        error.response?.data?.erro ||
        'Não foi possível registrar a reclamação.';

      toast.error(mensagem);

    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">
            Login Necessário
          </h2>

          <p className="mt-4 text-muted-foreground">
            Você precisa estar logado para registrar uma reclamação.
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

        {/* Voltar */}
        <div className="mb-4">
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

        {/* Título */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Registrar Nova Reclamação
          </h2>

          <p className="mt-2 text-muted-foreground">
            Informe um problema encontrado em sua comunidade.
          </p>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Registrando como:</strong>{' '}
              {user?.nome || user?.name || 'Usuário'}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Título */}
          <FormField
            id="complaint-title"
            label="Título da Reclamação"
            type="text"
            value={formData.titulo}
            onChange={(e) =>
              handleInputChange('titulo', e.target.value)
            }
            placeholder="Ex: Buraco na Rua Principal"
            required
            validation={validators.minLength(5)}
            helperText="Informe de forma resumida qual é o problema."
          />

          {/* Descrição */}
          <div>
            <Label htmlFor="complaint-description">
              Descrição *
            </Label>

            <div className="mt-2">
              <Textarea
                id="complaint-description"
                value={formData.descricao}
                onChange={(e) =>
                  handleInputChange('descricao', e.target.value)
                }
                placeholder="Descreva o problema com o máximo de detalhes possível..."
                rows={5}
                className="block w-full py-3 px-4"
                required
              />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <Label htmlFor="priority">
              Prioridade *
            </Label>

            <div className="mt-2">
              <Select
                value={formData.prioridade}
                onValueChange={(value) =>
                  handleInputChange('prioridade', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="LOW">
                    Baixa
                  </SelectItem>

                  <SelectItem value="MEDIUM">
                    Média
                  </SelectItem>

                  <SelectItem value="HIGH">
                    Alta
                  </SelectItem>

                  <SelectItem value="URGENT">
                    Urgente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4 p-4 border rounded-lg">

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />

              <h3 className="font-medium text-foreground">
                Localização do problema
              </h3>
            </div>

            <FormField
              id="localizacao"
              label="Localização"
              type="text"
              value={formData.localizacao}
              onChange={(e) =>
                handleInputChange('localizacao', e.target.value)
              }
              placeholder="Ex: Rua Principal, 120 - Centro, Bananal/SP"
              required
            />

            <p className="text-sm text-muted-foreground">
              Informe o endereço ou local onde o problema foi encontrado.
            </p>
          </div>
          {/* Fotos da Reclamação */}
        <div>
        <Label htmlFor="fotos">
            Fotos da Reclamação
        </Label>

        <div className="mt-2 flex items-center justify-center w-full">
            <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors"
            >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />

                <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">
                    Clique para enviar
                </span>
                </p>

                <p className="text-xs text-muted-foreground">
                PNG, JPG ou GIF (MAX. 10MB)
                </p>
            </div>

            <input
                id="file-upload"
                name="fotos"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/png, image/jpeg, image/gif"
            />
            </label>
        </div>

        {/* Pré-visualização das fotos */}
        {fotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {fotos.map((file, index) => (
                <div
                key={index}
                className="relative group"
                >
                <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-contain rounded-lg bg-muted"
                />

                <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="h-3 w-3" />
                </button>
                </div>
            ))}
            </div>
        )}
        </div>    
          
          {/* Botões */}
          <div className="flex justify-end pt-4">

            <Button
              type="button"
              variant="ghost"
              onClick={onVoltar}
              className="mr-4"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Registrando...'
                : 'Registrar Reclamação'}
            </Button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default RegistroReclamacao;