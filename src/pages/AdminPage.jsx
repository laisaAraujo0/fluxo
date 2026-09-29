import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle2, RotateCcw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminDashboard, adminReclamacoes } from '@/services/complaintService';
import { subscribeToBroadcast, unsubscribeFromBroadcast } from '@/services/socketService';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const labels = { RECEIVED:'Recebida', FORWARDED:'Encaminhada', IN_ANALYSIS:'Em análise', WAITING_INFORMATION:'Aguardando informação', SCHEDULED:'Programada', IN_PROGRESS:'Em execução', RESOLVED:'Resolvida', REOPENED:'Reaberta' };
const status = Object.keys(labels);

const AdminPage = () => {
  const { user } = useUser();
  const [dashboard, setDashboard] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [dash, list] = await Promise.all([
        adminDashboard(),
        adminReclamacoes({ search: search || undefined, status: statusFilter === 'all' ? undefined : statusFilter }),
      ]);
      setDashboard(dash); setItems(list);
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao carregar painel.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    const refresh = () => load();
    subscribeToBroadcast('complaint:new', refresh);
    subscribeToBroadcast('complaint:updated', refresh);
    subscribeToBroadcast('complaint:reopened', refresh);
    return () => { unsubscribeFromBroadcast('complaint:new', refresh); unsubscribeFromBroadcast('complaint:updated', refresh); unsubscribeFromBroadcast('complaint:reopened', refresh); };
  }, [search, statusFilter]);

  const cards = [
    ['Novas', dashboard?.stats?.RECEIVED || 0, Clock],
    ['Em análise', dashboard?.stats?.IN_ANALYSIS || 0, Search],
    ['Programadas', dashboard?.stats?.SCHEDULED || 0, Clock],
    ['Em execução', dashboard?.stats?.IN_PROGRESS || 0, Search],
    ['Resolvidas', dashboard?.stats?.RESOLVED || 0, CheckCircle2],
    ['Reabertas', dashboard?.stats?.REOPENED || 0, RotateCcw],
    ['Urgentes', dashboard?.urgent || 0, AlertTriangle],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div><h1 className="text-3xl font-bold">Painel administrativo</h1><p className="text-muted-foreground">{user?.agency?.name || 'FLUXO'} • {user?.department?.name || 'Gestão de solicitações'}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([title, value, Icon]) => <Card key={title}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-bold">{value}</p></CardContent></Card>)}</div>
      <Card><CardHeader><CardTitle>Solicitações</CardTitle></CardHeader><CardContent>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar protocolo, título ou cidadão" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="sm:w-56"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{status.map((s) => <SelectItem key={s} value={s}>{labels[s]}</SelectItem>)}</SelectContent></Select></div>
        {loading ? <p>Carregando...</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Protocolo</th><th className="p-3">Título</th><th className="p-3">Cidadão</th><th className="p-3">Setor</th><th className="p-3">Prioridade</th><th className="p-3">Status</th></tr></thead><tbody>{items.map((x) => <tr key={x.id} className="border-b hover:bg-muted/40"><td className="p-3"><Link className="font-semibold text-primary" to={`/admin/solicitacoes/${x.id}`}>{x.protocol}</Link></td><td className="p-3">{x.title}</td><td className="p-3">{x.author?.name}</td><td className="p-3">{x.department?.name || '—'}</td><td className="p-3"><Badge variant={x.priority === 'URGENT' ? 'destructive' : 'outline'}>{x.priority}</Badge></td><td className="p-3"><Badge>{labels[x.status]}</Badge></td></tr>)}</tbody></table>{items.length === 0 && <p className="py-8 text-center text-muted-foreground">Nenhuma solicitação encontrada.</p>}</div>}
      </CardContent></Card>
    </div>
  );
};

export default AdminPage;
