import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Calendar, MapPin, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  buscarNotificacoes, 
  marcarComoLida as marcarComoLidaApi,
  marcarTodasComoLidas as marcarTodasComoLidasApi,
  deletarNotificacao as deletarNotificacaoApi
} from '@/services/notificacoesApi';
import { useUser } from '@/contexts/UserContext';

const NotificationCenter = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    
    try {
      const response = await buscarNotificacoes(user?.id);
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        toast.error('Erro ao carregar notificações');
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id) => {
    try {
      const response = await marcarComoLidaApi(id);
      
      if (response.success) {
        setNotifications(notifications.map(notif =>
          notif.id === id ? { ...notif, lida: true } : notif
        ));
        toast.success('Notificação marcada como lida');
      } else {
        toast.error('Erro ao marcar notificação como lida');
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const response = await marcarTodasComoLidasApi(user?.id);
      
      if (response.success) {
        setNotifications(notifications.map(notif => ({ ...notif, lida: true })));
        toast.success('Todas as notificações foram marcadas como lidas');
      } else {
        toast.error('Erro ao marcar todas as notificações como lidas');
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  };

  const excluirNotificacao = async (id) => {
    try {
      const response = await deletarNotificacaoApi(id);
      
      if (response.success) {
        setNotifications(notifications.filter(notif => notif.id !== id));
        toast.success('Notificação excluída');
      } else {
        toast.error('Erro ao excluir notificação');
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  const limparTodas = async () => {
    try {
      // Deletar todas as notificações
      await Promise.all(notifications.map(notif => deletarNotificacaoApi(notif.id)));
      setNotifications([]);
      toast.success('Todas as notificações foram removidas');
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      toast.error('Erro ao limpar notificações');
    }
  };

  const getNotificationIcon = (tipo) => {
    const icons = {
      evento: Calendar,
      reclamacao: AlertCircle,
      sistema: Info,
      localizacao: MapPin
    };
    return icons[tipo] || Bell;
  };

  const getNotificationColor = (tipo) => {
    const colors = {
      evento: 'text-blue-500',
      reclamacao: 'text-orange-500',
      sistema: 'text-gray-500',
      localizacao: 'text-green-500'
    };
    return colors[tipo] || 'text-gray-500';
  };

  const formatarData = (data) => {
    const date = new Date(data);
    const hoje = new Date();
    const diff = hoje - date;
    const dias = Math.floor(diff / 86400000);

    if (dias === 0) {
      const horas = Math.floor(diff / 3600000);
      if (horas === 0) {
        const minutos = Math.floor(diff / 60000);
        return `há ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
      }
      return `há ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else if (dias === 1) {
      return 'ontem';
    } else if (dias < 7) {
      return `há ${dias} dias`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'todas') return true;
    if (filter === 'nao-lidas') return !notif.lida;
    return notif.tipo === filter;
  });

  const naoLidas = notifications.filter(n => !n.lida).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Notificações
              {naoLidas > 0 && (
                <Badge variant="destructive">{naoLidas}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Acompanhe todas as suas notificações em um só lugar
            </CardDescription>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={marcarTodasComoLidas}
                disabled={naoLidas === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={limparTodas}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {notifications.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar notificações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="nao-lidas">Não lidas</SelectItem>
                <SelectItem value="evento">Eventos</SelectItem>
                <SelectItem value="reclamacao">Reclamações</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === 'todas' 
                  ? 'Nenhuma notificação' 
                  : `Nenhuma notificação ${filter === 'nao-lidas' ? 'não lida' : `de ${filter}`}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const Icon = getNotificationIcon(notif.tipo);
                const iconColor = getNotificationColor(notif.tipo);
                
                return (
                  <div
                    key={notif.id}
                    className={`
                      p-4 rounded-lg border transition-colors
                      ${notif.lida ? 'bg-background' : 'bg-muted/50'}
                      hover:bg-muted
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`font-medium ${!notif.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notif.titulo}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notif.mensagem}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatarData(notif.data)}
                            </p>
                          </div>
                          
                          {!notif.lida && (
                            <Badge variant="default" className="shrink-0">
                              Nova
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {!notif.lida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => marcarComoLida(notif.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirNotificacao(notif.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;

