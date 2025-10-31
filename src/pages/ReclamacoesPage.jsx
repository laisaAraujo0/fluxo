import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { subscribeToBroadcast, unsubscribeFromBroadcast } from '@/services/socketService';

const ReclamacoesPage = () => {
  // Dados mockados removidos para simular um estado inicial vazio
  const [reclamacoes, setReclamacoes] = useState([
    {
      id: 1,
      titulo: "Buraco na Rua Principal",
      status: "PENDING",
      priority: "HIGH",
      likes: 15,
      comentarios: 5,
      categoria: "Infraestrutura",
      estado: "SP",
      cidade: "São Paulo",
    },
    {
      id: 2,
      titulo: "Iluminação Pública Defeituosa",
      status: "RESOLVED",
      priority: "MEDIUM",
      likes: 20,
      comentarios: 10,
      categoria: "Serviços Públicos",
      estado: "RJ",
      cidade: "Rio de Janeiro",
    },
    {
      id: 3,
      titulo: "Acúmulo de Lixo",
      status: "PENDING",
      priority: "LOW",
      likes: 5,
      comentarios: 2,
      categoria: "Meio Ambiente",
      estado: "SP",
      cidade: "São Paulo",
    },
    {
      id: 4,
      titulo: "Vazamento de Água",
      status: "RESOLVED",
      priority: "HIGH",
      likes: 25,
      comentarios: 15,
      categoria: "Saneamento",
      estado: "MG",
      cidade: "Belo Horizonte",
    },
    {
      id: 5,
      titulo: "Pichação em Prédio Público",
      status: "PENDING",
      priority: "MEDIUM",
      likes: 10,
      comentarios: 3,
      categoria: "Segurança",
      estado: "RJ",
      cidade: "Rio de Janeiro",
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  // const [selectedState, setSelectedState] = useState("all"); // Removido conforme solicitação
  // const [selectedCity, setSelectedCity] = useState("all"); // Removido conforme solicitação

  // Handler para o broadcast de nova reclamação
  useEffect(() => {
    subscribeToBroadcast('complaint:new', handleNewComplaintBroadcast);

    return () => {
      unsubscribeFromBroadcast('complaint:new', handleNewComplaintBroadcast);
    };
  }, []);

  const handleNewComplaintBroadcast = (novaReclamacao) => {
    setReclamacoes(prevReclamacoes => [novaReclamacao, ...prevReclamacoes]);
    toast.info(`Nova Reclamação Registrada: ${novaReclamacao.title}`);
  };

  const categorias = ["all", "Prefeitura Municipal", "Corpo de Bombeiros", "SAMU/Ambulância", "Polícia Militar", "Polícia Civil", "Defesa Civil", "Companhia de Água e Esgoto", "Companhia de Energia Elétrica", "Secretaria de Obras", "Secretaria de Meio Ambiente", "Secretaria de Transporte", "Guarda Municipal"];
  // const estados = ["all", "SP", "RJ", "MG"]; // Removido conforme solicitação
  // const cidadesPorEstado = { // Removido conforme solicitação
  //   all: ["all"],
  //   SP: ["all", "São Paulo", "Campinas"],
  //   RJ: ["all", "Rio de Janeiro", "Niterói"],
  //   MG: ["all", "Belo Horizonte", "Uberlândia"],
  // }; // Removido conforme solicitação

  // Simulação: A localização do usuário logado seria obtida aqui.
  // Para fins de demonstração, vamos simular que o usuário está em "São Paulo", "SP".
  const userState = "SP";
  const userCity = "São Paulo";

  const filteredReclamacoes = reclamacoes.filter((r) => {
    const matchesCategory = selectedCategory === "all" || r.categoria === selectedCategory;
    // A filtragem agora usa a localização simulada do usuário
    const matchesState = r.estado === userState;
    const matchesCity = r.cidade === userCity;
    return matchesCategory && matchesState && matchesCity;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'RESOLVED': return 'default';
      case 'PENDING': return 'secondary';
      default: return 'outline';
    }
  };

  const getPrioridadeBadgeVariant = (priority) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'outline';
    }
  };

  const problemasResolvidos = reclamacoes.filter(r => r.status === "RESOLVED").length;
  const problemasPendentes = reclamacoes.filter(r => r.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Reclamações do Município
          </h2>

          <div className="flex flex-wrap gap-4 mt-4">
            {/* Categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "Todas as Categorias" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 
            * O botão/filtro de localização foi removido conforme solicitado.
            * A filtragem por localização deve ser feita automaticamente
            * com base na localização cadastrada do usuário logado,
            * o que requer integração com o serviço de autenticação/perfil.
            * A lógica de filtro abaixo foi mantida para simulação, mas
            * deve ser ajustada para usar a localização do usuário.
            */}
          </div>

          <p className="mt-1 text-muted-foreground">
            Acompanhe os problemas reportados na sua comunidade e veja o progresso.
          </p>
        </header>

        {/* Estatísticas */}
        <section aria-labelledby="stats-heading" className="mb-8">
          <h3
            className="text-lg font-bold text-foreground mb-4 sr-only"
            id="stats-heading"
          >
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

        {/* Lista */}
        <section aria-labelledby="problems-list-heading">
          <div className="flex justify-between items-center mb-4">
            <h3
              className="text-lg font-bold text-foreground"
              id="problems-list-heading"
            >
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Reclamação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Engajamento
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredReclamacoes.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                      {r.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(r.status)}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getPrioridadeBadgeVariant(r.priority)}>
                        {r.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-pink-500" />
                        {r.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-sky-500" />
                        {r.comentarios}
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
