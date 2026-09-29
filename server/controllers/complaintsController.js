import { PrismaClient } from '@prisma/client';
import { createNotification } from '../services/notificationService.js';

const prisma = new PrismaClient();

const STATUS_LABEL = {
  RECEIVED: 'Recebida',
  FORWARDED: 'Encaminhada',
  IN_ANALYSIS: 'Em análise',
  WAITING_INFORMATION: 'Aguardando informação',
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'Em execução',
  RESOLVED: 'Resolvida',
  REOPENED: 'Reaberta',
};

const agencyScope = (user) =>
  user.role === 'FLUXO_ADMIN' ? {} : { agencyId: user.agencyId };

const canManageComplaint = (user, complaint) => {
  if (user.role === 'FLUXO_ADMIN') return true;
  if (!user.agencyId || complaint.agencyId !== user.agencyId) return false;
  if (user.role === 'AGENCY_MANAGER') return true;
  return complaint.assignedUserId === user.id || !complaint.assignedUserId;
};

const generateProtocol = async (tx) => {
  const year = new Date().getFullYear();
  const rows = await tx.$queryRaw`
    INSERT INTO "protocol_sequences" ("year", "next", "createdAt", "updatedAt")
    VALUES (${year}, 2, NOW(), NOW())
    ON CONFLICT ("year")
    DO UPDATE SET "next" = "protocol_sequences"."next" + 1, "updatedAt" = NOW()
    RETURNING "next"
  `;
  const number = Number(rows[0].next) - 1;
  return `FLX-${year}-${String(number).padStart(6, '0')}`;
};

const includeComplaint = {
  author: { select: { id: true, name: true, email: true } },
  agency: { select: { id: true, name: true, cidade: true, estado: true } },
  department: { select: { id: true, name: true } },
  assignedUser: { select: { id: true, name: true, email: true } },
  updates: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, name: true, role: true } } } },
  messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } },
  attachments: { orderBy: { createdAt: 'asc' }, select: { id: true, name: true, mimeType: true, data: true, createdAt: true } },
};

export const listarOrgaosPublicos = async (req, res) => {
  const agencies = await prisma.agency.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    include: { departments: { where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } } },
  });
  res.json({ agencies });
};

export const criarReclamacao = async (req, res) => {
  try {
    const { title, description, category, location, latitude, longitude, neighborhood, priority, agencyId, departmentId } = req.body;
    if (!title || !location || !agencyId) return res.status(400).json({ error: 'Título, localização e órgão são obrigatórios' });

    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency || agency.status !== 'ACTIVE') return res.status(400).json({ error: 'Órgão inválido' });

    if (departmentId) {
      const department = await prisma.department.findFirst({ where: { id: departmentId, agencyId, status: 'ACTIVE' } });
      if (!department) return res.status(400).json({ error: 'Setor inválido para este órgão' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const protocol = await generateProtocol(tx);
      const complaint = await tx.complaint.create({
        data: {
          protocol, title, description, category, location,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          neighborhood, priority: priority || 'LOW',
          status: 'RECEIVED',
          authorId: req.usuario.id,
          agencyId, departmentId: departmentId || null,
        },
      });
      await tx.complaintUpdate.create({
        data: {
          complaintId: complaint.id,
          userId: req.usuario.id,
          newStatus: 'RECEIVED',
          message: 'Sua solicitação foi recebida pelo FLUXO.',
        },
      });
      return complaint;
    });

    const complaint = await prisma.complaint.findUnique({ where: { id: result.id }, include: includeComplaint });
    if (req.io) req.io.to(`agency:${agencyId}`).emit('complaint:new', complaint);

    res.status(201).json({ mensagem: 'Reclamação criada com sucesso', reclamacao: complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reclamação' });
  }
};

export const listarMinhasReclamacoes = async (req, res) => {
  const complaints = await prisma.complaint.findMany({
    where: { authorId: req.usuario.id },
    include: {
      agency: { select: { name: true } },
      department: { select: { name: true } },
      updates: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ reclamacoes: complaints });
};

export const listarReclamacoes = async (req, res) => {
  const { localidade, uf } = req.query;
  const where = {};
  if (localidade) where.agency = { cidade: { contains: localidade, mode: 'insensitive' } };
  if (uf) where.agency = { ...(where.agency || {}), estado: uf };
  const complaints = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { author: { select: { id: true, name: true } }, agency: { select: { id: true, name: true } }, department: { select: { name: true } } },
  });
  res.json({ reclamacoes: complaints });
};

export const obterReclamacao = async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id }, include: includeComplaint });
  if (!complaint) return res.status(404).json({ error: 'Reclamação não encontrada' });

  const isCitizenOwner = req.usuario.role === 'CITIZEN' && complaint.authorId === req.usuario.id;
  const isAgencyUser = req.usuario.role !== 'CITIZEN' && canManageComplaint(req.usuario, complaint);
  if (!isCitizenOwner && !isAgencyUser && req.usuario.role !== 'FLUXO_ADMIN') return res.status(403).json({ error: 'Acesso negado' });

  res.json({ reclamacao: complaint });
};

