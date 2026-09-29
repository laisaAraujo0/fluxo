import { api } from './api';

export const listarOrgaos = async () => {
  const { data } = await api.get('/api/reclamacoes/orgaos');
  return data.agencies;
};

export const listarDepartamentos = async (agencyId) => {
  const { data } = await api.get(`/api/reclamacoes/orgaos/${agencyId}/departamentos`);
  return data.departments;
};

export const criarReclamacao = async (payload) => {
  const { data } = await api.post('/api/reclamacoes', payload);
  return data.reclamacao;
};

export const minhasReclamacoes = async () => {
  const { data } = await api.get('/api/reclamacoes/my');
  return data.reclamacoes;
};

export const buscarReclamacao = async (id) => {
  const { data } = await api.get(`/api/reclamacoes/${id}`);
  return data.reclamacao;
};

export const adminDashboard = async () => {
  const { data } = await api.get('/api/reclamacoes/admin/dashboard');
  return data;
};

export const adminReclamacoes = async (params = {}) => {
  const { data } = await api.get('/api/reclamacoes/admin', { params });
  return data.reclamacoes;
};

export const alterarStatus = async (id, payload) => {
  const { data } = await api.patch(`/api/reclamacoes/${id}/status`, payload);
  return data.reclamacao;
};

export const enviarMensagem = async (id, message) => {
  const { data } = await api.post(`/api/reclamacoes/${id}/message`, { message });
  return data.message;
};

export const atribuirReclamacao = async (id, userId) => {
  const { data } = await api.post(`/api/reclamacoes/${id}/assign`, { userId });
  return data;
};

export const adicionarAnexo = async (id, attachment) => {
  const { data } = await api.post(`/api/reclamacoes/${id}/attachment`, attachment);
  return data.attachment;
};

export const confirmarResolucao = async (id) => {
  const { data } = await api.post(`/api/reclamacoes/${id}/confirm`);
  return data.reclamacao;
};

export const reabrirReclamacao = async (id, reason) => {
  const { data } = await api.post(`/api/reclamacoes/${id}/reopen`, { reason });
  return data.reclamacao;
};

export const listarEquipe = async () => {
  const { data } = await api.get('/api/usuarios');
  return data;
};
