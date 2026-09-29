import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { minhasReclamacoes } from '@/services/complaintService';
import { subscribeToBroadcast, unsubscribeFromBroadcast } from '@/services/socketService';

const labels = { RECEIVED:'Recebida', FORWARDED:'Encaminhada', IN_ANALYSIS:'Em análise', WAITING_INFORMATION:'Aguardando informação', SCHEDULED:'Programada', IN_PROGRESS:'Em execução', RESOLVED:'Resolvida', REOPENED:'Reaberta' };

const ReclamacoesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { setItems(await minhasReclamacoes()); } catch { toast.error('Erro ao carregar suas solicitações.'); } finally { setLoading(false); } };
  useEffect(() => {
    load();
    const refresh = () => load();
    subscribeToBroadcast('complaint:updated', refresh);
    subscribeToBroadcast('complaint:message', refresh);
    return () => { unsubscribeFromBroadcast('complaint:updated', refresh); unsubscribeFromBroadcast('complaint:message', refresh); };
  }, []);

  const pending = items.filter((x) => x.status !== 'RESOLVED' || !x.resolutionConfirmed).length;
  const resolved = items.filter((x) => x.status === 'RESOLVED' && x.resolutionConfirmed).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold">Minhas solicitações</h1><p className="text-muted-foreground">Acompanhe cada etapa do atendimento.</p></div>
        <Button asChild><Link to="/reclamacoes/nova"><Plus className="mr-2 h-4 w-4" />Nova solicitação</Link></Button>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border bg-card p-5"><Clock className="mb-2 h-5 w-5" /><p className="text-sm text-muted-foreground">Em acompanhamento</p><p className="text-3xl font-bold">{pending}</p></div><div className="rounded-xl border bg-card p-5"><CheckCircle className="mb-2 h-5 w-5" /><p className="text-sm text-muted-foreground">Confirmadas</p><p className="text-3xl font-bold">{resolved}</p></div></div>
      {loading ? <p>Carregando...</p> : items.length === 0 ? <div className="rounded-xl border bg-card p-8 text-center"><p className="mb-4 text-muted-foreground">Você ainda não possui solicitações.</p><Button asChild><Link to="/reclamacoes/nova">Registrar problema</Link></Button></div> :
        <div className="space-y-3">{items.map((item) => <Link key={item.id} to={`/reclamacoes/${item.id}`} className="block rounded-xl border bg-card p-5 transition hover:bg-muted/40"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-primary">{item.protocol}</p><h2 className="font-semibold">{item.title}</h2><p className="text-sm text-muted-foreground">{item.agency?.name} {item.department?.name ? `• ${item.department.name}` : ''}</p></div><div className="flex items-center gap-3"><Badge>{labels[item.status] || item.status}</Badge><ChevronRight className="h-4 w-4" /></div></div></Link>)}</div>}
    </div>
  );
};

export default ReclamacoesPage;
