import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, User, Heart, MessageCircle, Share2, DollarSign, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/contexts/UserContext';
import eventService from '@/services/eventService';
import { toast } from 'sonner';

const DetalheEvento = ({ evento, onVoltar, onEventoUpdate }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [currentEvento, setCurrentEvento] = useState(evento);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    setCurrentEvento(evento);
  }, [evento]);

  const isLiked = currentEvento.curtidas?.some(like => like.userId === user?.id);
  const likesCount = currentEvento.curtidas?.length || 0;
  const commentsCount = currentEvento.comentarios?.length || 0;

  const handleLike = () => {
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para curtir eventos');
      return;
    }

    const updatedEvent = eventService.toggleLike(currentEvento.id, user.id);
    if (updatedEvent) {
      setCurrentEvento(updatedEvent);
      if (onEventoUpdate) {
        onEventoUpdate(updatedEvent);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    setIsSubmittingComment(true);

    try {
      const comment = eventService.addComment(
        currentEvento.id, 
        user.id, 
        user.nome || user.name || 'Usuário', 
        newComment.trim()
      );

      if (comment) {
        setNewComment('');
        toast.success('Comentário adicionado!');
        
        // Atualizar o evento
        const updatedEvent = eventService.getEventById(currentEvento.id);
        if (updatedEvent) {
          setCurrentEvento(updatedEvent);
          if (onEventoUpdate) {
            onEventoUpdate(updatedEvent);
          }
        }
      }
    } catch (error) {
      toast.error('Erro ao adicionar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!isAuthenticated()) return;

    const success = eventService.removeComment(currentEvento.id, commentId, user.id);
    if (success) {
      toast.success('Comentário removido');
      const updatedEvent = eventService.getEventById(currentEvento.id);
      if (updatedEvent) {
        setCurrentEvento(updatedEvent);
        if (onEventoUpdate) {
          onEventoUpdate(updatedEvent);
        }
      }
    } else {
      toast.error('Erro ao remover comentário');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentEvento.titulo,
          text: currentEvento.descricao,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL para clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      } catch (error) {
        toast.error('Erro ao copiar link');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolvido':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case 'alta':
      case 'urgente':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'media':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'baixa':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onVoltar}
            className="flex items-center gap-2 mb-4 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para eventos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagem do Evento */}
            {currentEvento.imageUrl && (
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={currentEvento.imageUrl}
                  alt={currentEvento.titulo}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}

            {/* Informações do Autor */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentEvento.autorAvatar} />
                      <AvatarFallback>
                        {(currentEvento.autorNome || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {currentEvento.autorNome || 'Usuário Anônimo'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado em {formatDateTime(currentEvento.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(currentEvento.status)}>
                      {currentEvento.status}
                    </Badge>
                    {currentEvento.prioridade && (
                      <Badge className={getPriorityColor(currentEvento.prioridade)}>
                        {currentEvento.prioridade}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Título e Descrição */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">
                {currentEvento.titulo}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentEvento.descricao}
              </p>
            </div>

            {/* Tags */}
            {currentEvento.tags && currentEvento.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {currentEvento.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

	            {/* Botões de Ação */}
	            <div className="flex items-center justify-between border-t border-b py-4">
	              <div className="flex items-center space-x-6">
	                {/* Botão Ver no Mapa */}
	                <Button
	                  variant="outline"
	                  size="sm"
	                  onClick={() => navigate(`/mapas?lat=${currentEvento.latitude || -23.5505}&lng=${currentEvento.longitude || -46.6333}`)}
	                  className="flex items-center space-x-2"
	                >
	                  <MapPin className="h-4 w-4" />
	                  <span>Ver no mapa</span>
	                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${
                    isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount} curtidas</span>
                </Button>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  <span>{commentsCount} comentários</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Compartilhar</span>
              </Button>
            </div>

            {/* Seção de Comentários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Comentários ({commentsCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formulário de Novo Comentário */}
                {isAuthenticated() ? (
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="min-h-[100px]"
                      disabled={isSubmittingComment}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                      >
                        {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">
                      Faça login para comentar neste evento
                    </p>
                  </div>
                )}

                <Separator />

                {/* Lista de Comentários */}
                {currentEvento.comentarios && currentEvento.comentarios.length > 0 ? (
                  <div className="space-y-4">
                    {currentEvento.comentarios.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(comment.userName || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">
                              {comment.userName}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(comment.createdAt)}
                              </p>
                              {comment.userId === user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="h-auto p-1 text-red-500 hover:text-red-700"
                                >
                                  Remover
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum comentário ainda.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Seja o primeiro a comentar!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Evento */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentEvento.endereco && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">
                        {currentEvento.endereco}
                      </p>
                    </div>
                  </div>
                )}

                {currentEvento.dataInicio && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Data</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(currentEvento.dataInicio)}
                        {currentEvento.dataFim && currentEvento.dataFim !== currentEvento.dataInicio && 
                          ` - ${formatDate(currentEvento.dataFim)}`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {currentEvento.horario && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Horário</p>
                      <p className="text-sm text-muted-foreground">
                        {currentEvento.horario}
                      </p>
                    </div>
                  </div>
                )}

                {currentEvento.preco && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Preço</p>
                      <p className="text-sm text-muted-foreground">
                        {currentEvento.preco}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Organizador</p>
                    <p className="text-sm text-muted-foreground">
                      {currentEvento.organizador || currentEvento.autorNome}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Curtidas</span>
                  <span className="font-medium">{likesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comentários</span>
                  <span className="font-medium">{commentsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participantes</span>
                  <span className="font-medium">{currentEvento.participantes || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalheEvento;
