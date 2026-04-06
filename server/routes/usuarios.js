import express from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obterPerfil,
  obterEstatisticas,
  atualizarPerfil,
  listarUsuarios,
  deletarUsuario,
} from '../controllers/usuariosController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/registrar', registrarUsuario); // registrarUsuario agora é um array [middleware, controller]
router.post('/login', loginUsuario); // REMOVIDO: loginRateLimitMiddleware para evitar bloqueios no desenvolvimento

// Rotas protegidas
router.get('/perfil', verificarToken, obterPerfil);
router.get('/estatisticas', verificarToken, obterEstatisticas);
router.put('/perfil', verificarToken, atualizarPerfil);

// Rotas admin
router.get('/', verificarToken, verificarAdmin, listarUsuarios);
router.delete('/:id', verificarToken, verificarAdmin, deletarUsuario);

export default router;

