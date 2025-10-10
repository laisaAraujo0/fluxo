import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Mapeamento de rotas para nomes amigáveis
  const routeNames = {
    '': 'Início',
    'eventos': 'Eventos',
    'mapas': 'Mapas',
    'reclamacoes': 'Reclamações',
    'perfil': 'Perfil',
    'admin': 'Administração',
    'dashboard': 'Dashboard',
    'cadastro': 'Cadastro',
    'login': 'Login',
    'cadastro-orgao': 'Cadastro de Órgão'
  };

  // Dividir o pathname em segmentos
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');

  // Se estiver na home, não mostrar breadcrumbs
  if (pathSegments.length === 0) {
    return null;
  }

  // Construir os breadcrumbs
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return {
      path,
      name,
      isLast
    };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground py-3 px-4 bg-muted/30 rounded-lg mb-4">
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.name}</span>
          ) : (
            <Link 
              to={crumb.path}
              className="hover:text-foreground transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;

