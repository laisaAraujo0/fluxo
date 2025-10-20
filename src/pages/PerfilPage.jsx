import { useState, useEffect } from 'react';
import { Settings, Edit, Calendar, Heart, MessageCircle, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConfiguracoesPerfil from '@/components/ConfiguracoesPerfil';
import LocationPreferences from '@/components/LocationPreferences';
import EventCard from '@/components/EventCard';
import { useUser } from '@/contexts/UserContext';
import userActivityService from '@/services/userActivityService';
import eventService from '@/services/eventService';

const PerfilPage = () => {
  const { user, isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState("eventos");
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [userEvents, setUserEvents] = useState([]);
  const [userLikedEvents, setUserLikedEvents] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [userData, setUserData] = useState({
    nome: user?.nome || user?.name || "Usuário",
    email: user?.email || "usuario@example.com",
    username: user?.username || "@usuario",
    bio: "Membro ativo da comunidade",
    cidade: "São Paulo",
    estado: "SP",
    profilePic: user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCTgZH5QmaCBG5kBLgV5LYcelEsV1n08WAfNFX6QsoH9DbTLkP8ucrf4-7Igm0NH1UoG5kcADmvkXgKUReyLL1Ylt1mfQeAiXKxq-8kyOv0OZDCBXe7iNXqAHcy3Ja3k9cmZ00vEaGUMXjbz6B0qdxeDpoAZIpV9D3iYmU9KF6j9rWwDW9rw9mgFvsBX6z23vT8c0oxB2fz-w99BEBxjt_MKc539cD4RgfhbwnIK0ZIBNvDqoAQhHiD_Id_lHd7vUM9BY49RYikIA",
    privacidade: {
      mostrarEmail: true,
      mostrarCidade: true,
      perfilPublico: true,
    },
  });

  useEffect(() => {
    if (isAuthenticated() && user) {
      loadUserData();
    }
  }, [user, isAuthenticated]);

  const loadUserData = () => {
    const stats = userActivityService.getUserStats(user.id);
    const events = userActivityService.getUserEvents(user.id);
    const likedEvents = userActivityService.getUserLikedEvents(user.id);
    const comments = userActivityService.getUserComments(user.id);
    const activity = userActivityService.getRecentActivity(user.id, 20);

    setUserStats(stats);
    setUserEvents(events);
    setUserLikedEvents(likedEvents);
    setUserComments(comments);
    setRecentActivity(activity);

    // Atualizar bio com estatísticas
    setUserData(prev => ({
      ...prev,
      bio: `Membro ativo da comunidade | ${stats.eventosCreated} eventos criados | ${stats.totalActivities} atividades`
    }));
  };

  const handleEventoUpdate = (updatedEvent) => {
    // Atualizar eventos do usuário se necessário
    setUserEvents(prevEvents => 
      prevEvents.map(evento => 
        evento.id === updatedEvent.id ? updatedEvent : evento
      )
    );

    // Recarregar dados do usuário
    loadUserData();
  };

  const handleShowConfiguracoes = () => {
    setShowConfiguracoes(true);
  };

  const handleVoltarPerfil = () => {
    setShowConfiguracoes(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'evento_criado':
        return <Calendar className="h-4 w-4" />;
      case 'curtida':
        return <Heart className="h-4 w-4" />;
      case 'comentario':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'evento_criado':
        return `Criou o evento "${activity.data.titulo}"`;
      case 'curtida':
        return `Curtiu o evento "${activity.data.titulo}"`;
      case 'comentario':
        return `Comentou no evento "${activity.data.titulo}"`;
      default:
        return 'Atividade desconhecida';
    }
  };

  // Se não estiver autenticado, mostrar mensagem
  if (!isAuthenticated()) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Acesso Restrito
          </h2>
          <p className="mt-4 text-muted-foreground">
            Você precisa estar logado para ver seu perfil.
          </p>
        </div>
      </div>
    );
  }

  // Se estiver mostrando configurações, renderizar o componente de configurações
  if (showConfiguracoes) {
    return (
      <ConfiguracoesPerfil
        userData={userData}
        setUserData={setUserData}
        onVoltar={handleVoltarPerfil}
        initialSection={activeTab === "editar" ? "editar" : "perfil"}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Cabeçalho do perfil */}
      <div className="flex flex-col items-center gap-6 pb-8 text-center">
        <div className="relative">
          <Avatar className="h-32 w-32 ring-4 ring-background">
            <AvatarImage src={userData.profilePic} />
            <AvatarFallback className="text-2xl">
              {userData.nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-foreground">{userData.nome}</h2>
          <p className="text-base text-muted-foreground">{userData.username}</p>
          {userData.privacidade.mostrarCidade && (
            <p className="text-sm text-muted-foreground">
              {userData.cidade}, {userData.estado}
            </p>
          )}
          <p className="mt-2 text-base text-muted-foreground">{userData.bio}</p>
        </div>

        {/* Estatísticas do Usuário */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{userStats.eventosCreated || 0}</div>
              <div className="text-sm text-muted-foreground">Eventos Criados</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">{userStats.eventosLiked || 0}</div>
              <div className="text-sm text-muted-foreground">Curtidas Dadas</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">{userStats.comentariosFeitos || 0}</div>
              <div className="text-sm text-muted-foreground">Comentários</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">{userStats.curtidasRecebidas || 0}</div>
              <div className="text-sm text-muted-foreground">Curtidas Recebidas</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            className="flex items-center gap-2 min-w-[120px]"
            onClick={() => {
              setShowConfiguracoes(true);
              setActiveTab("editar");
            }}
          >
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Configurações da conta"
            onClick={handleShowConfiguracoes}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navegação por abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eventos">
            Eventos ({userStats.eventosCreated || 0})
          </TabsTrigger>
          <TabsTrigger value="curtidas">
            Curtidas ({userStats.eventosLiked || 0})
          </TabsTrigger>
          <TabsTrigger value="comentarios">
            Comentários ({userStats.comentariosFeitos || 0})
          </TabsTrigger>
          <TabsTrigger value="atividades">
            Atividades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="mt-8">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meus Eventos
            </h3>
            {userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userEvents.map((evento) => (
                  <EventCard
                    key={evento.id}
                    evento={evento}
                    onEventoUpdate={handleEventoUpdate}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não criou nenhum evento.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Que tal criar seu primeiro evento para a comunidade?
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="curtidas" className="mt-8">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Eventos Curtidos
            </h3>
            {userLikedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userLikedEvents.map((evento) => (
                  <EventCard
                    key={evento.id}
                    evento={evento}
                    onEventoUpdate={handleEventoUpdate}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não curtiu nenhum evento.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Explore os eventos da comunidade e curta os que mais interessam você!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comentarios" className="mt-8">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Meus Comentários
            </h3>
            {userComments.length > 0 ? (
              <div className="space-y-4">
                {userComments.map((comentario) => (
                  <Card key={comentario.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {comentario.eventoTitulo}
                        </CardTitle>
                        <Badge variant="secondary">
                          {formatDateTime(comentario.createdAt)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{comentario.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não fez nenhum comentário.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Participe das discussões comentando nos eventos!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="atividades" className="mt-8">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividade Recente
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            {getActivityText(activity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma atividade recente.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Comece a interagir com a comunidade para ver suas atividades aqui!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerfilPage;
