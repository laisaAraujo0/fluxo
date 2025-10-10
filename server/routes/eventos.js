import express from 'express';
import {
  criarEvento,
  listarEventos,
  obterEvento,
  atualizarEvento,
  deletarEvento,
  votarEvento,
  adicionarComentario,
  obterEstatisticas,
} from '../controllers/eventosController.js';
import { verificarToken, autenticacaoOpcional } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas (com autenticação opcional)
router.get('/', autenticacaoOpcional, listarEventos);
router.get('/estatisticas', obterEstatisticas);
router.get('/:id', autenticacaoOpcional, obterEvento);

// Rotas protegidas
router.post('/', verificarToken, criarEvento);
router.put('/:id', verificarToken, atualizarEvento);
router.delete('/:id', verificarToken, deletarEvento);
router.post('/:id/votar', verificarToken, votarEvento);
router.post('/:id/comentarios', verificarToken, adicionarComentario);

export default router;

