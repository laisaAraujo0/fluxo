import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validate, userRegistrationSchema } from "../services/validationService.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fluxo-secret-key-2024";

// Registrar novo usuário
export const registrarUsuario = [
  validate(userRegistrationSchema),
  async (req, res) => {
    try {
      console.log('📥 Backend: Requisição de registro recebida');
      console.log('📦 Body recebido:', req.body);
      
      const { nome, email, senha, username, avatar, bio, cidade, estado, telefone, status } = req.body;

      if (!senha || senha.length < 8) {
        console.log('❌ Senha muito curta:', senha?.length);
        return res.status(400).json({ erro: "Senha deve ter pelo menos 8 caracteres" });
      }

      // Verificar se email ou username já existem
      console.log('🔍 Verificando se usuário já existe...');
      const usuarioExistente = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (usuarioExistente) {
        console.log('❌ Usuário já existe:', usuarioExistente.email);
        return res.status(400).json({ erro: "Email ou username já cadastrados" });
      }

      // Hash da senha
      console.log('🔐 Criando hash da senha...');
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar usuário
      console.log('💾 Criando usuário no banco de dados...');
      const usuario = await prisma.user.create({
        data: {
          name: nome, // Corrigindo para 'name' conforme schema.prisma
          email,
          username,
          avatar,
          bio,
          cidade,
          estado,
          telefone,
          status: status || "ACTIVE",
          password: senhaHash, // Corrigindo para 'password' conforme schema.prisma
        },
        select: {
          id: true,
          name: true,
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

      console.log('✅ Usuário criado com sucesso:', usuario.id);

      // Gerar token JWT
      console.log('🔑 Gerando token JWT...');
      const token = jwt.sign({ id: usuario.id, email: usuario.email, name: usuario.name }, JWT_SECRET, { expiresIn: "7d" });

    console.log('🎉 Registro completo! Enviando resposta...');
      res.status(201).json({ mensagem: "Usuário registrado com sucesso", usuario, token });
    } catch (error) {
      console.error("❌ Erro ao registrar usuário:", error);
      console.error("📄 Stack trace:", error.stack);
      res.status(500).json({ erro: "Erro ao registrar usuário" });
    }
  }
];

// Login de usuário
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica de login para evitar falhas imediatas
    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    const usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario) return res.status(401).json({ erro: "Email ou senha inválidos" });

    const senhaValida = await bcrypt.compare(senha, usuario.password);
    if (!senhaValida) return res.status(401).json({ erro: "Email ou senha inválidos" });

    const token = jwt.sign({ id: usuario.id, email: usuario.email, name: usuario.name }, JWT_SECRET, { expiresIn: "7d" });

    const { password: _, ...usuarioSemSenha } = usuario;

    res.json({ mensagem: "Login realizado com sucesso", usuario: usuarioSemSenha, token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
};

// Obter perfil do usuário
export const obterPerfil = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        name: true,
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

    res.json({ usuario });
  } catch (error) {
    console.error("Erro ao obter perfil:", error);
    res.status(500).json({ erro: "Erro ao obter perfil", detalhes: error.message });
  }
};

// Obter estatísticas do usuário usando a UDF
export const obterEstatisticas = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const userId = req.usuario.id;
    // Chama a function do banco de dados!
    const relatorio = await prisma.$queryRaw`SELECT * FROM get_user_activity_report(${userId})`;
    
    if (relatorio && relatorio.length > 0) {
      // Como o Prisma $queryRaw retorna objetos em que as propriedades bigint precisam ser convertidas para string/number
      const stats = relatorio[0];
      const serializedStats = {};
      
      for (const key in stats) {
        if (typeof stats[key] === 'bigint') {
          serializedStats[key] = Number(stats[key]);
        } else {
          serializedStats[key] = stats[key];
        }
      }
      
      return res.json(serializedStats);
    }
    return res.json({});
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({ erro: "Erro ao obter estatísticas", detalhes: error.message });
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
        name: nome,
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
        name: true,
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
