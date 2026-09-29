import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { buscarReclamacao, alterarStatus, enviarMensagem, listarEquipe, atribuirReclamacao } from '@/services/complaintService';
import { subscribeToBroadcast, unsubscribeFromBroadcast } from '@/services/socketService';

const labels = { RECEIVED:'Recebida', FORWARDED:'Encaminhada', IN_ANALYSIS:'Em análise', WAITING_INFORMATION:'Aguardando informação', SCHEDULED:'Programada', IN_PROGRESS:'Em execução', RESOLVED:'Resolvida', REOPENED:'Reaberta' };

const fileToDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });

const AdminComplaintDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [prediction, setPrediction] = useState('');
  const [resolution, setResolution] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [team, setTeam] = useState([]);
  const [assignee, setAssignee] = useState('');

  const load = async () => { try { const data = await buscarReclamacao(id); setItem(data); setStatus(data.status); setResolution(data.resolutionDescription || ''); } catch (e) { toast.error(e.response?.data?.error || 'Erro ao carregar.'); } };
  useEffect(() => { load(); listarEquipe().then(setTeam).catch(() => {}); const refresh = (x) => x?.complaintId === id && load(); subscribeToBroadcast('complaint:updated', refresh); return () => unsubscribeFromBroadcast('complaint:updated', refresh); }, [id]);

  if (!item) return <div className="p-8">Carregando...</div>;

  const saveStatus = async () => {
    setSending(true);
    try {
      let attachment;
      if (file) attachment = { name: file.name, mimeType: file.type, data: await fileToDataUrl(file) };
      await alterarStatus(id, { status, message, estimatedResolutionAt: prediction || undefined, resolutionDescription: resolution, attachment });
      toast.success('Solicitação atualizada.');
      setMessage(''); setFile(null); await load();
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao atualizar.'); } finally { setSending(false); }
  };

  const sendMessage = async () => { if (!message.trim()) return; try { await enviarMensagem(id, message); setMessage(''); await load(); } catch { toast.error('Erro ao enviar mensagem.'); } };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="rounded-xl border bg-card p-6"><p className="font-semibold text-primary">{item.protocol}</p><h1 className="mt-1 text-3xl font-bold">{item.title}</h1><p className="mt-2">{item.description}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{labels[item.status]}</Badge><Badge variant="outline">{item.priority}</Badge><Badge variant="outline">{item.agency?.name}</Badge>{item.department && <Badge variant="outline">{item.department.name}</Badge>}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm"><p><strong>Cidadão:</strong> {item.author?.name} ({item.author?.email})</p><p><strong>Local:</strong> {item.location}</p><p><strong>Responsável:</strong> {item.assignedUser?.name || 'Não atribuído'}</p><p><strong>Criada:</strong> {new Date(item.createdAt).toLocaleString('pt-BR')}</p></div></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4"><h2 className="text-xl font-semibold">Atualizar atendimento</h2><div><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(labels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div><div><Label>Responsável</Label><Select value={assignee} onValueChange={setAssignee}><SelectTrigger><SelectValue placeholder={item.assignedUser?.name || 'Selecionar responsável'} /></SelectTrigger><SelectContent>{team.filter((u) => ['AGENCY_ATTENDANT','AGENCY_MANAGER'].includes(u.role)).map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select><Button type="button" variant="outline" className="mt-2 w-full" disabled={!assignee} onClick={async () => { try { await atribuirReclamacao(id, assignee); toast.success('Solicitação atribuída.'); await load(); } catch (e) { toast.error(e.response?.data?.error || 'Erro ao atribuir.'); } }}>Atribuir solicitação</Button></div><div><Label>Previsão de resolução</Label><Input type="date" value={prediction} onChange={(e) => setPrediction(e.target.value)} /></div>{status === 'RESOLVED' && <div><Label>Descrição da solução</Label><Textarea required value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Ex.: Buraco reparado e pavimento recomposto." /></div>}<div><Label>Mensagem para o cidadão</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explique o que foi feito ou o próximo passo." /></div>{status === 'RESOLVED' && <div><Label>Foto da execução</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>}<Button className="w-full" onClick={saveStatus} disabled={sending}>{sending ? 'Salvando...' : 'Salvar atualização'}</Button></div>

        <div className="rounded-xl border bg-card p-6"><h2 className="mb-4 text-xl font-semibold">Histórico</h2><div className="space-y-4">{item.updates?.map((u) => <div key={u.id} className="border-l-2 pl-4"><p className="font-semibold">{labels[u.newStatus]}</p><p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleString('pt-BR')} • {u.user?.name}</p>{u.message && <p className="mt-1 text-sm">{u.message}</p>}</div>)}</div></div>
      </div>

      <div className="rounded-xl border bg-card p-6"><h2 className="mb-4 text-xl font-semibold">Mensagens</h2><div className="space-y-3">{item.messages?.map((m) => <div key={m.id} className="rounded-lg bg-muted p-3"><strong>{m.sender?.name}</strong><p>{m.message}</p><small className="text-muted-foreground">{new Date(m.createdAt).toLocaleString('pt-BR')}</small></div>)}</div><div className="mt-4 flex gap-2"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enviar uma mensagem sem alterar o status..." /><Button onClick={sendMessage}>Enviar</Button></div></div>

      {item.attachments?.length > 0 && <div className="rounded-xl border bg-card p-6"><h2 className="mb-4 text-xl font-semibold">Anexos</h2><div className="grid gap-4 sm:grid-cols-2">{item.attachments.map((a) => a.mimeType?.startsWith('image/') ? <img key={a.id} src={a.data} alt={a.name} className="max-h-72 rounded-lg object-contain" /> : <a key={a.id} href={a.data} download={a.name} className="text-primary underline">{a.name}</a>)}</div></div>}
    </div>
  );
};

export default AdminComplaintDetailPage;
