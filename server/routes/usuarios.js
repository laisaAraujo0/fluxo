import express from 'express';
import {
  registrarUsuario,
  loginUsuario,
  obterPerfil,
  atualizarPerfil,
  listarUsuarios,
  deletarUsuario,
} from '../controllers/usuariosController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';
import { loginRateLimitMiddleware } from '../services/rateLimitService.js';

const router = express.Router();

// Rotas públicas
router.post('/registrar', registrarUsuario); // registrarUsuario agora é um array [middleware, controller]
router.post('/login', loginRateLimitMiddleware, loginUsuario);

// Rotas protegidas
router.get('/perfil', verificarToken, obterPerfil);
router.put('/perfil', verificarToken, atualizarPerfil);

// Rotas admin
router.get('/', verificarToken, verificarAdmin, listarUsuarios);
router.delete('/:id', verificarToken, verificarAdmin, deletarUsuario);

export default router;

