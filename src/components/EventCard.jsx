import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Heart, MessageCircle, MapPin, Calendar, Clock, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import eventService from '@/services/eventService';
import { toast } from 'sonner';

const EventCard = ({ evento, onEventoClick, onEventoUpdate, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isLiked = evento.curtidas?.some(like => like.userId === user?.id);
  const isAuthor = user && evento.autorId === user.id;
  const likesCount = evento.curtidas?.length || 0;
  const commentsCount = evento.comentarios?.length || 0;

  const handleLike = () => {
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para curtir eventos');
      return;
    }
    const updatedEvent = eventService.toggleLike(evento.id, user.id);
    if (updatedEvent && onEventoUpdate) onEventoUpdate(updatedEvent);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) return toast.error('Você precisa estar logado para comentar');
    if (!newComment.trim()) return toast.error('Digite um comentário');

    setIsSubmittingComment(true);
    try {
      const comment = eventService.addComment(
        evento.id,
        user.id,
        user.nome || user.name || 'Usuário',
        newComment.trim()
      );
      if (comment) {
        setNewComment('');
        toast.success('Comentário adicionado!');
        const updatedEvent = eventService.getEventById(evento.id);
        if (updatedEvent && onEventoUpdate) onEventoUpdate(updatedEvent);
      }
    } catch {
      toast.error('Erro ao adicionar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!isAuthenticated()) return;
    const success = eventService.removeComment(evento.id, commentId, user.id);
    if (success) {
      toast.success('Comentário removido');
      const updatedEvent = eventService.getEventById(evento.id);
      if (updatedEvent && onEventoUpdate) onEventoUpdate(updatedEvent);
    } else {
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

  return (
    <Card className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
      <CardHeader className="space-y-4 flex-shrink-0">
        {/* Autor e Data */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={evento.autorAvatar} />
              <AvatarFallback>{(evento.autorNome || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{evento.autorNome || 'Usuário Anônimo'}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(evento.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Badge className={getStatusColor(evento.status)}>{evento.status}</Badge>
            {isAuthor && (
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:text-blue-700" onClick={(e) => { e.stopPropagation(); onEdit(evento); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); onDelete(evento.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            {evento.prioridade && (
              <Badge className={getPriorityColor(evento.prioridade)}>{evento.prioridade}</Badge>
            )}
          </div>
        </div>

        {/* Imagem */}
        {evento.imageUrl && (
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={evento.imageUrl}
              alt={evento.titulo}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

         {/* Título */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {evento.titulo}
            </h3>
          </div>


        {/* Tags */}
        {evento.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {evento.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {evento.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{evento.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          {evento.endereco && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{evento.endereco}</span>
            </div>
          )}
          {evento.dataInicio && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(evento.dataInicio)}
                {evento.dataFim && evento.dataFim !== evento.dataInicio && ` - ${formatDate(evento.dataFim)}`}
              </span>
            </div>
          )}
          {evento.horario && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{evento.horario}</span>
            </div>
          )}
          {evento.preco && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{evento.preco}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col justify-end mt-auto space-y-3">
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

	          <div className="flex items-center space-x-2">
	            <Button
	              variant="outline"
	              size="icon"
	              onClick={(e) => {
	                e.stopPropagation();
	                navigate(`/mapas?lat=${evento.latitude || -23.5505}&lng=${evento.longitude || -46.6333}`);
	              }}
	              className="h-8 w-8 flex-shrink-0"
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
            {evento.comentarios?.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {evento.comentarios.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2 p-2 bg-muted/50 rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {(comment.userName || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">{comment.userName}</p>
                        <div className="flex items-center space-x-1">
                          <p className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</p>
                          {comment.userId === user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="h-auto p-1 text-xs text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
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
