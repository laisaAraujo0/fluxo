import { query } from '../config/database.js';

// Criar novo evento
export const criarEvento = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      categoria,
      prioridade,
      latitude,
      longitude,
      endereco,
      cidade,
      estado,
      cep,
      imagens,
    } = req.body;

    const resultado = await query(
      `INSERT INTO eventos (usuario_id, titulo, descricao, categoria, prioridade, latitude, longitude, endereco, cidade, estado, cep, imagens)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.usuario.id,
        titulo,
        descricao,
        categoria,
        prioridade || 'media',
        latitude,
        longitude,
        endereco,
        cidade,
        estado,
        cep,
        imagens || [],
      ]
    );

    res.status(201).json({
      mensagem: 'Evento criado com sucesso',
      evento: resultado.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ erro: 'Erro ao criar evento' });
  }
};

// Listar todos os eventos
export const listarEventos = async (req, res) => {
  try {
    const { categoria, status, cidade, estado, limite = 50, pagina = 1 } = req.query;

    let queryText = `
      SELECT e.*, u.nome as usuario_nome, u.email as usuario_email
      FROM eventos e
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (categoria) {
      queryText += ` AND e.categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    if (status) {
      queryText += ` AND e.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (cidade) {
      queryText += ` AND e.cidade ILIKE $${paramCount}`;
      params.push(`%${cidade}%`);
      paramCount++;
    }

    if (estado) {
      queryText += ` AND e.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    queryText += ` ORDER BY e.criado_em DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limite));
    params.push((parseInt(pagina) - 1) * parseInt(limite));

    const resultado = await query(queryText, params);

    // Contar total de eventos
    let countQuery = 'SELECT COUNT(*) FROM eventos WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (categoria) {
      countQuery += ` AND categoria = $${countParamCount}`;
      countParams.push(categoria);
      countParamCount++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (cidade) {
      countQuery += ` AND cidade ILIKE $${countParamCount}`;
      countParams.push(`%${cidade}%`);
      countParamCount++;
    }

    if (estado) {
      countQuery += ` AND estado = $${countParamCount}`;
      countParams.push(estado);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      eventos: resultado.rows,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ erro: 'Erro ao listar eventos' });
  }
};

// Obter evento por ID
export const obterEvento = async (req, res) => {
  try {
    const { id } = req.params;

    // Incrementar visualizações
    await query('UPDATE eventos SET visualizacoes = visualizacoes + 1 WHERE id = $1', [id]);

    const resultado = await query(
      `SELECT e.*, u.nome as usuario_nome, u.email as usuario_email
       FROM eventos e
       LEFT JOIN usuarios u ON e.usuario_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Evento não encontrado' });
    }

    // Buscar comentários
    const comentarios = await query(
      `SELECT c.*, u.nome as usuario_nome
       FROM comentarios c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.evento_id = $1
       ORDER BY c.criado_em DESC`,
      [id]
    );

    const evento = resultado.rows[0];
    evento.comentarios = comentarios.rows;

    res.json(evento);
  } catch (error) {
    console.error('Erro ao obter evento:', error);
    res.status(500).json({ erro: 'Erro ao obter evento' });
  }
};

// Atualizar evento
export const atualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, categoria, status, prioridade } = req.body;

    const resultado = await query(
      `UPDATE eventos
       SET titulo = $1, descricao = $2, categoria = $3, status = $4, prioridade = $5, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $6 AND usuario_id = $7
       RETURNING *`,
      [titulo, descricao, categoria, status, prioridade, id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Evento não encontrado ou sem permissão' });
    }

    res.json({
      mensagem: 'Evento atualizado com sucesso',
      evento: resultado.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ erro: 'Erro ao atualizar evento' });
  }
};

// Deletar evento
export const deletarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await query(
      'DELETE FROM eventos WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Evento não encontrado ou sem permissão' });
    }

    res.json({ mensagem: 'Evento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ erro: 'Erro ao deletar evento' });
  }
};

// Votar em evento
export const votarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body; // 'up' ou 'down'

    // Verificar se já votou
    const votoExistente = await query(
      'SELECT * FROM votos WHERE evento_id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );

    if (votoExistente.rows.length > 0) {
      // Atualizar voto
      await query('UPDATE votos SET tipo = $1 WHERE evento_id = $2 AND usuario_id = $3', [
        tipo,
        id,
        req.usuario.id,
      ]);
    } else {
      // Inserir novo voto
      await query('INSERT INTO votos (evento_id, usuario_id, tipo) VALUES ($1, $2, $3)', [
        id,
        req.usuario.id,
        tipo,
      ]);
    }

    // Atualizar contagem de votos
    const votos = await query(
      `SELECT 
        COUNT(CASE WHEN tipo = 'up' THEN 1 END) - COUNT(CASE WHEN tipo = 'down' THEN 1 END) as total
       FROM votos WHERE evento_id = $1`,
      [id]
    );

    await query('UPDATE eventos SET votos = $1 WHERE id = $2', [votos.rows[0].total, id]);

    res.json({
      mensagem: 'Voto registrado com sucesso',
      votos: parseInt(votos.rows[0].total),
    });
  } catch (error) {
    console.error('Erro ao votar:', error);
    res.status(500).json({ erro: 'Erro ao votar' });
  }
};

// Adicionar comentário
export const adicionarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    const resultado = await query(
      `INSERT INTO comentarios (evento_id, usuario_id, texto)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.usuario.id, texto]
    );

    res.status(201).json({
      mensagem: 'Comentário adicionado com sucesso',
      comentario: resultado.rows[0],
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ erro: 'Erro ao adicionar comentário' });
  }
};

// Obter estatísticas
export const obterEstatisticas = async (req, res) => {
  try {
    const totalEventos = await query('SELECT COUNT(*) FROM eventos');
    const eventosPendentes = await query("SELECT COUNT(*) FROM eventos WHERE status = 'pendente'");
    const eventosResolvidos = await query("SELECT COUNT(*) FROM eventos WHERE status = 'resolvido'");
    const totalUsuarios = await query('SELECT COUNT(*) FROM usuarios');

    const eventosPorCategoria = await query(`
      SELECT categoria, COUNT(*) as total
      FROM eventos
      GROUP BY categoria
      ORDER BY total DESC
    `);

    const eventosPorStatus = await query(`
      SELECT status, COUNT(*) as total
      FROM eventos
      GROUP BY status
    `);

    res.json({
      totalEventos: parseInt(totalEventos.rows[0].count),
      eventosPendentes: parseInt(eventosPendentes.rows[0].count),
      eventosResolvidos: parseInt(eventosResolvidos.rows[0].count),
      totalUsuarios: parseInt(totalUsuarios.rows[0].count),
      eventosPorCategoria: eventosPorCategoria.rows,
      eventosPorStatus: eventosPorStatus.rows,
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ erro: 'Erro ao obter estatísticas' });
  }
};

