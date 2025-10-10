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
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simular login de usuário
    // Em produção, isso faria uma chamada à API
    if (formData.email && formData.password) {
      const usuario = {
        id: 1,
        nome: 'Beatriz Almeida',
        email: formData.email,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTgZH5QmaCBG5kBLgV5LYcelEsV1n08WAfNFX6QsoH9DbTLkP8ucrf4-7Igm0NH1UoG5kcADzMvkXgKUReyLL1Ylt1mfQeAiXKxq-8kyOv0OZDCBXe7iNXqAHcy3Ja3k9cmZ00vEaGUMXjbz6B0qdxeDpoAZIpV9D3iYmU9KF6j9rWwDW9rw9mgFvsBX6z23vT8c0oxB2fz-w99BEBxjt_MKc539cD4RgfhbwnIK0ZIBNvDqoAQhHiD_Id_lHd7vUM9BY49RYikIA',
        tipo: 'usuario',
        isAdmin: false,
        dataCriacao: new Date().toISOString(),
        ativo: true
      };

      login(usuario);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } else {
      toast.error('Por favor, preencha todos os campos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Bem-vindo de volta
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
                Email ou nome de usuário
              </Label>
              <Input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                placeholder="Digite seu email ou usuário"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="password">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Digite sua senha"
                value={formData.password}
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

          <div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </div>

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
