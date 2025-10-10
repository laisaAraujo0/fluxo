import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DashboardCharts = () => {
  // Dados para gráfico de eventos por mês
  const eventosPorMes = [
    { mes: 'Jan', eventos: 45, resolvidos: 38 },
    { mes: 'Fev', eventos: 52, resolvidos: 44 },
    { mes: 'Mar', eventos: 61, resolvidos: 53 },
    { mes: 'Abr', eventos: 58, resolvidos: 49 },
    { mes: 'Mai', eventos: 67, resolvidos: 58 },
    { mes: 'Jun', eventos: 73, resolvidos: 65 },
    { mes: 'Jul', eventos: 69, resolvidos: 61 },
    { mes: 'Ago', eventos: 78, resolvidos: 70 },
    { mes: 'Set', eventos: 82, resolvidos: 74 },
    { mes: 'Out', eventos: 89, resolvidos: 81 }
  ];

  // Dados para gráfico de categorias
  const eventosPorCategoria = [
    { categoria: 'Infraestrutura', quantidade: 342, cor: '#3b82f6' },
    { categoria: 'Segurança', quantidade: 289, cor: '#ef4444' },
    { categoria: 'Meio Ambiente', quantidade: 234, cor: '#10b981' },
    { categoria: 'Saúde', quantidade: 198, cor: '#f59e0b' },
    { categoria: 'Educação', quantidade: 156, cor: '#8b5cf6' },
    { categoria: 'Cultura', quantidade: 123, cor: '#ec4899' }
  ];

  // Dados para gráfico de status
  const eventosPorStatus = [
    { status: 'Pendente', quantidade: 234, cor: '#f59e0b' },
    { status: 'Em Andamento', quantidade: 456, cor: '#3b82f6' },
    { status: 'Resolvido', quantidade: 892, cor: '#10b981' },
    { status: 'Cancelado', quantidade: 67, cor: '#ef4444' }
  ];

  // Dados para gráfico de usuários ativos
  const usuariosAtivos = [
    { dia: 'Seg', usuarios: 234 },
    { dia: 'Ter', usuarios: 289 },
    { dia: 'Qua', usuarios: 312 },
    { dia: 'Qui', usuarios: 298 },
    { dia: 'Sex', usuarios: 345 },
    { dia: 'Sáb', usuarios: 267 },
    { dia: 'Dom', usuarios: 198 }
  ];

  // Cores para o gráfico de pizza
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Eventos por Mês */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Eventos e Resoluções por Mês</CardTitle>
          <CardDescription>
            Comparação entre eventos reportados e resolvidos nos últimos 10 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={eventosPorMes}>
              <defs>
                <linearGradient id="colorEventos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolvidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="eventos" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorEventos)"
                name="Eventos Reportados"
              />
              <Area 
                type="monotone" 
                dataKey="resolvidos" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorResolvidos)"
                name="Eventos Resolvidos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Eventos por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos por Categoria</CardTitle>
          <CardDescription>
            Distribuição de eventos por tipo de categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventosPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantidade" name="Quantidade">
                {eventosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>
            Status atual de todos os eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventosPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {eventosPorStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Usuários Ativos */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Usuários Ativos por Dia</CardTitle>
          <CardDescription>
            Número de usuários ativos nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usuariosAtivos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="usuarios" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Usuários Ativos"
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;

