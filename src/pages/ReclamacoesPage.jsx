import { useState, useEffect, useMemo } from 'react';

import {
  Plus,
  Clock,
  CheckCircle,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import RegistroReclamacao from '@/components/RegistroReclamacao';
import DetalhesReclamacao from '@/components/DetalhesReclamacao';
import ReclamacaoCard from '@/components/ReclamacaoCard';

import { toast } from 'sonner';
import { api } from '@/services/api';

import {
  subscribeToBroadcast,
  unsubscribeFromBroadcast
} from '@/services/socketService';

const ReclamacoesPage = () => {

  const [currentView, setCurrentView] = useState('lista');

  const [reclamacaoSelecionada, setReclamacaoSelecionada] = useState(null);

  const [reclamacoes, setReclamacoes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  // ==========================================
  // CARREGAR RECLAMAÇÕES DO BANCO
  // ==========================================

  const carregarReclamacoes = async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/api/reclamacoes');

      const lista = response.data.reclamacoes || [];

      setReclamacoes(lista);

    } catch (error) {
      console.error('Erro ao carregar reclamações:', error);

      toast.error(
        'Não foi possível carregar as reclamações.'
      );

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarReclamacoes();

    subscribeToBroadcast(
      'complaint:new',
      handleNewComplaintBroadcast
    );

    return () => {
      unsubscribeFromBroadcast(
        'complaint:new',
        handleNewComplaintBroadcast
      );
    };
  }, []);

  const handleNewComplaintBroadcast = (novaReclamacao) => {

    setReclamacoes(prev => {

      // Evita duplicar uma reclamação
      // caso ela já tenha sido adicionada pelo formulário.
      const jaExiste = prev.some(
        reclamacao => reclamacao.id === novaReclamacao.id
      );

      if (jaExiste) {
        return prev;
      }

      return [
        novaReclamacao,
        ...prev
      ];
    });

    toast.info(
      `Nova reclamação registrada: ${novaReclamacao.title}`
    );
  };

  const handleReclamacaoAdicionada = (novaReclamacao) => {

    setReclamacoes(prev => {

      const jaExiste = prev.some(
        reclamacao => reclamacao.id === novaReclamacao.id
      );

      if (jaExiste) {
        return prev;
      }

      return [
        novaReclamacao,
        ...prev
      ];
    });

    toast.success(
      'Reclamação adicionada à lista!'
    );
  };

  const reclamacoesFiltradas = useMemo(() => {

    const termo = searchTerm.toLowerCase();

    return reclamacoes.filter(reclamacao => {

      const titulo =
        reclamacao.title?.toLowerCase() || '';

      const descricao =
        reclamacao.description?.toLowerCase() || '';

      const localizacao =
        reclamacao.location?.toLowerCase() || '';

      return (
        titulo.includes(termo) ||
        descricao.includes(termo) ||
        localizacao.includes(termo)
      );
    });

  }, [reclamacoes, searchTerm]);

  const problemasResolvidos =
    reclamacoes.filter(
      r => r.status === 'RESOLVED'
    ).length;

  const problemasPendentes =
    reclamacoes.filter(
      r => r.status !== 'RESOLVED'
    ).length;

  const handleNovaReclamacao = () => {
    setCurrentView('registro');
  };

  const handleVoltarLista = () => {
    setCurrentView('lista');
  };

  const handleVerDetalhes = (reclamacao) => {
    setReclamacaoSelecionada(reclamacao);
    setCurrentView('detalhes');
  };

  if (currentView === 'registro') {

  return (
    <RegistroReclamacao 
      onVoltar={handleVoltarLista}
      onReclamacaoAdicionada={
        handleReclamacaoAdicionada
      }
    />
  );
}

if (currentView === 'detalhes') {

  return (
    <DetalhesReclamacao
      reclamacao={reclamacaoSelecionada}
      onVoltar={handleVoltarLista}
    />
  );
}

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <div className="max-w-5xl mx-auto">

        <header className="mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h2 className="text-3xl font-bold text-foreground">
                Reclamações do Município
              </h2>

              <p className="mt-2 text-muted-foreground">
                Acompanhe os problemas reportados na sua
                comunidade e veja o progresso.
              </p>

            </div>

            <Button
              onClick={handleNovaReclamacao}
              className="flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Nova Reclamação
            </Button>

          </div>

        </header>

        <div className="mb-6 relative">

          <Search
            className="absolute left-3 top-1/2
            -translate-y-1/2 h-4 w-4
            text-muted-foreground"
          />

          <input
            type="text"
            placeholder="Pesquisar reclamações..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full rounded-lg border
            bg-background px-10 py-3
            outline-none focus:ring-2
            focus:ring-primary"
          />

        </div>

        <section className="mb-8">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-2">

              <div className="flex items-center gap-3">

                <Clock className="text-orange-500 h-6 w-6" />

                <p className="font-medium text-card-foreground">
                  Problemas Pendentes
                </p>

              </div>

              <p className="text-4xl font-bold text-card-foreground">
                {problemasPendentes}
              </p>

            </div>

            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-2">

              <div className="flex items-center gap-3">

                <CheckCircle className="text-green-500 h-6 w-6" />

                <p className="font-medium text-card-foreground">
                  Problemas Resolvidos
                </p>

              </div>

              <p className="text-4xl font-bold text-card-foreground">
                {problemasResolvidos}
              </p>

            </div>

          </div>

        </section>

        <section>

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-lg font-bold text-foreground">
              Lista de Reclamações
            </h3>

          </div>

          {isLoading ? (

            <div className="text-center py-12">

              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />

              <p className="mt-4 text-muted-foreground">
                Carregando reclamações...
              </p>

            </div>

          ) : reclamacoesFiltradas.length === 0 ? (

            <div className="text-center py-12 border rounded-xl">

              <Search className="h-12 w-12 mx-auto text-muted-foreground" />

              <h3 className="mt-4 text-lg font-medium">
                Nenhuma reclamação encontrada
              </h3>

              <p className="mt-2 text-muted-foreground">
                Seja o primeiro a registrar um problema
                em sua comunidade.
              </p>

              <Button
                onClick={handleNovaReclamacao}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Reclamação
              </Button>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {reclamacoesFiltradas.map((reclamacao) => (

                <ReclamacaoCard
                  key={reclamacao.id}
                  reclamacao={reclamacao}
                  onReclamacaoClick={handleVerDetalhes}
                />

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
};

export default ReclamacoesPage;