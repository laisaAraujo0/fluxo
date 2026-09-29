import express from 'express';
import {
  registrarUsuario, loginUsuario, cadastrarOrgao, obterPerfil,
  atualizarPerfil, listarUsuarios,
} from '../controllers/usuariosController.js';
import { verificarToken, permitirRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/registrar', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/cadastro-orgao', cadastrarOrgao);
router.get('/me', verificarToken, obterPerfil);
router.put('/me', verificarToken, atualizarPerfil);
router.get('/', verificarToken, permitirRoles('AGENCY_MANAGER', 'FLUXO_ADMIN'), listarUsuarios);

export default router;
