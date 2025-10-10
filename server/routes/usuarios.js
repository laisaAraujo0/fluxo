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

const router = express.Router();

// Rotas públicas
router.post('/registrar', registrarUsuario);
router.post('/login', loginUsuario);

// Rotas protegidas
router.get('/perfil', verificarToken, obterPerfil);
router.put('/perfil', verificarToken, atualizarPerfil);

// Rotas admin
router.get('/', verificarToken, verificarAdmin, listarUsuarios);
router.delete('/:id', verificarToken, verificarAdmin, deletarUsuario);

export default router;

