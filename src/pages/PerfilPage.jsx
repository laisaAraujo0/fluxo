import { useState, useEffect } from 'react';
import { Settings, Edit, Calendar, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConfiguracoesPerfil from '@/components/ConfiguracoesPerfil';
import EventCard from '@/components/EventCard';
import { useUser } from '@/contexts/UserContext';
import userActivityService from '@/services/userActivityService';
import userProfileService from '@/services/userProfileService';
import { toast } from 'sonner';

const PerfilPage = () => {
  const { user, isAuthenticated, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState("eventos");
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [userEvents, setUserEvents] = useState([]);
  const [userLikedEvents, setUserLikedEvents] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [userData, setUserData] = useState({
    nome: user?.nome || user?.name || "Usuário",
    email: user?.email || "usuario@example.com",
    cidade: user?.cidade || "Não informado",
    estado: user?.estado || "Não informado",
    telefone: user?.telefone || "",
    bio: user?.bio || "",
    profilePic: user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCTgZH5QmaCBG5kBLgV5LYcelEsV1n08WAfNFX6QsoH9DbTLkP8ucrf4-7Igm0NH1UoG5kcADmvkXgKUReyLL1Ylt1mfQeAiXKxq-8kyOv0OZDCBXe7iNXqAHcy3Ja3k9cmZ00vEaGUMXjbz6B0qdxeDpoAZIpV9D3iYmU9KF6j9rWwDW9rw9mgFvsBX6z23vT8c0oxB2fz-w99BEBxjt_MKc539cD4RgfhbwnIK0ZIBNvDqoAQhHiD_Id_lHd7vUM9BY49RYikIA",
    privacidade: {
      mostrarEmail: user?.mostrarEmail !== false,
      perfilPublico: user?.perfilPublico !== false,
      mostrarCidade: user?.mostrarCidade !== false,
      mostrarTelefone: user?.mostrarTelefone !== false,
    },
  });

  // Carregar dados do perfil do servidor ao montar o componente
  useEffect(() => {
    if (isAuthenticated() && user) {
      loadUserProfile();
      loadUserData();
    }
  }, [user, isAuthenticated]);

  // Função para carregar perfil completo do servidor
  const loadUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const profileData = await userProfileService.getUserProfile();
      
      if (profileData && profileData.usuario) {
        const profileUser = profileData.usuario;
        
        // Atualizar estado local com dados do servidor
        setUserData(prev => ({
          ...prev,
          nome: profileUser.nome || prev.nome,
          email: profileUser.email || prev.email,
          cidade: profileUser.cidade || prev.cidade,
          estado: profileUser.estado || prev.estado,
          telefone: profileUser.telefone || prev.telefone,
          bio: profileUser.bio || prev.bio,
          profilePic: profileUser.avatar || prev.profilePic,
          privacidade: {
            mostrarEmail: profileUser.mostrarEmail !== false,
            perfilPublico: profileUser.perfilPublico !== false,
            mostrarCidade: profileUser.mostrarCidade !== false,
            mostrarTelefone: profileUser.mostrarTelefone !== false,
          }
        }));
        
        // Atualizar contexto do usuário com dados sincronizados
        updateUser({
          nome: profileUser.nome,
          email: profileUser.email,
          cidade: profileUser.cidade,
          estado: profileUser.estado,
          telefone: profileUser.telefone,
          bio: profileUser.bio,
          avatar: profileUser.avatar,
          mostrarEmail: profileUser.mostrarEmail,
          perfilPublico: profileUser.perfilPublico,
          mostrarCidade: profileUser.mostrarCidade,
          mostrarTelefone: profileUser.mostrarTelefone,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Fallback: usar dados do contexto se a API falhar
      setUserData(prev => ({
        ...prev,
        nome: user?.nome || prev.nome,
        email: user?.email || prev.email,
        cidade: user?.cidade || prev.cidade,
        estado: user?.estado || prev.estado,
        telefone: user?.telefone || prev.telefone,
        bio: user?.bio || prev.bio,
        profilePic: user?.avatar || prev.profilePic,
      }));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadUserData = () => {
    const stats = userActivityService.getUserStats(user.id);
    const events = userActivityService.getUserEvents(user.id);
    const likedEvents = userActivityService.getUserLikedEvents(user.id);
    const comments = userActivityService.getUserComments(user.id);

    setUserStats(stats);
    setUserEvents(events);
    setUserLikedEvents(likedEvents);
    setUserComments(comments);
  };

  const handleEventoUpdate = (updatedEvent) => {
    setUserEvents(prevEvents =>
      prevEvents.map(evento =>
        evento.id === updatedEvent.id ? updatedEvent : evento
      )
    );
    loadUserData();
  };

  const handleShowConfiguracoes = () => setShowConfiguracoes(true);
  const handleVoltarPerfil = () => {
    setShowConfiguracoes(false);
    // Recarregar dados do perfil ao voltar para sincronizar qualquer alteração
    loadUserProfile();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

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
          <p className="mt-2 text-base text-muted-foreground">
            {userData.privacidade?.perfilPublico ? `${userData.cidade}, ${userData.estado}` : 'Localização Privada'}
          </p>
          {userData.bio && (
            <p className="mt-2 text-sm text-muted-foreground italic">
              "{userData.bio}"
            </p>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl overflow-y-auto">
          <Card className="text-center overflow-y-auto">
            <CardContent className="p-4 overflow-y-auto">
              <div className="text-2xl font-bold text-primary">{userStats.eventosCreated || 0}</div>
              <div className="text-sm text-muted-foreground">Eventos Criados</div>
            </CardContent>
          </Card>
          <Card className="text-center overflow-y-auto">
            <CardContent className="p-4 overflow-y-auto">
              <div className="text-2xl font-bold text-red-500">{userStats.eventosLiked || 0}</div>
              <div className="text-sm text-muted-foreground">Curtidas Dadas</div>
            </CardContent>
          </Card>
          <Card className="text-center overflow-y-auto">
            <CardContent className="p-4 overflow-y-auto">
              <div className="text-2xl font-bold text-blue-500">{userStats.comentariosFeitos || 0}</div>
              <div className="text-sm text-muted-foreground">Comentários</div>
            </CardContent>
          </Card>
          <Card className="text-center overflow-y-auto">
            <CardContent className="p-4 overflow-y-auto">
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
            disabled={isLoadingProfile}
          >
            <Edit className="h-4 w-4" />
            {isLoadingProfile ? 'Carregando...' : 'Editar Perfil'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Configurações da conta"
            onClick={handleShowConfiguracoes}
            disabled={isLoadingProfile}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eventos">
            Eventos ({userStats.eventosCreated || 0})
          </TabsTrigger>
          <TabsTrigger value="curtidas">
            Curtidas ({userStats.eventosLiked || 0})
          </TabsTrigger>
          <TabsTrigger value="comentarios">
            Comentários ({userStats.comentariosFeitos || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="mt-8 overflow-y-auto">
          {userEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
              {userEvents.map((evento) => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                  onEventoUpdate={handleEventoUpdate}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-y-auto">
              <CardContent className="text-center py-12 overflow-y-auto">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não criou nenhum evento.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="curtidas" className="mt-8 overflow-y-auto">
          {userLikedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
              {userLikedEvents.map((evento) => (
                <EventCard
                  key={evento.id}
                  evento={evento}
                  onEventoUpdate={handleEventoUpdate}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-y-auto">
              <CardContent className="text-center py-12 overflow-y-auto">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não curtiu nenhum evento.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comentarios" className="mt-8 overflow-y-auto">
          {userComments.length > 0 ? (
            <div className="space-y-4 overflow-y-auto">
              {userComments.map((comentario) => (
                <Card key={comentario.id} className="overflow-y-auto">
                  <CardHeader className="pb-3 overflow-y-auto">
                    <div className="flex items-center justify-between gap-2 overflow-y-auto">
                      <CardTitle className="text-base">
                        {comentario.eventoTitulo}
                      </CardTitle>
                      <Badge variant="secondary">
                        {formatDateTime(comentario.createdAt)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-y-auto">
                    <p className="text-muted-foreground">{comentario.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-y-auto">
              <CardContent className="text-center py-12 overflow-y-auto">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não fez nenhum comentário.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerfilPage;
