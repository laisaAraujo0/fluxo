import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/services/api';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({ email: '', senha: '', rememberMe: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/usuarios/login', {
        email: formData.email,
        senha: formData.senha,
      });
      login(data.usuario, data.token);
      toast.success(`Bem-vindo, ${data.usuario.nome}!`);
      navigate(data.usuario.role === 'CITIZEN' ? '/' : '/admin');
    } catch (error) {
      toast.error(error.response?.data?.erro || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Bem-vindo!</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Não tem uma conta? <Link to="/cadastro" className="font-medium text-primary">Cadastre-se</Link>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" required value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="remember" checked={formData.rememberMe} onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: Boolean(checked) })} />
            <Label htmlFor="remember">Lembrar-me</Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
          <Link to="/admin/login" className="flex h-10 w-full items-center justify-center rounded-md border border-input text-sm hover:bg-accent">
            Entrar como órgão público
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
