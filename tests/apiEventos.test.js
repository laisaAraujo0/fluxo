/**
 * @file apiEventos.test.js
 * Testes de integração para o mock da API de eventos
 */

import { jest } from '@jest/globals';
import {
  buscarEventos,
  buscarEventoPorId,
  buscarEventosPorTermo,
  criarEvento,
  atualizarEvento,
  deletarEvento,
  buscarEventosPorLocalizacao
} from '../src/services/api.js';

jest.setTimeout(10000); // tempo extra devido ao delay simulado

describe('🧪 Testes de Integração - API de Eventos Mockada', () => {
  // ---------- TESTE 1: Buscar todos os eventos ----------
  test('Deve retornar todos os eventos disponíveis', async () => {
    const response = await buscarEventos();
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // ---------- TESTE 2: Filtro por categoria ----------
  test('Deve filtrar eventos pela categoria "infraestrutura"', async () => {
    const response = await buscarEventos({ categoria: 'infraestrutura' });
    expect(response.success).toBe(true);
    expect(response.data.every(e => e.categoria === 'infraestrutura')).toBe(true);
  });

  // ---------- TESTE 3: Busca por termo (GlobalSearch) ----------
  test('Deve buscar eventos contendo o termo "jazz"', async () => {
    const response = await buscarEventosPorTermo('jazz');
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].titulo.toLowerCase()).toContain('jazz');
  });

  // ---------- TESTE 4: Buscar por localização (CEP / Bairro) ----------
  test('Deve buscar eventos pela localização "zona norte"', async () => {
    const response = await buscarEventosPorLocalizacao('zona norte');
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].endereco.toLowerCase()).toContain('zona norte');
  });

  // ---------- TESTE 5: Buscar evento por ID ----------
  test('Deve retornar um evento específico pelo ID', async () => {
    const response = await buscarEventoPorId(1);
    expect(response.success).toBe(true);
    expect(response.data.id).toBe(1);
    expect(response.data.titulo).toContain('Buraco');
  });

  // ---------- TESTE 6: Criar um novo evento ----------
  test('Deve criar um novo evento com sucesso', async () => {
    const novoEvento = {
      titulo: 'Teste de Criação',
      descricao: 'Evento de teste automatizado',
      categoria: 'teste',
      localizacao: 'zona-sul',
      endereco: 'Rua Teste, 999',
      dataInicio: '2024-12-31',
      dataFim: '2024-12-31',
      horario: '10:00 - 11:00',
      preco: 'Gratuito',
      organizador: 'Bot Tester'
    };
    
    const response = await criarEvento(novoEvento);
    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
    expect(response.data.titulo).toBe('Teste de Criação');
  });

  // ---------- TESTE 7: Atualizar um evento existente ----------
  test('Deve atualizar um evento existente', async () => {
    const response = await atualizarEvento(1, { titulo: 'Evento Atualizado' });
    expect(response.success).toBe(true);
    expect(response.data.titulo).toBe('Evento Atualizado');
  });

  // ---------- TESTE 8: Deletar evento ----------
  test('Deve deletar um evento pelo ID', async () => {
    const response = await deletarEvento(2);
    expect(response.success).toBe(true);
  });

  // ---------- TESTE 9: Erro ao buscar evento inexistente ----------
  test('Deve retornar erro ao buscar um ID inexistente', async () => {
    const response = await buscarEventoPorId(999);
    expect(response.success).toBe(false);
    expect(response.error).toBe('Evento não encontrado');
  });
});
