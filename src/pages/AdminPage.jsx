import { useState } from 'react';
import { Plus, Users, AlertCircle, CheckCircle, Clock, TrendingUp, BarChart3, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserContext';

const AdminPage = () => {
  const { user } = useUser();
  
  const [usuarios] = useState([
    { id: 1, nome: "Ana Silva", email: "ana.silva@email.com", status: "Ativo", eventos: 12 },
    { id: 2, nome: "Carlos Mendes", email: "carlos.mendes@email.com", status: "Ativo", eventos: 8 },
    { id: 3, nome: "Beatriz Costa", email: "beatriz.costa@email.com", status: "Bloqueado", eventos: 3 },
    { id: 4, nome: "Ricardo Almeida", email: "ricardo.almeida@email.com", status: "Ativo", eventos: 15 },
    { id: 5, nome: "Sofia Pereira", email: "sofia.pereira@email.com", status: "Ativo", eventos: 6 }
  ]);

  const [eventos] = useState([
    { 
      id: 1, 
      titulo: "Buraco na Rua Principal", 
      localizacao: "Rua Principal, 123", 
      status: "Pendente",
      categoria: "Infraestrutura",
      data: "2025-10-07",
      usuario: "Ana Silva",
      prioridade: "Alta"
    },
    { 
      id: 2, 
      titulo: "Iluminação Defeituosa", 
      localizacao: "Praça Central", 
      status: "Em Andamento",
      categoria: "Infraestrutura",
      data: "2025-10-06",
      usuario: "Carlos Mendes",
      prioridade: "Média"
    },
    { 
      id: 3, 
      titulo: "Vazamento de Água", 
      localizacao: "Rua Lateral, 456", 
      status: "Pendente",
      categoria: "Saneamento",
      data: "2025-10-08",
      usuario: "Ricardo Almeida",
      prioridade: "Alta"
    },
    { 
      id: 4, 
      titulo: "Lixo Acumulado", 
      localizacao: "Avenida dos Girassóis", 
      status: "Resolvido",
      categoria: "Limpeza",
      data: "2025-10-05",
      usuario: "Sofia Pereira",
      prioridade: "Baixa"
    },
    { 
      id: 5, 
      titulo: "Pichação em Prédio", 
      localizacao: "Rua das Flores, 789", 
      status: "Pendente",
      categoria: "Segurança",
      data: "2025-10-07",
      usuario: "Beatriz Costa",
      prioridade: "Média"
    }
  ]);

  const [categorias] = useState([
    { id: 1, nome: "Infraestrutura", eventos: 1234, cor: "bg-blue-500", progresso: 75 },
    { id: 2, nome: "Segurança", eventos: 876, cor: "bg-red-500", progresso: 60 },
    { id: 3, nome: "Meio Ambiente", eventos: 543, cor: "bg-green-500", progresso: 85 },
    { id: 4, nome: "Transporte Público", eventos: 210, cor: "bg-yellow-500", progresso: 45 },
    { id: 5, nome: "Saneamento", eventos: 432, cor: "bg-cyan-500", progresso: 70 },
    { id: 6, nome: "Limpeza", eventos: 321, cor: "bg-purple-500", progresso: 90 }
  ]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Ativo':
      case 'Resolvido':
        return 'default';
      case 'Pendente':
        return 'secondary';
      case 'Em Andamento':
        return 'outline';
      case 'Bloqueado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case 'Alta':
        return 'text-red-600';
      case 'Média':
        return 'text-yellow-600';
      case 'Baixa':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleUserAction = (userId, action) => {
    console.log(`${action} usuário ${userId}`);
  };

  const handleEventAction = (eventId, action) => {
    console.log(`${action} evento ${eventId}`);
  };

  const handleCategoryAction = (categoryId, action) => {
    console.log(`${action} categoria ${categoryId}`);
  };

  // Estatísticas
  const totalUsuarios = 12345;
  const eventosAtivos = 8765;
  const eventosPendentes = 45;
  const eventosResolvidos = 7234;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Administrativo
          </h2>
          <p className="text-muted-foreground">
            {user?.nomeOrgao || 'Órgão Público'} - {user?.responsavel?.nome || 'Administrador'}
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários Registrados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsuarios.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos Ativos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventosAtivos.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+5%</span> em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventosPendentes}</div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção imediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resolvidos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventosResolvidos.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18%</span> em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de gerenciamento */}
        <Tabs defaultValue="eventos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Tab de Eventos */}
          <TabsContent value="eventos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Eventos</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os eventos reportados pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Localização
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Prioridade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {eventos.map((evento) => (
                        <tr key={evento.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-card-foreground">
                            {evento.titulo}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {evento.localizacao}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {evento.categoria}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusBadgeVariant(evento.status)}>
                              {evento.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${getPriorityColor(evento.prioridade)}`}>
                              {evento.prioridade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(evento.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-2">
                            {evento.status === 'Pendente' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800"
                                onClick={() => handleEventAction(evento.id, 'Aprovar')}
                              >
                                Aprovar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              onClick={() => handleEventAction(evento.id, 'Ver')}
                            >
                              Ver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Usuários */}
          <TabsContent value="usuarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Gerencie os usuários cadastrados na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Eventos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" scope="col">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                            {usuario.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {usuario.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {usuario.eventos}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusBadgeVariant(usuario.status)}>
                              {usuario.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={usuario.status === 'Bloqueado' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}
                              onClick={() => handleUserAction(usuario.id, usuario.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear')}
                            >
                              {usuario.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Categorias */}
          <TabsContent value="categorias" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gerenciamento de Categorias</CardTitle>
                  <CardDescription>
                    Gerencie as categorias de eventos e acompanhe o progresso
                  </CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Categoria
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorias.map((categoria) => (
                    <Card key={categoria.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${categoria.cor}`} />
                            <CardTitle className="text-base">{categoria.nome}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCategoryAction(categoria.id, 'Editar')}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total de eventos</span>
                            <span className="font-medium">{categoria.eventos}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium">{categoria.progresso}%</span>
                            </div>
                            <Progress value={categoria.progresso} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Relatórios */}
          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relatórios de Performance
                  </CardTitle>
                  <CardDescription>
                    Análises detalhadas sobre o desempenho da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório Mensal de Eventos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Análise de Usuários Ativos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Estatísticas por Categoria
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Tempo de Resolução
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas Rápidas</CardTitle>
                  <CardDescription>
                    Indicadores importantes do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Resolução</span>
                    <span className="text-2xl font-bold text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo Médio de Resposta</span>
                    <span className="text-2xl font-bold">2.3 dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Satisfação do Usuário</span>
                    <span className="text-2xl font-bold text-blue-600">4.2/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Eventos Este Mês</span>
                    <span className="text-2xl font-bold">1,234</span>
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

export default AdminPage;
