import express from 'express';
import {
  criarReclamacao,
  listarReclamacoes,
} from '../controllers/complaintsController.js';
import { verificarToken, autenticacaoOpcional } from '../middleware/auth.js';
import { cacheMiddleware } from '../services/cacheService.js';

const router = express.Router();

// Listar reclamações (rota pública)
router.get('/', autenticacaoOpcional, cacheMiddleware(30), listarReclamacoes);

// Criar nova reclamação (rota protegida)
router.post('/', verificarToken, criarReclamacao);

export default router;
