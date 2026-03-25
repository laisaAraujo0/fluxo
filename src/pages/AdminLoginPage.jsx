import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // ----------- redireciona se já estiver logado ----------- //
  useEffect(() => {
    if (user && user.isAdmin) {
      toast.info("Você já está logado!");
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ----------- VALIDAÇÃO: email .gov.br ----------- //
    if (!formData.email.endsWith('.gov.br')) {
      toast.error('O email deve ser institucional e terminar com .gov.br');
      return;
    }

    // ----------- VALIDAÇÃO: senha forte ----------- //
    const senhaForteRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!senhaForteRegex.test(formData.password)) {
      toast.error(
        'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.'
      );
      return;
    }

    // Valida preenchimento
    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    // Simulação de login administrativo
    const admin = {
      id: 100,
      nomeOrgao: 'Prefeitura Municipal',
      tipoOrgao: 'Prefeitura',
      emailInstitucional: formData.email,
      responsavel: {
        nome: 'João Silva',
        cargo: 'Secretário de Obras'
      },
      tipo: 'administrador',
      isAdmin: true,
      avatar: null
    };

    login(admin);
    toast.success('Login administrativo realizado com sucesso!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Acesso Administrativo
          </h2>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Área restrita para órgãos públicos
          </p>

          <p className="mt-1 text-center text-sm text-muted-foreground">
            Não tem uma conta institucional?{' '}
            <Link 
              to="/admin/cadastro" 
              className="font-medium text-primary hover:text-primary/90"
            >
              Cadastre seu órgão
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email institucional</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="exemplo@orgao.gov.br"
                value={formData.email}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use o email oficial do seu órgão público
              </p>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
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
                Manter conectado
              </Label>
            </div>

            <div className="text-sm">
              <Link 
                to="/admin/esqueci-senha" 
                className="font-medium text-primary hover:text-primary/90"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Acessar Dashboard
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
              to="/login" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 w-full"
            >
              Voltar ao login de usuário
            </Link>
          </div>
        </form>

        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            <strong>Importante:</strong> Esta área é exclusiva para representantes de órgãos públicos devidamente cadastrados. O uso indevido está sujeito às penalidades legais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

