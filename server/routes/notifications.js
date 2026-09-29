import express from 'express';
import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas } from '../controllers/notificationController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();
router.use(verificarToken);
router.get('/', listarNotificacoes);
router.put('/:id/read', marcarComoLida);
router.put('/read-all', marcarTodasComoLidas);

export default router;
