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

// Listar Reclamações com filtros de localização
export const listarReclamacoes = async (req, res) => {
  const { localidade, uf } = req.query;
  
  const where = {};

  if (localidade && uf) {
    // Assumindo que a localização é armazenada em um campo JSON ou string
    // e que podemos filtrar por cidade e estado.
    // Se a estrutura do banco de dados for diferente, isso precisará ser ajustado.
    // Por enquanto, vamos simular um filtro simples.
    // Se o campo 'location' for um JSON, o filtro seria mais complexo.
    // Vamos assumir que a reclamação tem campos 'cidade' e 'estado' para simplificar.
    // Como não tenho o schema.prisma, vou assumir que o campo 'location' é uma string
    // que contém a cidade e o estado. Isso é um risco, mas é o melhor que posso fazer
    // sem o schema.prisma.
    // Se o campo 'location' for um JSON, o filtro seria:
    // where: {
    //   location: {
    //     path: ['cidade'],
    //     equals: localidade
    //   },
    //   location: {
    //     path: ['uf'],
    //     equals: uf
    //   }
    // }
    // Como não sei a estrutura, vou usar um filtro genérico que precisará ser ajustado
    // se o banco de dados for real.
    // Para o mock, vou ignorar o filtro por enquanto, mas vou deixar a estrutura pronta.
    // No entanto, para atender ao requisito, vou adicionar um filtro que
    // *simula* a busca por localização, assumindo que a localização é armazenada
    // em um campo 'location' que contém a cidade e o estado.
    where.location = {
      contains: `${localidade}, ${uf}`,
      mode: 'insensitive'
    };
  }
  try {
    const reclamacoes = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      take: 50, // Aumentar limite para melhor visualização
    });

    return res.json({ reclamacoes });
  } catch (error) {
    logger.error('Erro ao listar reclamações:', { error: error.message });
    return res.status(500).json({ error: 'Erro ao listar reclamações' });
  }
};

