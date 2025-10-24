import { PrismaClient } from '@prisma/client';
import { validate, complaintCreationSchema } from "../services/validationService.js";
import { invalidateCacheByPrefix } from '../services/cacheService.js';
import { logger } from '../services/loggingService.js';

const prisma = new PrismaClient();

// Criar Reclamação
// Assumindo que você tem um schema de validação para reclamações
export const criarReclamacao = [
  // validate(complaintCreationSchema), // Descomente se tiver o schema
  async (req, res) => {
    try {
      const { title, description, location, priority } = req.body;
      const authorId = req.usuario?.id;

      if (!authorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const reclamacao = await prisma.complaint.create({
        data: {
          title,
          description,
          location,
          priority: priority || 'LOW',
          authorId,
          status: 'PENDING',
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });

      // Invalida o cache da listagem (se houver)
      invalidateCacheByPrefix('/api/reclamacoes');

      // ** BROADCAST: Notificar todos os clientes sobre a nova reclamação **
      // req.io é injetado pelo middleware no server.js
      if (req.io) {
        req.io.emit('complaint:new', reclamacao);
        logger.info('Broadcast de nova reclamação', { complaintId: reclamacao.id });
      }

      return res.status(201).json({
        message: 'Reclamação criada com sucesso',
        reclamacao,
      });
    } catch (error) {
      logger.error('Erro ao criar reclamação:', { error: error.message });
      return res.status(500).json({ error: 'Erro ao criar reclamação' });
    }
  }
];

// Listar Reclamações (Mock para simplificar, mas necessário para o broadcast)
export const listarReclamacoes = async (req, res) => {
  try {
    const reclamacoes = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      take: 20, // Limite para evitar sobrecarga
    });

    return res.json({ reclamacoes });
  } catch (error) {
    logger.error('Erro ao listar reclamações:', { error: error.message });
    return res.status(500).json({ error: 'Erro ao listar reclamações' });
  }
};

