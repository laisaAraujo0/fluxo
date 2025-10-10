import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FormField, { validators } from '@/components/FormField';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const CadastroPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar se as senhas coincidem
    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    // Simular cadastro de usuário
    const novoUsuario = {
      id: Date.now(),
      nome: formData.nome,
      email: formData.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nome)}&background=random`,
      tipo: 'usuario',
      isAdmin: false,
      dataCriacao: new Date().toISOString(),
      ativo: true
    };

    // Fazer login automático após cadastro
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
            >
              Criar conta
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

