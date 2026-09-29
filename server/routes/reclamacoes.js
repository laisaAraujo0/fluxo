import express from 'express';
import {
  criarReclamacao, listarReclamacoes, listarMinhasReclamacoes, obterReclamacao,
  listarAdminReclamacoes, dashboardAdmin, alterarStatus, enviarMensagem,
  atribuirReclamacao, adicionarAnexo, confirmarResolucao, reabrirReclamacao,
  listarOrgaosPublicos, listarDepartamentos,
} from '../controllers/complaintsController.js';
import { verificarToken, permitirRoles, autenticacaoOpcional } from '../middleware/auth.js';

const router = express.Router();

router.get('/orgaos', listarOrgaosPublicos);
router.get('/orgaos/:agencyId/departamentos', listarDepartamentos);
router.get('/', autenticacaoOpcional, listarReclamacoes);
router.post('/', verificarToken, permitirRoles('CITIZEN'), criarReclamacao);
router.get('/my', verificarToken, permitirRoles('CITIZEN'), listarMinhasReclamacoes);
router.get('/admin', verificarToken, permitirRoles('AGENCY_ATTENDANT', 'AGENCY_MANAGER', 'FLUXO_ADMIN'), listarAdminReclamacoes);
router.get('/admin/dashboard', verificarToken, permitirRoles('AGENCY_ATTENDANT', 'AGENCY_MANAGER', 'FLUXO_ADMIN'), dashboardAdmin);
router.get('/:id', verificarToken, obterReclamacao);
router.patch('/:id/status', verificarToken, permitirRoles('AGENCY_ATTENDANT', 'AGENCY_MANAGER', 'FLUXO_ADMIN'), alterarStatus);
router.post('/:id/message', verificarToken, enviarMensagem);
router.post('/:id/assign', verificarToken, permitirRoles('AGENCY_MANAGER', 'FLUXO_ADMIN'), atribuirReclamacao);
router.post('/:id/attachment', verificarToken, adicionarAnexo);
router.post('/:id/confirm', verificarToken, permitirRoles('CITIZEN'), confirmarResolucao);
router.post('/:id/reopen', verificarToken, permitirRoles('CITIZEN'), reabrirReclamacao);

export default router;
