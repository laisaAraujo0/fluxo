/**
 * @file Testes de integração para o mock da API de eventos
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

jest.setTimeout(10000); 

describe('Testes de Integração - API de Eventos Mockada', () => {
  test('Deve retornar todos os eventos disponíveis', async () => {
    const response = await buscarEventos();
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Deve filtrar eventos pela categoria "infraestrutura"', async () => {
    const response = await buscarEventos({ categoria: 'infraestrutura' });
    expect(response.success).toBe(true);
    expect(response.data.every(e => e.categoria === 'infraestrutura')).toBe(true);
  });

  test('Deve buscar eventos contendo o termo "jazz"', async () => {
    const response = await buscarEventosPorTermo('jazz');
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].titulo.toLowerCase()).toContain('jazz');
  });

  test('Deve buscar eventos pela localização "zona norte"', async () => {
    const response = await buscarEventosPorLocalizacao('zona norte');
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].endereco.toLowerCase()).toContain('zona norte');
  });

  test('Deve retornar um evento específico pelo ID', async () => {
    const response = await buscarEventoPorId(1);
    expect(response.success).toBe(true);
    expect(response.data.id).toBe(1);
    expect(response.data.titulo).toContain('Buraco');
  });

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

  test('Deve atualizar um evento existente', async () => {
    const response = await atualizarEvento(1, { titulo: 'Evento Atualizado' });
    expect(response.success).toBe(true);
    expect(response.data.titulo).toBe('Evento Atualizado');
  });

  test('Deve deletar um evento pelo ID', async () => {
    const response = await deletarEvento(2);
    expect(response.success).toBe(true);
  });

  test('Deve retornar erro ao buscar um ID inexistente', async () => {
    const response = await buscarEventoPorId(999);
    expect(response.success).toBe(false);
    expect(response.error).toBe('Evento não encontrado');
  });
});
