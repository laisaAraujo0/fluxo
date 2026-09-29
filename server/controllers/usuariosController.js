import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { criarToken } from '../middleware/auth.js';

const prisma = new PrismaClient();

const publicUser = (u) => ({
  id: u.id,
  nome: u.name,
  name: u.name,
  email: u.email,
  username: u.username,
  avatar: u.avatar,
  bio: u.bio,
  cidade: u.cidade,
  estado: u.estado,
  telefone: u.telefone,
  role: u.role,
  tipo: u.role === 'CITIZEN' ? 'usuario' : 'administrador',
  agencyId: u.agencyId,
  departmentId: u.departmentId,
  agency: u.agency,
  department: u.department,
  status: u.status,
});

const usernameFromEmail = (email) =>
  `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-6)}`;

export const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, username, cidade, estado, telefone, avatar, bio } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    if (senha.length < 8) return res.status(400).json({ erro: 'Senha deve ter pelo menos 8 caracteres' });

    const existente = await prisma.user.findUnique({ where: { email } });
    if (existente) return res.status(409).json({ erro: 'Este email já está cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.user.create({
      data: {
        name: nome,
        email,
        username: username || usernameFromEmail(email),
        password: senhaHash,
        cidade, estado, telefone, avatar, bio,
        role: 'CITIZEN',
      },
    });

    res.status(201).json({
      mensagem: 'Usuário registrado com sucesso',
      usuario: publicUser(usuario),
      token: criarToken(usuario),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

    const usuario = await prisma.user.findUnique({
      where: { email },
      include: { agency: true, department: true },
    });
    if (!usuario || !(await bcrypt.compare(senha, usuario.password))) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
    if (usuario.status !== 'ACTIVE') return res.status(403).json({ erro: 'Usuário bloqueado ou suspenso' });

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: publicUser(usuario),
      token: criarToken(usuario),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
};

export const cadastrarOrgao = async (req, res) => {
  try {
    const {
      nome, cnpj, email, telefone, endereco, cidade, estado,
      responsavelNome, responsavelEmail, responsavelCargo, senha, departamento,
    } = req.body;

    if (!nome || !email || !cidade || !estado || !responsavelNome || !senha) {
      return res.status(400).json({ erro: 'Preencha os campos obrigatórios' });
    }

    const existente = await prisma.user.findUnique({ where: { email: responsavelEmail || email } });
    if (existente) return res.status(409).json({ erro: 'Email do responsável já cadastrado' });

    const agencyExists = await prisma.agency.findFirst({
      where: { OR: [{ email }, ...(cnpj ? [{ cnpj }] : [])] },
    });
    if (agencyExists) return res.status(409).json({ erro: 'Órgão já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: { name: nome, email, cnpj: cnpj || null, telefone, endereco, cidade, estado, status: 'ACTIVE' },
      });
      const department = await tx.department.create({
        data: { name: departamento || 'Atendimento Geral', agencyId: agency.id },
      });
      const user = await tx.user.create({
        data: {
          name: responsavelNome,
          email: responsavelEmail || email,
          username: usernameFromEmail(responsavelEmail || email),
          password: senhaHash,
          role: 'AGENCY_MANAGER',
          agencyId: agency.id,
          departmentId: department.id,
        },
        include: { agency: true, department: true },
      });
      return { agency, department, user };
    });

    res.status(201).json({
      mensagem: 'Órgão cadastrado com sucesso',
      usuario: publicUser(result.user),
      token: criarToken(result.user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao cadastrar órgão' });
  }
};

export const obterPerfil = async (req, res) => {
  const usuario = await prisma.user.findUnique({
    where: { id: req.usuario.id },
    include: { agency: true, department: true },
  });
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(publicUser(usuario));
};

export const atualizarPerfil = async (req, res) => {
  try {
    const data = {};
    const allowed = ['name', 'telefone', 'cidade', 'estado', 'bio', 'avatar', 'perfilPublico', 'mostrarEmail', 'mostrarCidade', 'mostrarTelefone', 'notificacaoComentarios', 'notificacaoMencoes', 'notificacaoSeguidores'];
    for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key];
    const usuario = await prisma.user.update({
      where: { id: req.usuario.id },
      data,
      include: { agency: true, department: true },
    });
    res.json({ mensagem: 'Perfil atualizado com sucesso', usuario: publicUser(usuario) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
};

export const listarUsuarios = async (req, res) => {
  const where = req.usuario.role === 'FLUXO_ADMIN' ? {} : { agencyId: req.usuario.agencyId };
  const usuarios = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, username: true, role: true, status: true, cidade: true, estado: true, agencyId: true, departmentId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(usuarios);
};
