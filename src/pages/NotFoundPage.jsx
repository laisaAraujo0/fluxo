import { useNavigate } from 'react-router-dom';
import { MapPin, Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirecionar para página de eventos com busca
      navigate(`/eventos?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const quickLinks = [
    { path: '/', label: 'Eventos', icon: MapPin },
    { path: '/mapas', label: 'Mapas', icon: MapPin },
    { path: '/reclamacoes', label: 'Reclamações', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Cabeçalho com Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <MapPin className="h-24 w-24 text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">!</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-foreground">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Página Não Encontrada
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ops! A página que você está procurando não existe ou foi movida para outro local.
            </p>
          </div>
        </div>

        {/* Card Principal */}
        <Card className="shadow-lg">

          
          <CardContent className="space-y-6">

            {/* Botões de Navegação */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 flex-1"
              >
                <Home className="h-4 w-4" />
                Página Inicial
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Animação de fundo */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/3 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-primary/4 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
