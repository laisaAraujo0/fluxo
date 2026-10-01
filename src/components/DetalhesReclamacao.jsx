import {
  ArrowLeft,
  MapPin,
  Heart,
  MessageCircle,
  Clock,
  User,
  CalendarDays,
  Share2,
  Tag,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import { useEffect } from 'react';
import { toast } from 'sonner';

const DetalhesReclamacao = ({
  reclamacao,
  onVoltar,
}) => {

  const navigate = useNavigate();

  // ==========================================
  // SEGURANÇA
  // ==========================================

  if (!reclamacao) {
    return null;
  }

  // ==========================================
  // SCROLL PARA O TOPO
  // ==========================================

  useEffect(() => {

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  }, []);

  // ==========================================
  // STATUS
  // ==========================================

  const statusMap = {

    PENDING: 'PENDENTE',

    FORWARDED: 'ENCAMINHADA',

    IN_REVIEW: 'EM ANÁLISE',

    WAITING_INFORMATION:
      'AGUARDANDO INFORMAÇÃO',

    SCHEDULED: 'PROGRAMADA',

    IN_PROGRESS:
      'EM EXECUÇÃO',

    RESOLVED:
      'RESOLVIDA',

    REOPENED:
      'REABERTA',

    REJECTED:
      'REJEITADA',

  };

  const prioridadeMap = {

    LOW: 'BAIXA',

    MEDIUM: 'MÉDIA',

    HIGH: 'ALTA',

    URGENT: 'URGENTE',

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

        return `
          bg-green-100
          text-green-800
          dark:bg-green-900
          dark:text-green-300
        `;

      case 'REJECTED':

        return `
          bg-red-100
          text-red-800
          dark:bg-red-900
          dark:text-red-300
        `;

      case 'IN_PROGRESS':
      case 'IN_REVIEW':

        return `
          bg-blue-100
          text-blue-800
          dark:bg-blue-900
          dark:text-blue-300
        `;

      case 'FORWARDED':
      case 'SCHEDULED':

        return `
          bg-purple-100
          text-purple-800
          dark:bg-purple-900
          dark:text-purple-300
        `;

      case 'WAITING_INFORMATION':

        return `
          bg-orange-100
          text-orange-800
          dark:bg-orange-900
          dark:text-orange-300
        `;

      default:

        return `
          bg-yellow-100
          text-yellow-800
          dark:bg-yellow-900
          dark:text-yellow-300
        `;
    }
  };

  const getPriorityColor = (priority) => {

    switch (priority) {

      case 'URGENT':
      case 'HIGH':

        return `
          bg-red-100
          text-red-800
          dark:bg-red-900
          dark:text-red-300
        `;

      case 'MEDIUM':

        return `
          bg-orange-100
          text-orange-800
          dark:bg-orange-900
          dark:text-orange-300
        `;

      case 'LOW':

        return `
          bg-green-100
          text-green-800
          dark:bg-green-900
          dark:text-green-300
        `;

      default:

        return `
          bg-gray-100
          text-gray-800
          dark:bg-gray-900
          dark:text-gray-300
        `;
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

      return new Date(date)
        .toLocaleDateString('pt-BR');

    } catch {

      return date;

    }
  };

  const formatDateTime = (date) => {

    if (!date) {
      return '';
    }

    try {

      return new Date(date)
        .toLocaleString('pt-BR');

    } catch {

      return date;

    }
  };

  // ==========================================
  // DADOS
  // ==========================================

  const likesCount =
    reclamacao.likes || 0;

  const commentsCount =
    reclamacao.commentsCount || 0;

  // ==========================================
  // MAPA
  // ==========================================

  const handleVerMapa = () => {

    if (
      reclamacao.latitude &&
      reclamacao.longitude
    ) {

      navigate(
        `/mapas?lat=${reclamacao.latitude}&lng=${reclamacao.longitude}`
      );

      return;
    }

    toast.info(
      'Esta reclamação ainda não possui coordenadas no mapa.'
    );
  };

  // ==========================================
  // COMPARTILHAR
  // ==========================================

  const handleShare = async () => {

    if (navigator.share) {

      try {

        await navigator.share({

          title: reclamacao.title,

          text:
            reclamacao.description ||
            'Reclamação registrada no Fluxo.',

          url: window.location.href,

        });

      } catch (error) {

        console.log(
          'Compartilhamento cancelado:',
          error
        );

      }

      return;
    }

    try {

      await navigator.clipboard
        .writeText(window.location.href);

      toast.success(
        'Link copiado para a área de transferência!'
      );

    } catch {

      toast.error(
        'Erro ao copiar link.'
      );

    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="
      container
      mx-auto
      px-4
      sm:px-6
      lg:px-8
      py-8
    ">

      <div className="max-w-4xl mx-auto">

        {/* ======================================
            VOLTAR
        ====================================== */}

        <div className="mb-6">

          <Button
            variant="ghost"
            onClick={onVoltar}
            className="
              flex
              items-center
              gap-2
              mb-4
              hover:text-primary
            "
          >

            <ArrowLeft className="h-4 w-4" />

            Voltar para reclamações

          </Button>

        </div>

        {/* ======================================
            GRID PRINCIPAL
        ====================================== */}

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-8
        ">

          {/* ====================================
              CONTEÚDO PRINCIPAL
          ==================================== */}

          <div className="
            lg:col-span-2
            space-y-6
          ">

            {/* ==================================
                AUTOR + STATUS
            ================================== */}

            <Card>

              <CardContent className="p-6">

                <div className="
                  flex
                  items-center
                  justify-between
                ">

                  {/* AUTOR */}

                  <div className="
                    flex
                    items-center
                    space-x-4
                  ">

                    <Avatar className="h-12 w-12">

                      <AvatarImage
                        src={
                          reclamacao.author?.avatar
                        }
                      />

                      <AvatarFallback>

                        {(
                          reclamacao.author?.name ||
                          'U'
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </AvatarFallback>

                    </Avatar>

                    <div>

                      <p className="
                        font-medium
                        text-foreground
                      ">
                        {reclamacao.author?.name ||
                          'Usuário Anônimo'}
                      </p>

                      <p className="
                        text-sm
                        text-muted-foreground
                      ">
                        Criado em{' '}
                        {formatDateTime(
                          reclamacao.createdAt
                        )}
                      </p>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="
                    flex
                    gap-2
                  ">

                    <Badge
                      className={getStatusColor(
                        reclamacao.status
                      )}
                    >
                      {formatarStatus(
                        reclamacao.status
                      )}
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

              </CardContent>

            </Card>

            {/* ==================================
                TÍTULO + DESCRIÇÃO
            ================================== */}

            <div className="space-y-4">

              <h1 className="
                text-3xl
                font-bold
                text-foreground
              ">
                {reclamacao.title}
              </h1>

              <p className="
                text-lg
                text-muted-foreground
                leading-relaxed
                whitespace-pre-line
              ">
                {reclamacao.description ||
                  'Nenhuma descrição informada.'}
              </p>

            </div>

            {/* ==================================
                CATEGORIA
            ================================== */}

            {reclamacao.category && (

              <div className="
                flex
                flex-wrap
                gap-2
              ">

                <Tag
                  className="
                    h-4
                    w-4
                    text-muted-foreground
                  "
                />

                <Badge variant="secondary">

                  {reclamacao.category}

                </Badge>

              </div>

            )}

            {/* ==================================
                AÇÕES
            ================================== */}

            <div className="
              flex
              items-center
              justify-between
              border-t
              border-b
              py-4
            ">

              <div className="
                flex
                items-center
                space-x-6
              ">

                {/* MAPA */}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVerMapa}
                  className="
                    flex
                    items-center
                    space-x-2
                  "
                >

                  <MapPin className="h-4 w-4" />

                  <span>
                    Ver no mapa
                  </span>

                </Button>

                {/* CURTIDAS */}

                <div className="
                  flex
                  items-center
                  space-x-2
                  text-muted-foreground
                ">

                  <Heart
                    className="
                      h-5
                      w-5
                      text-pink-500
                    "
                  />

                  <span>
                    {likesCount} curtidas
                  </span>

                </div>

                {/* COMENTÁRIOS */}

                <div className="
                  flex
                  items-center
                  space-x-2
                  text-muted-foreground
                ">

                  <MessageCircle className="h-5 w-5" />

                  <span>
                    {commentsCount} comentários
                  </span>

                </div>

              </div>

              {/* COMPARTILHAR */}

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="
                  flex
                  items-center
                  space-x-2
                "
              >

                <Share2 className="h-4 w-4" />

                <span>
                  Compartilhar
                </span>

              </Button>

            </div>

            {/* ==================================
                COMENTÁRIOS
            ================================== */}

            <Card>

              <CardHeader>

                <CardTitle className="
                  flex
                  items-center
                  gap-2
                ">

                  <MessageCircle
                    className="h-5 w-5"
                  />

                  Comentários ({commentsCount})

                </CardTitle>

              </CardHeader>

              <CardContent>

                {commentsCount > 0 ? (

                  <div className="
                    text-center
                    py-8
                  ">

                    <MessageCircle
                      className="
                        h-12
                        w-12
                        text-muted-foreground
                        mx-auto
                        mb-4
                      "
                    />

                    <p className="
                      text-muted-foreground
                    ">
                      Esta reclamação possui{' '}
                      {commentsCount}{' '}
                      comentário(s).
                    </p>

                  </div>

                ) : (

                  <div className="
                    text-center
                    py-8
                  ">

                    <MessageCircle
                      className="
                        h-12
                        w-12
                        text-muted-foreground
                        mx-auto
                        mb-4
                      "
                    />

                    <p className="
                      text-muted-foreground
                    ">
                      Nenhum comentário ainda.
                    </p>

                    <p className="
                      text-sm
                      text-muted-foreground
                    ">
                      Seja o primeiro a comentar!
                    </p>

                  </div>

                )}

              </CardContent>

            </Card>

          </div>

          {/* ====================================
              SIDEBAR
          ==================================== */}

          <div className="space-y-6">

            {/* ==================================
                DETALHES
            ================================== */}

            <Card>

              <CardHeader>

                <CardTitle>
                  Detalhes da Reclamação
                </CardTitle>

              </CardHeader>

              <CardContent className="
                space-y-4
              ">

                {/* LOCALIZAÇÃO */}

                {reclamacao.location && (

                  <div className="
                    flex
                    items-start
                    gap-3
                  ">

                    <MapPin
                      className="
                        h-5
                        w-5
                        text-muted-foreground
                        mt-0.5
                      "
                    />

                    <div>

                      <p className="font-medium">
                        Localização
                      </p>

                      <p className="
                        text-sm
                        text-muted-foreground
                      ">
                        {reclamacao.location}
                      </p>

                    </div>

                  </div>

                )}

                {/* DATA */}

                <div className="
                  flex
                  items-start
                  gap-3
                ">

                  <CalendarDays
                    className="
                      h-5
                      w-5
                      text-muted-foreground
                      mt-0.5
                    "
                  />

                  <div>

                    <p className="font-medium">
                      Data
                    </p>

                    <p className="
                      text-sm
                      text-muted-foreground
                    ">
                      {formatDate(
                        reclamacao.createdAt
                      )}
                    </p>

                  </div>

                </div>

                {/* HORÁRIO */}

                <div className="
                  flex
                  items-start
                  gap-3
                ">

                  <Clock
                    className="
                      h-5
                      w-5
                      text-muted-foreground
                      mt-0.5
                    "
                  />

                  <div>

                    <p className="font-medium">
                      Horário
                    </p>

                    <p className="
                      text-sm
                      text-muted-foreground
                    ">
                      {reclamacao.createdAt
                        ? new Date(
                            reclamacao.createdAt
                          ).toLocaleTimeString(
                            'pt-BR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'Não informado'}
                    </p>

                  </div>

                </div>

                {/* STATUS */}

                <div className="
                  flex
                  items-start
                  gap-3
                ">

                  <Clock
                    className="
                      h-5
                      w-5
                      text-muted-foreground
                      mt-0.5
                    "
                  />

                  <div>

                    <p className="font-medium">
                      Status
                    </p>

                    <p className="
                      text-sm
                      text-muted-foreground
                    ">
                      {formatarStatus(
                        reclamacao.status
                      )}
                    </p>

                  </div>

                </div>

                {/* PRIORIDADE */}

                <div className="
                  flex
                  items-start
                  gap-3
                ">

                  <Tag
                    className="
                      h-5
                      w-5
                      text-muted-foreground
                      mt-0.5
                    "
                  />

                  <div>

                    <p className="font-medium">
                      Prioridade
                    </p>

                    <p className="
                      text-sm
                      text-muted-foreground
                    ">
                      {formatarPrioridade(
                        reclamacao.priority
                      )}
                    </p>

                  </div>

                </div>

                {/* AUTOR */}

                <div className="
                  flex
                  items-start
                  gap-3
                ">

                  <User
                    className="
                      h-5
                      w-5
                      text-muted-foreground
                      mt-0.5
                    "
                  />

                  <div>

                    <p className="font-medium">
                      Autor
                    </p>

                    <p className="
                      text-sm
                      text-muted-foreground
                    ">
                      {reclamacao.author?.name ||
                        'Usuário'}
                    </p>

                  </div>

                </div>

              </CardContent>

            </Card>

            {/* ==================================
                ESTATÍSTICAS
            ================================== */}

            <Card>

              <CardHeader>

                <CardTitle>
                  Estatísticas
                </CardTitle>

              </CardHeader>

              <CardContent className="
                space-y-3
              ">

                <div className="
                  flex
                  justify-between
                ">

                  <span className="
                    text-muted-foreground
                  ">
                    Curtidas
                  </span>

                  <span className="font-medium">
                    {likesCount}
                  </span>

                </div>

                <div className="
                  flex
                  justify-between
                ">

                  <span className="
                    text-muted-foreground
                  ">
                    Comentários
                  </span>

                  <span className="font-medium">
                    {commentsCount}
                  </span>

                </div>

                <div className="
                  flex
                  justify-between
                ">

                  <span className="
                    text-muted-foreground
                  ">
                    Status
                  </span>

                  <span className="font-medium">
                    {formatarStatus(
                      reclamacao.status
                    )}
                  </span>

                </div>

              </CardContent>

            </Card>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DetalhesReclamacao;