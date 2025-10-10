import { useState, useEffect } from 'react';
import { TrendingUp, Users, MapPin, Clock, Activity, Eye, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const RealTimeStats = () => {
  const [stats, setStats] = useState({
    totalEvents: 1234,
    activeUsers: 89,
    resolvedToday: 12,
    avgResponseTime: '2.3 dias',
    topCategory: 'Infraestrutura',
    recentActivity: [],
    categoryStats: [
      { name: 'Infraestrutura', count: 456, percentage: 37, trend: '+12%' },
      { name: 'Segurança', count: 234, percentage: 19, trend: '+8%' },
      { name: 'Meio Ambiente', count: 189, percentage: 15, trend: '+15%' },
      { name: 'Mobilidade', count: 156, percentage: 13, trend: '+5%' },
      { name: 'Outros', count: 199, percentage: 16, trend: '+3%' }
    ],
    hourlyActivity: [
      { hour: '00:00', events: 2 },
      { hour: '06:00', events: 8 },
      { hour: '12:00', events: 25 },
      { hour: '18:00', events: 18 },
      { hour: '23:59', events: 5 }
    ]
  });

  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      // Simular nova atividade
      const activities = [
        'Novo evento reportado em Centro',
        'Evento resolvido na Zona Norte',
        'Usuário curtiu evento em Zona Sul',
        'Comentário adicionado em evento',
        'Evento atualizado pelo administrador'
      ];

      const newActivity = {
        id: Date.now(),
        text: activities[Math.floor(Math.random() * activities.length)],
        timestamp: new Date(),
        type: Math.random() > 0.5 ? 'event' : 'interaction'
      };

      setLiveUpdates(prev => [newActivity, ...prev.slice(0, 4)]);

      // Atualizar estatísticas ocasionalmente
      if (Math.random() > 0.7) {
        setStats(prev => ({
          ...prev,
          totalEvents: prev.totalEvents + Math.floor(Math.random() * 3),
          activeUsers: Math.max(50, prev.activeUsers + Math.floor(Math.random() * 10) - 5),
          resolvedToday: prev.resolvedToday + (Math.random() > 0.8 ? 1 : 0)
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return `${seconds}s atrás`;
    if (minutes < 60) return `${minutes}m atrás`;
    return timestamp.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">Online agora</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+25%</span> vs ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-15%</span> vs mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade em tempo real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveUpdates.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aguardando atividade...</p>
              ) : (
                liveUpdates.map((update) => (
                  <div key={update.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      update.type === 'event' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{update.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(update.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryStats.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category.trend}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {category.count}
                      </span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de engajamento */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Engajamento (Últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-sm text-muted-foreground">Visualizações</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-2xl font-bold">2.3K</div>
              <p className="text-sm text-muted-foreground">Curtidas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold">856</div>
              <p className="text-sm text-muted-foreground">Comentários</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de status do sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Sistema Operacional</span>
            </div>
            <Badge variant="outline" className="text-green-600">
              99.9% Uptime
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">API Response</p>
              <p className="font-medium">45ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Database</p>
              <p className="font-medium">Healthy</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Update</p>
              <p className="font-medium">2 min ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;
