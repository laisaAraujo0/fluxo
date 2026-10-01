import { Heart, MessageCircle, MapPin, Calendar, Eye } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import { toast } from 'sonner';

const ReclamacaoCard = ({
  reclamacao,
  onReclamacaoClick,
}) => {

  // ==========================================
  // STATUS
  // ==========================================

  const statusMap = {
    PENDING: 'pendente',
    FORWARDED: 'encaminhada',
    IN_REVIEW: 'em análise',
    WAITING_INFORMATION: 'aguardando informação',
    SCHEDULED: 'programada',
    IN_PROGRESS: 'EM EXECUÇÃO',
    RESOLVED: 'RESOLVIDA',
    REOPENED: 'REABERTA',
    REJECTED: 'REJEITADA',
  };

  const prioridadeMap = {
    LOW: 'baixa',
    MEDIUM: 'média',
    HIGH: 'alta',
    URGENT: 'urgente',
  };

  const formatarStatus = (status) => {
    return statusMap[status] || status;
  };

  const formatarPrioridade = (priority) => {
    return prioridadeMap[priority] || priority;
  };

  // ==========================================
  // CORES
  // ==========================================

  const getStatusColor = (status) => {

    switch (status) {

      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';

      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

      case 'IN_PROGRESS':
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';

      case 'FORWARDED':
      case 'SCHEDULED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';

      case 'WAITING_INFORMATION':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';

      case 'REOPENED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';

      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const getPriorityColor = (priority) => {

    switch (priority) {

      case 'URGENT':
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';

      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';

      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // ==========================================
  // DATA
  // ==========================================

  const formatDate = (date) => {

    if (!date) {
      return '';
    }

    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return date;
    }
  };

  const formatDateTime = (date) => {

    if (!date) {
      return '';
    }

    try {
      return new Date(date).toLocaleString('pt-BR');
    } catch {
      return date;
    }
  };

  // ==========================================
  // MAPA
  // ==========================================

  const handleVerMapa = () => {

    if (
      reclamacao.latitude &&
      reclamacao.longitude
    ) {

      window.location.href =
        `/mapas?lat=${reclamacao.latitude}&lng=${reclamacao.longitude}`;

      return;
    }

    toast.info(
      'Esta reclamação ainda não possui coordenadas no mapa.'
    );
  };

  // ==========================================
  // DADOS
  // ==========================================

  const likesCount = reclamacao.likes || 0;
  const commentsCount = reclamacao.commentsCount || 0;

  // ==========================================
  // RENDER
  // ==========================================

  return (

    <Card className="
      flex flex-col h-full
      group
      hover:shadow-lg
      transition-all duration-300
      border-border/50
      hover:border-border
    ">

      {/* ======================================
          CABEÇALHO
      ====================================== */}

      <CardHeader className="space-y-4 shrink-0">

        <div className="flex items-center justify-between">

          {/* AUTOR */}

          <div className="flex items-center space-x-3">

            <Avatar className="h-8 w-8">

              <AvatarImage
                src={reclamacao.author?.avatar}
              />

              <AvatarFallback>
                {(
                  reclamacao.author?.name ||
                  'U'
                ).charAt(0).toUpperCase()}
              </AvatarFallback>

            </Avatar>

            <div>

              <p className="text-sm font-medium text-foreground">
                {reclamacao.author?.name || 'Usuário Anônimo'}
              </p>

              <p className="text-xs text-muted-foreground">
                {formatDateTime(reclamacao.createdAt)}
              </p>

            </div>

          </div>

          {/* STATUS + PRIORIDADE */}

          <div className="flex gap-2 items-center">

            <Badge
              className={getStatusColor(reclamacao.status)}
            >
              {formatarStatus(reclamacao.status)}
            </Badge>

            {reclamacao.priority && (

              <Badge
                className={getPriorityColor(
                  reclamacao.priority
                )}
              >
                {formatarPrioridade(
                  reclamacao.priority
                )}
              </Badge>

            )}

          </div>

        </div>

      </CardHeader>

      {reclamacao.imageUrl && (
        <div className="px-6">
            <img
            src={reclamacao.imageUrl}
            alt={reclamacao.title}
            className="w-full h-48 object-cover rounded-lg"
            />
        </div>
        )}

        {/* ======================================
            TÍTULO E CATEGORIA
        ====================================== */}

        <div className="px-6 pt-4 pb-1 space-y-3">

        <h3 className="
            text-lg
            font-semibold
            text-foreground
            line-clamp-2
            group-hover:text-primary
            transition-colors
        ">
            {reclamacao.title}
        </h3>

        {reclamacao.category && (
            <div className="flex flex-wrap gap-1">
            <Badge
                variant="secondary"
                className="text-xs"
            >
                {reclamacao.category}
            </Badge>
            </div>
        )}

        </div>

      <CardContent className="grow space-y-3">

        <div className="grid grid-cols-1 gap-2 text-sm">

          {/* LOCALIZAÇÃO */}

          {reclamacao.location && (

            <div className="
              flex
              items-center
              gap-2
              text-muted-foreground
            ">

              <MapPin className="h-4 w-4 shrink-0" />

              <span className="line-clamp-1">
                {reclamacao.location}
              </span>

            </div>

          )}

          {/* DATA DO REGISTRO */}

          {reclamacao.createdAt && (

            <div className="
              flex
              items-center
              gap-2
              text-muted-foreground
            ">

              <Calendar className="h-4 w-4 shrink-0" />

              <span>
                {formatDate(reclamacao.createdAt)}
              </span>

            </div>

          )}

        </div>

      </CardContent>

      {/* ======================================
          RODAPÉ
      ====================================== */}

      <CardFooter className="
        flex
        flex-col
        justify-end
        mt-auto
        space-y-3
      ">

        {/* CURTIDAS / COMENTÁRIOS */}

        <div className="
          flex
          items-center
          justify-between
          w-full
        ">

          <div className="
            flex
            items-center
            space-x-4
          ">

            <div className="
              flex
              items-center
              space-x-1
              text-muted-foreground
            ">

              <Heart className="h-4 w-4 text-pink-500" />

              <span>
                {likesCount}
              </span>

            </div>

            <div className="
              flex
              items-center
              space-x-1
              text-muted-foreground
            ">

              <MessageCircle className="h-4 w-4" />

              <span>
                {commentsCount}
              </span>

            </div>

          </div>

        </div>

        {/* ======================================
            BOTÕES
        ====================================== */}

        <div className="
          flex
          items-center
          justify-between
          w-full
        ">

          {/* MAPA */}

          <Button
            variant="outline"
            size="icon"
            onClick={handleVerMapa}
            className="h-8 w-8 shrink-0"
          >

            <MapPin className="h-4 w-4" />

          </Button>

          {/* DETALHES */}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onReclamacaoClick &&
              onReclamacaoClick(reclamacao)
            }
            className="
              flex
              items-center
              space-x-1
            "
          >

            <Eye className="h-4 w-4" />

            <span>
              Ver Detalhes
            </span>

          </Button>

        </div>

      </CardFooter>

    </Card>

  );
};

export default ReclamacaoCard;