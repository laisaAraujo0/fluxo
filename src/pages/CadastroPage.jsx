import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FormField, { validators } from '@/components/FormField';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { useCEP } from '@/lib/cep'; // ✅ Importa hook de CEP

const CadastroPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  // ✅ Hook para buscar CEP automaticamente
  const { buscar, endereco, error, loading } = useCEP();

  // ✅ Estado do formulário com novos campos
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cep: '',
    cidade: '',
    estado: '',
    telefone: ''
  });

  // ✅ Atualiza cidade e estado automaticamente quando o CEP é encontrado
  useEffect(() => {
    if (endereco) {
      setFormData(prev => ({
        ...prev,
        cidade: endereco.localidade || '',
        estado: endereco.uf || ''
      }));
    }
  }, [endereco]);

  // ✅ Captura mudanças nos inputs
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Busca o CEP automaticamente quando completo
    if (field === 'cep' && value.replace(/\D/g, '').length === 8) {
      buscar(value);
    }
  };

  // ✅ Envio do formulário
  // ✅ Envio do formulário com validação
const handleSubmit = (e) => {
  e.preventDefault();

  // --- 🔍 Validação de email ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast.error('Por favor, insira um email válido');
    return;
  }

  // --- 🔐 Validação de senha ---
  if (formData.senha.length < 6) {
    toast.error('A senha deve ter no mínimo 6 caracteres');
    return;
  }
  if (!/[A-Z]/.test(formData.senha)) {
    toast.error('A senha deve conter pelo menos uma letra maiúscula');
    return;
  }
  if (!/[a-z]/.test(formData.senha)) {
    toast.error('A senha deve conter pelo menos uma letra minúscula');
    return;
  }
  if (!/[0-9]/.test(formData.senha)) {
    toast.error('A senha deve conter pelo menos um número');
    return;
  }

  // --- ✅ Confirmação de senha ---
  if (formData.senha !== formData.confirmarSenha) {
    toast.error('As senhas não coincidem');
    return;
  }

  // --- 🧠 Criação do usuário ---
  const novoUsuario = {
  id: Date.now(),
  nome: formData.nome,
  email: formData.email,
  senha: formData.senha, // ✅ Adiciona senha!
  telefone: formData.telefone,
  cidade: formData.cidade,
  estado: formData.estado,
  cep: formData.cep,
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nome)}&background=random`,
  tipo: 'usuario',
  isAdmin: false,
  dataCriacao: new Date().toISOString(),
  ativo: true
};


  // --- 💾 Salvar no localStorage e autenticar ---
  localStorage.setItem('usuario', JSON.stringify(novoUsuario));
  login(novoUsuario);

  toast.success('Cadastro realizado com sucesso!');
  navigate('/');
};

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Criar sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary hover:text-primary/90"
            >
              Faça login
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">

            <FormField
              id="nome"
              label="Nome completo"
              type="text"
              value={formData.nome}
              onChange={handleInputChange('nome')}
              placeholder="Digite seu nome completo"
              required
              validation={validators.minLength(3)}
              helperText="Mínimo de 3 caracteres"
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="seu@email.com"
              required
              validation={validators.email}
            />

            {/* ✅ Campo de CEP com busca automática */}
            <FormField
              id="cep"
              label="CEP"
              type="text"
              value={formData.cep}
              onChange={handleInputChange('cep')}
              placeholder="00000-000"
              required
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* ✅ Campos de Cidade e Estado automáticos */}
            <FormField
              id="cidade"
              label="Cidade"
              type="text"
              value={formData.cidade}
              onChange={handleInputChange('cidade')}
              placeholder={loading ? 'Buscando...' : 'Digite sua cidade'}
              disabled={loading}
              required
            />

            <FormField
              id="estado"
              label="Estado"
              type="text"
              value={formData.estado}
              onChange={handleInputChange('estado')}
              placeholder={loading ? 'Buscando...' : 'Digite seu estado'}
              disabled={loading}
              required
            />

            {/* ✅ Campo de telefone */}
            <FormField
              id="telefone"
              label="Telefone"
              type="tel"
              value={formData.telefone}
              onChange={handleInputChange('telefone')}
              placeholder="(11) 99999-9999"
              required
              validation={validators.minLength(10)}
              helperText="Inclua DDD"
            />

            <FormField
              id="senha"
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={handleInputChange('senha')}
              placeholder="Mínimo 6 caracteres"
              required
              validation={validators.senha}
              helperText="Deve conter maiúscula, minúscula e número"
            />

            <FormField
              id="confirmarSenha"
              label="Confirmar senha"
              type="password"
              value={formData.confirmarSenha}
              onChange={handleInputChange('confirmarSenha')}
              placeholder="Digite a senha novamente"
              required
              validation={validators.confirmarSenha(formData.senha)}
            />
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Verificando CEP...' : 'Criar conta'}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link to="/termos" className="font-medium text-primary hover:text-primary/90">
              Termos de Serviço
            </Link>
            {' '}e{' '}
            <Link to="/privacidade" className="font-medium text-primary hover:text-primary/90">
              Política de Privacidade
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroPage;
