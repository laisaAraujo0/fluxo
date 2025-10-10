import pg from 'pg';
const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mapa_da_realidade',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
  process.exit(-1);
});

// Função para executar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
};

// Função para obter um cliente do pool
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Sobrescrever o método release para adicionar logging
  client.release = () => {
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
};

// Função para inicializar o banco de dados
export const initDatabase = async () => {
  try {
    // Criar tabela de usuários
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) DEFAULT 'cidadao',
        telefone VARCHAR(20),
        cpf VARCHAR(14),
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(9),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de eventos/reclamações
    await query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pendente',
        prioridade VARCHAR(50) DEFAULT 'media',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(9),
        imagens TEXT[],
        votos INTEGER DEFAULT 0,
        visualizacoes INTEGER DEFAULT 0,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de comentários
    await query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        texto TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de votos
    await query(`
      CREATE TABLE IF NOT EXISTS votos (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        tipo VARCHAR(10) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(evento_id, usuario_id)
      )
    `);

    // Criar tabela de notificações
    await query(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        tipo VARCHAR(50) DEFAULT 'info',
        lida BOOLEAN DEFAULT FALSE,
        link TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar índices para melhor performance
    await query(`CREATE INDEX IF NOT EXISTS idx_eventos_usuario ON eventos(usuario_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_comentarios_evento ON comentarios(evento_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votos_evento ON votos(evento_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id)`);

    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

export default pool;

