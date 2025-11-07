import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const [formData, setFormData] = useState({
    email: '',
    senha: '', // ✅ alterado de "password" para "senha"
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ Função de validação de e-mail (sem depender de validators)
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔍 Validação do e-mail
    if (!validarEmail(formData.email)) {
      toast.error('Digite um e-mail válido');
      return;
    }

    // 🔍 Validação da senha
    if (formData.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    // 🔍 Buscar usuário salvo
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioSalvo) {
      toast.error('Nenhum usuário cadastrado. Faça o cadastro primeiro.');
      return;
    }

    // 🔍 Comparar e-mail e senha salvos
    if (
      usuarioSalvo.email === formData.email &&
      usuarioSalvo.senha === formData.senha
    ) {
      login(usuarioSalvo);
      toast.success(`Bem-vindo, ${usuarioSalvo.nome}!`);
      navigate('/');
    } else {
      toast.error('Email ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Bem-vindo! 
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link 
              to="/cadastro" 
              className="font-medium text-primary hover:text-primary/90"
            >
              Cadastre-se
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="senha">
                Senha
              </Label>
              <Input
                id="senha"
                name="senha" // ✅ nome ajustado
                type="password"
                autoComplete="current-password"
                required
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, rememberMe: checked }))
                }
              />
              <Label htmlFor="rememberMe" className="text-sm">
                Lembrar-me
              </Label>
            </div>
            <div className="text-sm">
              <Link 
                to="/esqueci-senha" 
                className="font-medium text-primary hover:text-primary/90"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Entrar
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/admin/login" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 w-full"
            >
              Entrar como Administrador
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
