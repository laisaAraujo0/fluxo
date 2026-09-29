import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { criarReclamacao, listarDepartamentos, listarOrgaos } from '@/services/complaintService';

const NovaReclamacaoPage = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', neighborhood: '',
    priority: 'MEDIUM', agencyId: '', departmentId: '',
  });

  useEffect(() => {
    listarOrgaos().then(setAgencies).catch(() => toast.error('Não foi possível carregar os órgãos.'));
  }, []);

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const selectAgency = async (agencyId) => {
    change('agencyId', agencyId);
    change('departmentId', '');
    try { setDepartments(await listarDepartamentos(agencyId)); } catch { toast.error('Erro ao carregar setores.'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const complaint = await criarReclamacao(form);
      toast.success(`Solicitação criada: ${complaint.protocol}`);
      navigate(`/reclamacoes/${complaint.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Não foi possível criar a solicitação.');
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6"><h1 className="text-3xl font-bold">Registrar uma solicitação</h1><p className="text-muted-foreground">Informe o problema e encaminhe ao órgão responsável.</p></div>
      <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-6">
        <div><Label htmlFor="title">Título</Label><Input id="title" required value={form.title} onChange={(e) => change('title', e.target.value)} placeholder="Ex.: Buraco na Rua Principal" /></div>
        <div><Label htmlFor="description">Descrição</Label><Textarea id="description" rows={5} value={form.description} onChange={(e) => change('description', e.target.value)} placeholder="Explique o problema com detalhes." /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Categoria</Label><Select value={form.category} onValueChange={(v) => change('category', v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{['Infraestrutura','Segurança','Meio Ambiente','Transporte','Saúde','Educação','Iluminação Pública','Saneamento','Outro'].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prioridade</Label><Select value={form.priority} onValueChange={(v) => change('priority', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LOW">Baixa</SelectItem><SelectItem value="MEDIUM">Média</SelectItem><SelectItem value="HIGH">Alta</SelectItem><SelectItem value="URGENT">Urgente</SelectItem></SelectContent></Select></div>
        </div>
        <div><Label>Órgão responsável</Label><Select value={form.agencyId} onValueChange={selectAgency}><SelectTrigger><SelectValue placeholder="Selecione o órgão" /></SelectTrigger><SelectContent>{agencies.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} — {a.cidade}/{a.estado}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Setor responsável</Label><Select value={form.departmentId} onValueChange={(v) => change('departmentId', v)} disabled={!form.agencyId}><SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="location">Localização</Label><Input id="location" required value={form.location} onChange={(e) => change('location', e.target.value)} placeholder="Rua, número e referência" /></div><div><Label htmlFor="neighborhood">Bairro</Label><Input id="neighborhood" value={form.neighborhood} onChange={(e) => change('neighborhood', e.target.value)} /></div></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Enviando...' : 'Enviar solicitação'}</Button>
      </form>
    </div>
  );
};

export default NovaReclamacaoPage;
