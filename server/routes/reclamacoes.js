import express from 'express';

import {
  criarReclamacao,
  listarReclamacoes,
  dashboardReclamacoes,
} from '../controllers/complaintsController.js';

import {
  verificarToken,
  verificarAdmin,
  autenticacaoOpcional
} from '../middleware/auth.js';

import { cacheMiddleware } from '../services/cacheService.js';

const router = express.Router();

router.get(
  '/admin/dashboard',
  verificarToken,
  verificarAdmin,
  dashboardReclamacoes
);

router.get(
  '/',
  autenticacaoOpcional,
  cacheMiddleware(30),
  listarReclamacoes
);

router.post(
  '/',
  verificarToken,
  criarReclamacao
);

export default router;
