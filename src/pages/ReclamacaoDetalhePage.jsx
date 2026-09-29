import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { buscarReclamacao, confirmarResolucao, enviarMensagem, reabrirReclamacao } from '@/services/complaintService';
import { subscribeToBroadcast, unsubscribeFromBroadcast } from '@/services/socketService';

const labels = { RECEIVED:'Recebida', FORWARDED:'Encaminhada', IN_ANALYSIS:'Em análise', WAITING_INFORMATION:'Aguardando informação', SCHEDULED:'Programada', IN_PROGRESS:'Em execução', RESOLVED:'Resolvida', REOPENED:'Reaberta' };
const flow = ['RECEIVED','FORWARDED','IN_ANALYSIS','SCHEDULED','IN_PROGRESS','RESOLVED'];

const ReclamacaoDetalhePage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => { try { setItem(await buscarReclamacao(id)); } catch { toast.error('Não foi possível carregar a solicitação.'); } finally { setLoading(false); } };
  useEffect(() => {
    load();
    const refresh = (event) => { if (event?.complaintId === id) load(); };
    subscribeToBroadcast('complaint:updated', refresh);
    subscribeToBroadcast('complaint:message', refresh);
    return () => { unsubscribeFromBroadcast('complaint:updated', refresh); unsubscribeFromBroadcast('complaint:message', refresh); };
  }, [id]);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!item) return <div className="p-8">Solicitação não encontrada.</div>;

  const currentIndex = flow.indexOf(item.status);
  const send = async () => { if (!message.trim()) return; await enviarMensagem(id, message); setMessage(''); await load(); };
  const confirm = async () => { try { await confirmarResolucao(id); toast.success('Resolução confirmada.'); await load(); } catch (e) { toast.error(e.response?.data?.error || 'Erro ao confirmar.'); } };
  const reopen = async () => { if (!reason.trim()) return; try { await reabrirReclamacao(id, reason); setReason(''); toast.success('Solicitação reaberta.'); await load(); } catch (e) { toast.error(e.response?.data?.error || 'Erro ao reabrir.'); } };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="rounded-xl border bg-card p-6"><p className="text-sm font-semibold text-primary">{item.protocol}</p><h1 className="mt-1 text-3xl font-bold">{item.title}</h1><p className="mt-2 text-muted-foreground">{item.location}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{labels[item.status]}</Badge><Badge variant="outline">{item.priority}</Badge><Badge variant="outline">{item.agency?.name}</Badge>{item.department && <Badge variant="outline">{item.department.name}</Badge>}</div></div>

      <div className="rounded-xl border bg-card p-6"><h2 className="mb-6 text-xl font-semibold">Acompanhamento</h2><div className="space-y-5">{flow.map((status, index) => { const active = currentIndex >= index && currentIndex >= 0; const updates = item.updates?.filter((u) => u.newStatus === status) || []; return <div key={status} className="flex gap-4"><div className="pt-0.5">{active ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}</div><div className="flex-1"><p className={`font-semibold ${active ? '' : 'text-muted-foreground'}`}>{labels[status]}</p>{updates.map((u) => <div key={u.id} className="mt-1 text-sm text-muted-foreground"><span>{new Date(u.createdAt).toLocaleString('pt-BR')}</span>{u.message && <p className="mt-1 text-foreground">{u.message}</p>}</div>)}</div></div>; })}</div>{item.estimatedResolutionAt && <p className="mt-6 rounded-lg bg-muted p-3 text-sm">Previsão informada: <strong>{new Date(item.estimatedResolutionAt).toLocaleDateString('pt-BR')}</strong></p>}</div>

      {item.status === 'RESOLVED' && !item.resolutionConfirmed && <div className="rounded-xl border bg-card p-6"><h2 className="font-semibold">O órgão informou que o problema foi resolvido.</h2><p className="mt-1 text-sm text-muted-foreground">{item.resolutionDescription}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Button onClick={confirm}>Sim, foi resolvido</Button><div><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explique por que o problema continua." /><Button variant="outline" className="mt-2 w-full" onClick={reopen}><RotateCcw className="mr-2 h-4 w-4" />Não, o problema continua</Button></div></div></div>}

      <div className="rounded-xl border bg-card p-6"><h2 className="mb-4 text-xl font-semibold">Mensagens</h2><div className="space-y-3">{(item.messages || []).map((m) => <div key={m.id} className="rounded-lg bg-muted p-3"><p className="text-sm font-semibold">{m.sender?.name}</p><p>{m.message}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString('pt-BR')}</p></div>)}</div><div className="mt-4 flex gap-2"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escreva uma mensagem para o órgão..." /><Button onClick={send} size="icon" aria-label="Enviar mensagem"><Send className="h-4 w-4" /></Button></div></div>
    </div>
  );
};

export default ReclamacaoDetalhePage;
