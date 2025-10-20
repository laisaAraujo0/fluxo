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

// Estatísticas gerais (rota pública)
router.get('/estatisticas', obterEstatisticas);

// Listar eventos (autenticação opcional — se o usuário estiver logado, pode personalizar resposta)
router.get('/', autenticacaoOpcional, listarEventos);

// Obter um evento específico (público)
router.get('/:id', autenticacaoOpcional, obterEvento);

// Criar novo evento (rota protegida)
router.post('/', verificarToken, criarEvento);

// Atualizar um evento existente (rota protegida)
router.put('/:id', verificarToken, atualizarEvento);

// Deletar evento (rota protegida)
router.delete('/:id', verificarToken, deletarEvento);

// Curtir / votar em um evento (rota protegida)
router.post('/:id/votar', verificarToken, votarEvento);

// Adicionar comentário a um evento (rota protegida)
router.post('/:id/comentarios', verificarToken, adicionarComentario);

export default router;