export const listarAdminReclamacoes = async (req, res) => {
  const { status, priority, category, departmentId, search } = req.query;
  const where = { ...agencyScope(req.usuario) };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = category;
  if (departmentId) where.departmentId = departmentId;
  if (search) {
    where.OR = [
      { protocol: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { author: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const complaints = await prisma.complaint.findMany({
    where,
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { id: true, name: true, email: true } },
      agency: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true } },
    },
  });
  res.json({ reclamacoes: complaints });
};

export const dashboardAdmin = async (req, res) => {
  const where = agencyScope(req.usuario);
  const grouped = await prisma.complaint.groupBy({ by: ['status'], where, _count: { _all: true } });
  const urgent = await prisma.complaint.count({ where: { ...where, priority: 'URGENT', status: { not: 'RESOLVED' } } });
  const total = await prisma.complaint.count({ where });
  const stats = Object.fromEntries(Object.keys(STATUS_LABEL).map(s => [s, 0]));
  grouped.forEach(item => { stats[item.status] = item._count._all; });
  res.json({ total, urgent, stats, labels: STATUS_LABEL });
};

export const alterarStatus = async (req, res) => {
  try {
    const { status, message, estimatedResolutionAt, resolutionDescription, attachment } = req.body;
    const validStatuses = Object.keys(STATUS_LABEL);
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Status inválido' });

    const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!complaint) return res.status(404).json({ error: 'Reclamação não encontrada' });
    if (!canManageComplaint(req.usuario, complaint)) return res.status(403).json({ error: 'Você não pode alterar esta reclamação' });
    if (status === 'RESOLVED' && !resolutionDescription?.trim()) return res.status(400).json({ error: 'A descrição da solução é obrigatória' });

    const updated = await prisma.$transaction(async (tx) => {
      const data = {
        status,
        estimatedResolutionAt: estimatedResolutionAt ? new Date(estimatedResolutionAt) : undefined,
        resolutionDescription: status === 'RESOLVED' ? resolutionDescription : undefined,
        resolutionConfirmed: status === 'RESOLVED' ? false : undefined,
        resolutionConfirmedAt: status === 'RESOLVED' ? null : undefined,
        reopenReason: status === 'REOPENED' ? message : undefined,
      };
      const result = await tx.complaint.update({ where: { id: complaint.id }, data });
      await tx.complaintUpdate.create({
        data: { complaintId: complaint.id, userId: req.usuario.id, oldStatus: complaint.status, newStatus: status, message: message || null },
      });
      if (attachment?.data) {
        await tx.attachment.create({
          data: {
            complaintId: complaint.id,
            uploadedBy: req.usuario.id,
            name: attachment.name || 'evidencia',
            mimeType: attachment.mimeType || 'application/octet-stream',
            data: attachment.data,
          },
        });
      }
      return result;
    });

    await createNotification(
      complaint.authorId,
      'UPDATE',
      `O órgão atualizou a solicitação ${complaint.protocol} para "${STATUS_LABEL[status]}".`
    );
    if (req.io) {
      req.io.to(`user:${complaint.authorId}`).emit('complaint:updated', { complaintId: complaint.id, status });
      req.io.to(`agency:${complaint.agencyId}`).emit('complaint:updated', { complaintId: complaint.id, status });
    }

    const full = await prisma.complaint.findUnique({ where: { id: updated.id }, include: includeComplaint });
    res.json({ mensagem: 'Status atualizado', reclamacao: full });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao alterar status' });
  }
};

