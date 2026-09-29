import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fluxo-secret-key-2024';

export const criarToken = (usuario) =>
  jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
      agencyId: usuario.agencyId || null,
      departmentId: usuario.departmentId || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, email: true, name: true, role: true, status: true,
        agencyId: true, departmentId: true,
      },
    });

    if (!usuario || usuario.status !== 'ACTIVE') {
      return res.status(401).json({ erro: 'Usuário inválido ou bloqueado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

export const permitirRoles = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.role)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
};

export const verificarAdmin = permitirRoles(
  'AGENCY_ATTENDANT',
  'AGENCY_MANAGER',
  'FLUXO_ADMIN'
);

export const verificarGestorOuAdmin = permitirRoles(
  'AGENCY_MANAGER',
  'FLUXO_ADMIN'
);

export const autenticacaoOpcional = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, status: true, agencyId: true, departmentId: true },
    });
  } catch {
    req.usuario = null;
  }
  next();
};
