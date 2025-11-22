import express from 'express';
import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas } from '../controllers/notificationController.js';
import { verificarToken } from '../middleware/auth.js'; 

const router = express.Router();

// Todas as rotas abaixo requerem autenticação
router.use(verificarToken);


// GET /api/notifications - Lista notificações não lidas
router.get('/', listarNotificacoes);

// PUT /api/notifications/:id/read - Marca uma notificação como lida
router.put('/:id/read', marcarComoLida);

// PUT /api/notifications/read-all - Marca todas as notificações como lidas
router.put('/read-all', marcarTodasComoLidas);

export default router;