export const enviarMensagem = async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: 'Reclamação não encontrada' });

  const allowed = (req.usuario.role === 'CITIZEN' && complaint.authorId === req.usuario.id) ||
    (req.usuario.role !== 'CITIZEN' && canManageComplaint(req.usuario, complaint));
  if (!allowed) return res.status(403).json({ error: 'Acesso negado' });
  if (!req.body.message?.trim()) return res.status(400).json({ error: 'Mensagem obrigatória' });

  const message = await prisma.complaintMessage.create({
    data: { complaintId: complaint.id, senderId: req.usuario.id, message: req.body.message.trim() },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  const recipientId = req.usuario.role === 'CITIZEN' ? complaint.assignedUserId : complaint.authorId;
  if (recipientId) {
    await createNotification(recipientId, 'UPDATE', `Nova mensagem na solicitação ${complaint.protocol}.`);
    if (req.io) req.io.to(`user:${recipientId}`).emit('complaint:message', { complaintId: complaint.id, message });
  }
  res.status(201).json({ message });
};

export const atribuirReclamacao = async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: 'Reclamação não encontrada' });
  if (!canManageComplaint(req.usuario, complaint) || !['AGENCY_MANAGER', 'FLUXO_ADMIN'].includes(req.usuario.role)) {
    return res.status(403).json({ error: 'Apenas gestores podem atribuir solicitações' });
  }

  const target = await prisma.user.findFirst({
    where: {
      id: req.body.userId,
      role: { in: ['AGENCY_ATTENDANT', 'AGENCY_MANAGER'] },
      ...(req.usuario.role === 'FLUXO_ADMIN' ? {} : { agencyId: req.usuario.agencyId }),
    },
  });
  if (!target) return res.status(400).json({ error: 'Atendente inválido' });

  await prisma.$transaction([
    prisma.complaint.update({ where: { id: complaint.id }, data: { assignedUserId: target.id } }),
    prisma.complaintAssignment.create({ data: { complaintId: complaint.id, userId: target.id, assignedBy: req.usuario.id } }),
  ]);

  await createNotification(target.id, 'UPDATE', `A solicitação ${complaint.protocol} foi atribuída a você.`);
  res.json({ mensagem: 'Solicitação atribuída com sucesso' });
};

export const adicionarAnexo = async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ error: 'Reclamação não encontrada' });
  const allowed = req.usuario.role === 'CITIZEN'
    ? complaint.authorId === req.usuario.id
    : canManageComplaint(req.usuario, complaint);
  if (!allowed) return res.status(403).json({ error: 'Acesso negado' });
  const { name, mimeType, data } = req.body;
  if (!data) return res.status(400).json({ error: 'Arquivo não enviado' });
  const attachment = await prisma.attachment.create({ data: { complaintId: complaint.id, uploadedBy: req.usuario.id, name: name || 'arquivo', mimeType: mimeType || 'application/octet-stream', data } });
  res.status(201).json({ attachment });
};

export const confirmarResolucao = async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint || complaint.authorId !== req.usuario.id) return res.status(404).json({ error: 'Reclamação não encontrada' });
  if (complaint.status !== 'RESOLVED') return res.status(400).json({ error: 'A reclamação ainda não está marcada como resolvida' });

  const updated = await prisma.complaint.update({
    where: { id: complaint.id },
    data: { resolutionConfirmed: true, resolutionConfirmedAt: new Date() },
  });
  const manager = await prisma.user.findFirst({
    where: { agencyId: complaint.agencyId, role: 'AGENCY_MANAGER', status: 'ACTIVE' },
    select: { id: true },
  });
  if (manager) {
    await createNotification(manager.id, 'UPDATE', `O cidadão confirmou a resolução da solicitação ${complaint.protocol}.`);
  }
  if (req.io) req.io.to(`agency:${complaint.agencyId}`).emit('complaint:confirmed', { complaintId: complaint.id });
  res.json({ reclamacao: updated });
};

export const reabrirReclamacao = async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint || complaint.authorId !== req.usuario.id) return res.status(404).json({ error: 'Reclamação não encontrada' });
  if (!['RESOLVED', 'REOPENED'].includes(complaint.status)) return res.status(400).json({ error: 'A reclamação não pode ser reaberta neste momento' });
  if (!req.body.reason?.trim()) return res.status(400).json({ error: 'Explique por que o problema continua' });

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.complaint.update({
      where: { id: complaint.id },
      data: { status: 'REOPENED', reopenReason: req.body.reason.trim(), resolutionConfirmed: false, resolutionConfirmedAt: null },
    });
    await tx.complaintUpdate.create({
      data: { complaintId: complaint.id, userId: req.usuario.id, oldStatus: complaint.status, newStatus: 'REOPENED', message: req.body.reason.trim() },
    });
    return result;
  });

  const managers = await prisma.user.findMany({ where: { agencyId: complaint.agencyId, role: { in: ['AGENCY_MANAGER', 'AGENCY_ATTENDANT'] }, status: 'ACTIVE' }, select: { id: true } });
  await Promise.all(managers.map(u => createNotification(u.id, 'UPDATE', `A solicitação ${complaint.protocol} foi reaberta pelo cidadão.`)));
  if (req.io) req.io.to(`agency:${complaint.agencyId}`).emit('complaint:reopened', { complaintId: complaint.id });
  res.json({ reclamacao: updated });
};

export const listarDepartamentos = async (req, res) => {
  const departments = await prisma.department.findMany({ where: { agencyId: req.params.agencyId, status: 'ACTIVE' }, orderBy: { name: 'asc' } });
  res.json({ departments });
};
