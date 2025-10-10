import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fluxo-secret-key-2024';

// Registrar novo usuário
export const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipo, telefone, cpf, endereco, cidade, estado, cep } = req.body;

    // Verificar se o email já existe
    const usuarioExistente = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const resultado = await query(
      `INSERT INTO usuarios (nome, email, senha, tipo, telefone, cpf, endereco, cidade, estado, cep)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, nome, email, tipo, criado_em`,
      [nome, email, senhaHash, tipo || 'cidadao', telefone, cpf, endereco, cidade, estado, cep]
    );

    const usuario = resultado.rows[0];

    // Gerar token JWT
    const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      mensagem: 'Usuário registrado com sucesso',
      usuario,
      token,
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
};

// Login de usuário
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário
    const resultado = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const usuario = resultado.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Remover senha do objeto de resposta
    delete usuario.senha;

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario,
      token,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
};

// Obter perfil do usuário
export const obterPerfil = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT id, nome, email, tipo, telefone, cpf, endereco, cidade, estado, cep, bio, avatar,
              perfil_publico, mostrar_email, mostrar_cidade, mostrar_telefone,
              notificacao_comentarios, notificacao_mencoes, notificacao_seguidores, criado_em 
       FROM usuarios WHERE id = $1`,
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ erro: 'Erro ao obter perfil' });
  }
};

// Atualizar perfil do usuário
export const atualizarPerfil = async (req, res) => {
  try {
    const { 
      nome, 
      telefone, 
      endereco, 
      cidade, 
      estado, 
      cep, 
      bio,
      avatar,
      perfilPublico,
      mostrarEmail,
      mostrarCidade,
      mostrarTelefone,
      notificacaoComentarios,
      notificacaoMencoes,
      notificacaoSeguidores
    } = req.body;

    const resultado = await query(
      `UPDATE usuarios 
       SET nome = $1, telefone = $2, endereco = $3, cidade = $4, estado = $5, cep = $6, 
           bio = $7, avatar = $8, perfil_publico = $9, mostrar_email = $10, mostrar_cidade = $11,
           mostrar_telefone = $12, notificacao_comentarios = $13, notificacao_mencoes = $14,
           notificacao_seguidores = $15, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $16
       RETURNING id, nome, email, tipo, telefone, endereco, cidade, estado, cep, bio, avatar,
                 perfil_publico, mostrar_email, mostrar_cidade, mostrar_telefone,
                 notificacao_comentarios, notificacao_mencoes, notificacao_seguidores`,
      [nome, telefone, endereco, cidade, estado, cep, bio, avatar, perfilPublico, mostrarEmail, 
       mostrarCidade, mostrarTelefone, notificacaoComentarios, notificacaoMencoes, 
       notificacaoSeguidores, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({
      mensagem: 'Perfil atualizado com sucesso',
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
};

// Listar todos os usuários (admin)
export const listarUsuarios = async (req, res) => {
  try {
    const resultado = await query(
      'SELECT id, nome, email, tipo, telefone, cidade, estado, criado_em FROM usuarios ORDER BY criado_em DESC'
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

// Deletar usuário
export const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
};

