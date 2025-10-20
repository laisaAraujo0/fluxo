import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fluxo-secret-key-2024";

// Registrar novo usuário
export const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, username, avatar, bio, cidade, estado, telefone, status } = req.body;

    // Verificar se email ou username já existem
    const usuarioExistente = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: "Email ou username já cadastrados" });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        username,
        avatar,
        bio,
        cidade,
        estado,
        telefone,
        status: status || "ACTIVE",
        senha: senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        cidade: true,
        estado: true,
        telefone: true,
        status: true,
        createdAt: true,
      },
    });

    // Gerar token JWT
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ mensagem: "Usuário registrado com sucesso", usuario, token });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ erro: "Erro ao registrar usuário" });
  }
};

// Login de usuário
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario) return res.status(401).json({ erro: "Email ou senha inválidos" });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ erro: "Email ou senha inválidos" });

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "7d" });

    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({ mensagem: "Login realizado com sucesso", usuario: usuarioSemSenha, token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
};

// Obter perfil do usuário
export const obterPerfil = async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        nome: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        cidade: true,
        estado: true,
        telefone: true,
        perfilPublico: true,
        mostrarEmail: true,
        mostrarCidade: true,
        mostrarTelefone: true,
        notificacaoComentarios: true,
        notificacaoMencoes: true,
        notificacaoSeguidores: true,
        createdAt: true,
      },
    });

    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao obter perfil:", error);
    res.status(500).json({ erro: "Erro ao obter perfil" });
  }
};

// Atualizar perfil do usuário
export const atualizarPerfil = async (req, res) => {
  try {
    const {
      nome,
      telefone,
      cidade,
      estado,
      bio,
      avatar,
      perfilPublico,
      mostrarEmail,
      mostrarCidade,
      mostrarTelefone,
      notificacaoComentarios,
      notificacaoMencoes,
      notificacaoSeguidores,
    } = req.body;

    const usuarioAtualizado = await prisma.user.update({
      where: { id: req.usuario.id },
      data: {
        nome,
        telefone,
        cidade,
        estado,
        bio,
        avatar,
        perfilPublico,
        mostrarEmail,
        mostrarCidade,
        mostrarTelefone,
        notificacaoComentarios,
        notificacaoMencoes,
        notificacaoSeguidores,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        cidade: true,
        estado: true,
        telefone: true,
        perfilPublico: true,
        mostrarEmail: true,
        mostrarCidade: true,
        mostrarTelefone: true,
        notificacaoComentarios: true,
        notificacaoMencoes: true,
        notificacaoSeguidores: true,
        updatedAt: true,
      },
    });

    res.json({ mensagem: "Perfil atualizado com sucesso", usuario: usuarioAtualizado });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ erro: "Erro ao atualizar perfil" });
  }
};

// Listar todos os usuários (admin)
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        username: true,
        telefone: true,
        cidade: true,
        estado: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ erro: "Erro ao listar usuários" });
  }
};

// Deletar usuário (admin)
export const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioDeletado = await prisma.user.delete({
      where: { id },
      select: { id: true },
    });

    res.json({ mensagem: "Usuário deletado com sucesso", usuario: usuarioDeletado });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ erro: "Erro ao deletar usuário" });
  }
};
