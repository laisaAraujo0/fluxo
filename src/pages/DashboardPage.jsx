import { useState } from 'react';
import { BarChart3, TrendingUp, Users, MapPin, Settings, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RealTimeStats from '@/components/RealTimeStats';
import DashboardCharts from '@/components/DashboardCharts';
import { useUser } from '@/contexts/UserContext';

const DashboardPage = () => {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExport = () => {
    // Simular exportação de dados
    const data = {
      timestamp: new Date().toISOString(),
      totalEvents: 1234,
      activeUsers: 89,
      resolvedToday: 12
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h2>
            <p className="text-muted-foreground">
              Visão geral das atividades e estatísticas da plataforma
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab de Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <RealTimeStats />
          </TabsContent>

          {/* Tab de Análises */}
          <TabsContent value="analytics" className="space-y-6">
            <DashboardCharts />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Tendências Mensais
                  </CardTitle>
                  <CardDescription>
                    Análise de crescimento e padrões de uso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Eventos Reportados</span>
                      <span className="text-sm font-medium text-green-600">+18.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de Resolução</span>
                      <span className="text-sm font-medium text-blue-600">87.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Satisfação do Usuário</span>
                      <span className="text-sm font-medium text-purple-600">4.2/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tempo Médio de Resposta</span>
                      <span className="text-sm font-medium text-orange-600">2.3 dias</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Regional
                  </CardTitle>
                  <CardDescription>
                    Distribuição de eventos por região
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Centro</span>
                      <span className="text-sm font-medium">342 eventos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Zona Norte</span>
                      <span className="text-sm font-medium">289 eventos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Zona Sul</span>
                      <span className="text-sm font-medium">234 eventos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Zona Leste</span>
                      <span className="text-sm font-medium">198 eventos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Zona Oeste</span>
                      <span className="text-sm font-medium">171 eventos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Engajamento</CardTitle>
                <CardDescription>
                  Métricas de interação dos usuários com a plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12.5K</div>
                    <p className="text-sm text-muted-foreground">Visualizações/dia</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">2.3K</div>
                    <p className="text-sm text-muted-foreground">Curtidas/dia</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">856</div>
                    <p className="text-sm text-muted-foreground">Comentários/dia</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">4.2</div>
                    <p className="text-sm text-muted-foreground">Avaliação média</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Relatórios */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Relatório Mensal</CardTitle>
                  <CardDescription>
                    Resumo completo das atividades do mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Análise de Categorias</CardTitle>
                  <CardDescription>
                    Distribuição e tendências por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Excel
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Performance Regional</CardTitle>
                  <CardDescription>
                    Estatísticas por região da cidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Usuários Ativos</CardTitle>
                  <CardDescription>
                    Relatório de engajamento dos usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Tempo de Resolução</CardTitle>
                  <CardDescription>
                    Análise de eficiência operacional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Excel
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Relatório Customizado</CardTitle>
                  <CardDescription>
                    Crie um relatório personalizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificação</CardTitle>
                  <CardDescription>
                    Gerencie como e quando receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Novos eventos</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eventos resolvidos</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatórios automáticos</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferências do Dashboard</CardTitle>
                  <CardDescription>
                    Personalize a exibição do seu dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Atualização automática</span>
                    <Button variant="outline" size="sm">Ativado</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tema escuro</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Densidade de dados</span>
                    <Button variant="outline" size="sm">Média</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integração de Dados</CardTitle>
                  <CardDescription>
                    Configure fontes de dados externas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Externa</span>
                    <Button variant="outline" size="sm">Conectar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Webhook</span>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup automático</span>
                    <Button variant="outline" size="sm">Ativar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Configurações de segurança e acesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Autenticação 2FA</span>
                    <Button variant="outline" size="sm">Ativar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Log de atividades</span>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessões ativas</span>
                    <Button variant="outline" size="sm">Gerenciar</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;
