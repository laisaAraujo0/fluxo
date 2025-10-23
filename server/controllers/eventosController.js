import { PrismaClient } from '@prisma/client';
import { validate, eventCreationSchema } from "../services/validationService.js";
import { invalidateCacheByPrefix } from '../services/cacheService.js';
const prisma = new PrismaClient();

// Criar evento
export const criarEvento = [
  validate(eventCreationSchema),
  async (req, res) => {
    try {
    const { title, description, location, category, imageUrl } = req.body;
    const authorId = req.usuario?.id;

    if (!authorId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const evento = await prisma.event.create({
      data: {
        title,
        description,
        location,
        category,
        imageUrl,
        authorId,
        status: 'PENDING',
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    // Invalida o cache da listagem
    invalidateCacheByPrefix('/api/eventos');

    return res.status(201).json({
      message: 'Evento criado com sucesso',
      evento,
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return res.status(500).json({ error: 'Erro ao criar evento' });
  }
];

// Listar eventos (com filtros e paginação)
export const listarEventos = async (req, res) => {
  try {
    const { category, status, cidade, estado, limite = 20, pagina = 1 } = req.query;

    const take = Math.min(parseInt(limite, 10) || 20, 100);
    const skip = (Math.max(parseInt(pagina, 10), 1) - 1) * take;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [eventos, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true, cidade: true, estado: true } },
          comments: true,
          likes: true,
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.event.count({ where }),
    ]);

    return res.json({
      eventos,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return res.status(500).json({ error: 'Erro ao listar eventos' });
  }
};

// Obter evento por ID (com comentários)
export const obterEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.event.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        likes: true,
      },
    });

    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });

    return res.json(evento);
  } catch (error) {
    console.error('Erro ao obter evento:', error);
    return res.status(500).json({ error: 'Erro ao obter evento' });
  }
};

// Atualizar evento (somente o autor)
export const atualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.usuario?.id;

    const { title, description, location, category, status, imageUrl } = req.body;

    const evento = await prisma.event.findUnique({ where: { id } });

    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
    if (evento.authorId !== authorId)
      return res.status(403).json({ error: 'Sem permissão para editar este evento' });

    const eventoAtualizado = await prisma.event.update({
      where: { id },
      data: { title, description, location, category, status, imageUrl },
    });

    // Invalida o cache da listagem e do evento específico
    invalidateCacheByPrefix('/api/eventos');
    invalidateCacheByPrefix(`/api/eventos/${id}`);

    return res.json({
      message: 'Evento atualizado com sucesso',
      evento: eventoAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
};

// Deletar evento (somente o autor)
export const deletarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.usuario?.id;

    const evento = await prisma.event.findUnique({ where: { id } });
    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
    if (evento.authorId !== authorId)
      return res.status(403).json({ error: 'Sem permissão para deletar este evento' });

    await prisma.event.delete({ where: { id } });

    // Invalida o cache da listagem e do evento específico
    invalidateCacheByPrefix('/api/eventos');
    invalidateCacheByPrefix(`/api/eventos/${id}`);

    return res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    return res.status(500).json({ error: 'Erro ao deletar evento' });
  }
};

// Adicionar comentário
export const adicionarComentario = async (req, res) => {
  try {
    const { id } = req.params; // id do evento
    const { content } = req.body;
    const authorId = req.usuario?.id;

    if (!content) return res.status(400).json({ error: 'Comentário não pode ser vazio' });

    const comentario = await prisma.comment.create({
      data: {
        content,
        eventId: id,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.status(201).json({
      message: 'Comentário adicionado com sucesso',
      comentario,
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
};

// Curtir / Descurtir evento
export const votarEvento = async (req, res) => {
  try {
    const { id } = req.params; // eventId
    const userId = req.usuario?.id;

    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const likeExistente = await prisma.like.findUnique({
      where: {
        userId_eventId: { userId, eventId: id },
      },
    });

    if (likeExistente) {
      await prisma.like.delete({
        where: { userId_eventId: { userId, eventId: id } },
      });
      return res.json({ message: 'Curtida removida com sucesso' });
    }

    await prisma.like.create({
      data: {
        userId,
        eventId: id,
      },
    });

    return res.json({ message: 'Evento curtido com sucesso' });
  } catch (error) {
    console.error('Erro ao curtir evento:', error);
    return res.status(500).json({ error: 'Erro ao curtir evento' });
  }
};

// Estatísticas (admin / gerais)
export const obterEstatisticas = async (req, res) => {
  try {
    const totalEventos = await prisma.event.count();
    const pendentes = await prisma.event.count({ where: { status: 'PENDING' } });
    const resolvidos = await prisma.event.count({ where: { status: 'RESOLVED' } });
    const totalUsuarios = await prisma.user.count();

    const eventosPorCategoria = await prisma.event.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
    });

    const eventosPorStatus = await prisma.event.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return res.json({
      totalEventos,
      pendentes,
      resolvidos,
      totalUsuarios,
      eventosPorCategoria: eventosPorCategoria.map((c) => ({
        categoria: c.category,
        total: c._count.category,
      })),
      eventosPorStatus: eventosPorStatus.map((s) => ({
        status: s.status,
        total: s._count.status,
      })),
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};
