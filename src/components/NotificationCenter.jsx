import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { buscarNotificacoes, marcarComoLida, marcarTodasComoLidas } from '@/services/notificacoesApi';
import { useUser } from '@/contexts/UserContext';

const NotificationCenter = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    const result = await buscarNotificacoes();
    if (result.success) setNotifications(result.data);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const read = async (id) => {
    const result = await marcarComoLida(id);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notificação marcada como lida');
    }
  };

  const readAll = async () => {
    const result = await marcarTodasComoLidas();
    if (result.success) {
      setNotifications([]);
      toast.success('Notificações marcadas como lidas');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notificações <Badge>{notifications.length}</Badge></CardTitle>
          {notifications.length > 0 && <Button variant="outline" onClick={readAll}><Check className="mr-2 h-4 w-4" />Marcar todas como lidas</Button>}
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? <p className="text-center text-muted-foreground">Nenhuma notificação não lida.</p> :
            notifications.map((n) => <div key={n.id} className="rounded-lg border p-4"><p className="font-medium">{n.content}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString('pt-BR')}</p><Button size="sm" variant="ghost" className="mt-2" onClick={() => read(n.id)}>Marcar como lida</Button></div>)}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
