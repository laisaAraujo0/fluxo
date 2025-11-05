import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import usuariosRoutes from './routes/usuarios.js';
import eventosRoutes from './routes/eventos.js';
import reclamacoesRoutes from './routes/reclamacoes.js'; 
import notificationsRoutes from './routes/notifications.js';

import { PrismaClient } from '@prisma/client';
import { loggingMiddleware, logger } from './services/loggingService.js';
import { errorHandler } from './services/errorHandlingService.js';
import { sanitizationMiddleware } from './services/sanitizationService.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permitir todas as origens para desenvolvimento
    methods: ["GET", "POST"]
  }
});

// Middleware para anexar o io ao req (para uso nos controllers/services)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Lógica de Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);



  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

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
app.use('/api/reclamacoes', reclamacoesRoutes); 
app.use('/api/notifications', notificationsRoutes);


app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use(errorHandler);


const iniciarServidor = async () => {
  try {
    logger.info('Testando conexão com o banco (Prisma)...');
    await prisma.$connect(); 

    server.listen(PORT, () => {
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
