import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/database.js';
import usuariosRoutes from './routes/usuarios.js';
import eventosRoutes from './routes/eventos.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Mapa da Realidade',
    versao: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      eventos: '/api/eventos',
    },
  });
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/eventos', eventosRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Inicializar banco de dados e servidor
const iniciarServidor = async () => {
  try {
    console.log('🔄 Inicializando banco de dados...');
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📚 API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

export default app;

