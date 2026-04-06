import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Heart, MessageCircle, MapPin, Calendar, Clock, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import apiEventService from '@/services/apiEventService';
import { toast } from 'sonner';

const EventCard = ({ evento, onEventoClick, onEventoUpdate, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localEvento, setLocalEvento] = useState(evento || {});

  // Sincroniza o estado local quando a prop evento muda
  useEffect(() => {
    if (evento) {
      setLocalEvento(evento);
    }
  }, [evento]);

  // Se não tem evento válido ainda, retorna nulo para não quebrar a tela
  if (!localEvento || !localEvento.id) {
    return null;
  }

  const isLiked = localEvento?.likes?.some(like => like.userId === user?.id) || localEvento?.curtidas?.some(like => like.userId === user?.id);
  const isAuthor = user && (localEvento?.autorId || localEvento?.authorId) === user.id;
  const likesCount = localEvento?.likes?.length || localEvento?.curtidas?.length || 0;
  // Usando primeiramente o contador otimizado da Trigger (commentsCount), com fallback para o .length se necessário
  const commentsCount = localEvento?.commentsCount ?? (localEvento?.comments?.length || localEvento?.comentarios?.length || 0);

  const handleLike = async () => {
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para curtir eventos');
      return;
    }
    try {
      const response = await apiEventService.toggleLike(localEvento.id);
      
      // Extrair o evento atualizado da resposta
      const updatedEvent = response?.evento || response;
      
      if (updatedEvent && updatedEvent.id) {
        setLocalEvento(updatedEvent);
        if (onEventoUpdate) {
          onEventoUpdate(updatedEvent);
        }
      }
    } catch (error) {
      toast.error('Erro ao curtir evento');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) return toast.error('Você precisa estar logado para comentar');
    if (!newComment.trim()) return toast.error('Digite um comentário');

    setIsSubmittingComment(true);
    try {
      const response = await apiEventService.addComment(localEvento.id, newComment.trim());
      
      // A sua API retorna { message: '...', comentario: { ... } }
      if (response && response.comentario) {
        setNewComment('');
        toast.success('Comentário adicionado!');
        
        // Atualiza a lista de comentários localmente sem precisar recarregar tudo do banco
        const listaAtual = localEvento.comments || localEvento.comentarios || [];
        const eventoAtualizado = {
          ...localEvento,
          comments: [...listaAtual, response.comentario],
          commentsCount: (localEvento.commentsCount || listaAtual.length) + 1
        };

        setLocalEvento(eventoAtualizado);
        if (onEventoUpdate) {
          onEventoUpdate(eventoAtualizado);
        }
      }
    } catch (error) {
      toast.error('Erro ao adicionar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated()) return;
    try {
      await apiEventService.deleteComment(localEvento.id, commentId);
      const updatedEvent = await apiEventService.getEventById(localEvento.id);
      if (updatedEvent && onEventoUpdate) {
        onEventoUpdate(updatedEvent);
        setLocalEvento(updatedEvent);
        toast.success('Comentário removido!');
      }
    } catch (error) {
      toast.error('Erro ao remover comentário');
    }
  };

  const getStatusColor = (status) => ({
    ativo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    resolvido: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300');

  const getPriorityColor = (prioridade) => ({
    alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    urgente: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    media: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    baixa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }[prioridade] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300');

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('pt-BR') : '';

  // Determina o nome do autor do evento de forma segura (mock ou banco real)
  const eventAuthorName = localEvento?.autorNome || localEvento?.author?.name || 'Usuário Anônimo';
  const eventAuthorAvatar = localEvento?.autorAvatar || localEvento?.author?.avatar;
  const initialChar = eventAuthorName ? eventAuthorName.charAt(0).toUpperCase() : 'U';

  return (
    <Card className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
      <CardHeader className="space-y-4 shrink-0">
        {/* Autor e status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={eventAuthorAvatar} />
              <AvatarFallback>{initialChar}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{eventAuthorName}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(localEvento.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Badge className={getStatusColor(localEvento.status)}>{localEvento.status}</Badge>
            {localEvento.prioridade && (
              <Badge className={getPriorityColor(localEvento.prioridade)}>{localEvento.prioridade}</Badge>
            )}
          </div>
        </div>

        {/* Imagem */}
        {localEvento.imageUrl && (
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={localEvento.imageUrl}
              alt={localEvento.titulo || localEvento.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Título */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {localEvento.titulo || localEvento.title}
          </h3>
        </div>

        {/* Tags */}
        {localEvento.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {localEvento.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {localEvento.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{localEvento.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="grow space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          {localEvento.endereco && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{localEvento.endereco}</span>
            </div>
          )}
          {localEvento.dataInicio && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(localEvento.dataInicio)}
                {localEvento.dataFim && localEvento.dataFim !== localEvento.dataInicio && ` - ${formatDate(localEvento.dataFim)}`}
              </span>
            </div>
          )}
          {localEvento.horario && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{localEvento.horario}</span>
            </div>
          )}
          {localEvento.preco && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{localEvento.preco}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col justify-end mt-auto space-y-3">
        {/* Like e Comentário */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentsCount}</span>
            </Button>
          </div>
        </div>

        {/* Botões Editar / Excluir / Ver Detalhes */}
        <div className="flex items-center justify-between w-full">
          {isAuthor && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-500 hover:text-blue-700"
                onClick={(e) => { e.stopPropagation(); onEdit(evento); }}
              >
                <Pencil className="h-4 w-4" /> 
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={(e) => { e.stopPropagation(); onDelete(evento.id); }}
              >
                <Trash2 className="h-4 w-4 " /> 
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/mapas?lat=${evento.latitude || -23.5505}&lng=${evento.longitude || -46.6333}`);
              }}
              className="h-8 w-8 shrink-0"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEventoClick && onEventoClick(evento)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>Ver Detalhes</span>
            </Button>
          </div>
        </div>

        {/* Comentários */}
        {showComments && (
          <div className="w-full space-y-3 border-t pt-3">
            {(localEvento?.comments?.length > 0 || localEvento?.comentarios?.length > 0) && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {(localEvento.comments || localEvento.comentarios).map((comment) => {
                  // Pega o nome do autor que vem do banco de dados (author.name) ou fallback para userName/Usuário
                  const authorName = comment?.author?.name || comment?.userName || 'Usuário';
                  // Pega o ID do autor para verificar se é o dono do comentário
                  const authorId = comment?.author?.id || comment?.authorId || comment?.userId;
                  
                  return (
                    <div key={comment.id || Math.random()} className="flex items-start space-x-2 p-2 bg-primary/5 border border-primary/10 rounded group">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {authorName ? authorName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-foreground">{authorName}</p>
                          <div className="flex items-center space-x-1">
                            <p className="text-[10px] text-muted-foreground">{formatDateTime(comment?.createdAt)}</p>
                            {authorId && user?.id && String(authorId) === String(user.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="h-4 w-4 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Excluir comentário"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{comment?.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isAuthenticated() ? (
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="min-h-[60px] text-sm"
                  disabled={isSubmittingComment}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isSubmittingComment || !newComment.trim()}>
                    {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Faça login para comentar
              </p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
