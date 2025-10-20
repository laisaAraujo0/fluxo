import express from 'express';
import cors from 'cors';
import usuariosRoutes from './routes/usuarios.js';
import eventosRoutes from './routes/eventos.js'; 
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient(); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


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

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});


const iniciarServidor = async () => {
  try {
    console.log('Testando conexão com o banco (Prisma)...');
    await prisma.$connect(); 

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log(`API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

export default app;
