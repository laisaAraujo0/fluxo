import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReclamacoesPage = () => {
  const [reclamacoes, setReclamacoes] = useState([
    {
      id: 1,
      titulo: "Buraco na Rua Principal",
      status: "Pendente",
      prioridade: "Alta",
      likes: 15,
      comentarios: 5,
      statusColor: "orange",
      prioridadeColor: "red",
      categoria: "Infraestrutura",
      estado: "SP",
      cidade: "São Paulo"
    },
    {
      id: 2,
      titulo: "Iluminação Pública Defeituosa",
      status: "Resolvido",
      prioridade: "Média",
      likes: 20,
      comentarios: 10,
      statusColor: "green",
      prioridadeColor: "yellow",
      categoria: "Serviços Públicos",
      estado: "RJ",
      cidade: "Rio de Janeiro"
    },
    {
      id: 3,
      titulo: "Acúmulo de Lixo",
      status: "Pendente",
      prioridade: "Baixa",
      likes: 5,
      comentarios: 2,
      statusColor: "orange",
      prioridadeColor: "gray",
      categoria: "Meio Ambiente",
      estado: "SP",
      cidade: "São Paulo"
    },
    {
      id: 4,
      titulo: "Vazamento de Água",
      status: "Resolvido",
      prioridade: "Alta",
      likes: 25,
      comentarios: 15,
      statusColor: "green",
      prioridadeColor: "red",
      categoria: "Saneamento",
      estado: "MG",
      cidade: "Belo Horizonte"
    },
    {
      id: 5,
      titulo: "Pichação em Prédio Público",
      status: "Pendente",
      prioridade: "Média",
      likes: 10,
      comentarios: 3,
      statusColor: "orange",
      prioridadeColor: "yellow",
      categoria: "Segurança",
      estado: "RJ",
      cidade: "Rio de Janeiro"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const categorias = ["all", "Infraestrutura", "Serviços Públicos", "Meio Ambiente", "Saneamento", "Segurança"];
  const estados = ["all", "SP", "RJ", "MG"];
  const cidadesPorEstado = {
    "all": ["all"],
    "SP": ["all", "São Paulo", "Campinas"],
    "RJ": ["all", "Rio de Janeiro", "Niterói"],
    "MG": ["all", "Belo Horizonte", "Uberlândia"]
  };

  const filteredReclamacoes = reclamacoes.filter(reclamacao => {
    const matchesCategory = selectedCategory === "all" || reclamacao.categoria === selectedCategory;
    const matchesState = selectedState === "all" || reclamacao.estado === selectedState;
    const matchesCity = selectedCity === "all" || reclamacao.cidade === selectedCity;
    return matchesCategory && matchesState && matchesCity;
  });

  const getStatusBadgeVariant = (color) => {
    switch (color) {
      case 'green': return 'default';
      case 'orange': return 'secondary';
      default: return 'outline';
    }
  };

  const getPrioridadeBadgeVariant = (color) => {
    switch (color) {
      case 'red': return 'destructive';
      case 'yellow': return 'secondary';
      case 'gray': return 'outline';
      default: return 'outline';
    }
  };

  const problemasResolvidos = reclamacoes.filter(r => r.status === "Resolvido").length;
  const problemasPendentes = reclamacoes.filter(r => r.status === "Pendente").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Reclamações do Município
          </h2>
          <div className="flex flex-wrap gap-4 mt-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat === "all" ? "Todas as Categorias" : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map(estado => (
                  <SelectItem key={estado} value={estado}>{estado === "all" ? "Todos os Estados" : estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedState === "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                {cidadesPorEstado[selectedState]?.map(cidade => (
                  <SelectItem key={cidade} value={cidade}>{cidade === "all" ? "Todas as Cidades" : cidade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-1 text-muted-foreground">
            Acompanhe os problemas reportados na sua comunidade e veja o progresso.
          </p>
        </header>

        <section aria-labelledby="stats-heading" className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4 sr-only" id="stats-heading">
            Estatísticas do Bairro
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Clock className="text-orange-500 h-6 w-6" />
                <p className="font-medium text-card-foreground">Problemas Pendentes</p>
              </div>
              <p className="text-4xl font-bold text-card-foreground">{problemasPendentes}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500 h-6 w-6" />
                <p className="font-medium text-card-foreground">Problemas Resolvidos</p>
              </div>
              <p className="text-4xl font-bold text-card-foreground">{problemasResolvidos}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="problems-list-heading">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground" id="problems-list-heading">
              Lista de Reclamações
            </h3>
            {/* <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Reportar Reclamação
            </Button> */}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">
                    Reclamação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">
                    Engajamento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReclamacoes.map((reclamacao) => (
                  <tr key={reclamacao.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                      {reclamacao.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(reclamacao.statusColor)}>
                        {reclamacao.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getPrioridadeBadgeVariant(reclamacao.prioridadeColor)}>
                        {reclamacao.prioridade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-pink-500" />
                        {reclamacao.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-sky-500" />
                        {reclamacao.comentarios}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReclamacoesPage;
