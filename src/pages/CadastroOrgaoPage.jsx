import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

const CadastroOrgaoPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '', cnpj: '', email: '', telefone: '', endereco: '', cidade: '', estado: '',
    responsavelNome: '', responsavelEmail: '', responsavelCargo: '', departamento: '',
    senha: '', confirmarSenha: '',
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.senha.length < 8 || form.senha !== form.confirmarSenha) {
      toast.error('Verifique a senha: mínimo de 8 caracteres e confirmação igual.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/api/usuarios/cadastro-orgao', form);
      login(data.usuario, data.token);
      toast.success('Órgão cadastrado com sucesso!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.erro || 'Erro ao cadastrar órgão');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ['nome', 'Nome do órgão'], ['cnpj', 'CNPJ'], ['email', 'Email institucional'], ['telefone', 'Telefone'],
    ['endereco', 'Endereço'], ['cidade', 'Cidade'], ['estado', 'Estado/UF'],
    ['responsavelNome', 'Nome do responsável'], ['responsavelEmail', 'Email do responsável'],
    ['responsavelCargo', 'Cargo do responsável'], ['departamento', 'Setor inicial'],
  ];

  return (
    <div className="min-h-screen py-10 px-4 bg-background">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-3 w-fit rounded-full bg-primary/10 p-3"><Shield className="h-7 w-7 text-primary" /></div>
          <h1 className="text-3xl font-bold">Cadastro de Órgão Público</h1>
          <p className="mt-2 text-muted-foreground">O cadastro cria o órgão, o primeiro setor e o usuário gestor.</p>
        </div>
        <form onSubmit={submit} className="space-y-6 rounded-xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([field, label]) => (
              <div key={field} className={['nome','endereco'].includes(field) ? 'sm:col-span-2' : ''}>
                <Label htmlFor={field}>{label}</Label>
                <Input id={field} type={field.toLowerCase().includes('email') ? 'email' : field === 'senha' || field === 'confirmarSenha' ? 'password' : 'text'} required={['nome','email','cidade','estado','responsavelNome','responsavelEmail'].includes(field)} value={form[field]} onChange={set(field)} />
              </div>
            ))}
            <div><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" required value={form.senha} onChange={set('senha')} /></div>
            <div><Label htmlFor="confirmarSenha">Confirmar senha</Label><Input id="confirmarSenha" type="password" required value={form.confirmarSenha} onChange={set('confirmarSenha')} /></div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar órgão'}</Button>
          <Link to="/admin/login" className="block text-center text-sm text-muted-foreground">Já possui acesso? Entrar</Link>
        </form>
      </div>
    </div>
  );
};

export default CadastroOrgaoPage;
