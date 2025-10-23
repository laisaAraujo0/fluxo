import express from 'express';
import cors from 'cors';
import usuariosRoutes from './routes/usuarios.js';
import eventosRoutes from './routes/eventos.js'; 
import { PrismaClient } from '@prisma/client';
import { loggingMiddleware, logger } from './services/loggingService.js';
import { errorHandler } from './services/errorHandlingService.js';
import { sanitizationMiddleware } from './services/sanitizationService.js';

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient(); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizationMiddleware);
app.use(loggingMiddleware);


app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Mapa da Realidade',
    versao: '2.0.0',
    banco: 'Prisma + PostgreSQL',
    endpoints: {
      usuarios: '/api/usuarios',
      eventos: '/api/eventos',
    },
  });
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/eventos', eventosRoutes); 

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use(errorHandler);


const iniciarServidor = async () => {
  try {
    logger.info('Testando conexão com o banco (Prisma)...');
    await prisma.$connect(); 

    app.listen(PORT, () => {
      logger.info('Servidor iniciado com sucesso', {
        port: PORT,
        url: `http://localhost:${PORT}`,
        apiUrl: `http://localhost:${PORT}/api`,
      });
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor', { error: error.message });
    process.exit(1);
  }
};

iniciarServidor();

export default app;
