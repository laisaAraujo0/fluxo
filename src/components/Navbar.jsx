import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Menu, User, LayoutDashboard, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalSearch from './GlobalSearch';
import CEPInput from './CEPInput';
import { useUser } from '@/contexts/UserContext';
import NotificationBell from './NotificationBell';
import ThemeSwitcher from './ThemeSwitcher';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Eventos', icon: MapPin },
    { path: '/mapas', label: 'Mapas', icon: MapPin },
  ];

  if (isAuthenticated() && !isAdmin()) {
    navItems.push({ path: '/reclamacoes', label: 'Reclamações', icon: MapPin });
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavItemClick = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <>
      {/* Navbar Principal */}
      <nav className="sticky top-0 z-2000 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">FLUXO</span>
              </Link>
            </div>

            {/* Busca Global - Desktop */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <GlobalSearch />
            </div>

            {/* Buttons lado direito */}
            <div className="flex items-center space-x-2">

              <ThemeSwitcher />

              {isAuthenticated() && <NotificationBell />}

              {isAuthenticated() ? (
                <>
                  {/* Menu usuário */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.nome || 'Usuário'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || 'email@exemplo.com'}
                          </p>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      {isAdmin() ? (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Painel Admin
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem onClick={() => navigate('/perfil')}>
                          <User className="mr-2 h-4 w-4" />
                          Perfil
                        </DropdownMenuItem>
                      )}

                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-9 w-9"
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavItemClick('/login')}
                >
                  Entrar
                </Button>
              )}

              {/* Botão menu mobile */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* Faixa Navegação Desktop */}
      <div className="hidden md:block w-full border-b bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavItemClick(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center">
              <CEPInput />
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        
        {/* Fundo */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />

        {/* Painel lateral */}
        <div className={`fixed inset-y-0 left-0 w-full max-w-sm bg-background shadow-2xl transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>

          <div className="flex flex-col h-full overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between pt-20 px-10">
              <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-2">
                <span className="text-xl font-bold text-foreground"></span>
              </Link>

              <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Busca + CEP */}
            <div className="p-8 space-y-4 border-b">
              <GlobalSearch />
              <CEPInput />
            </div>

            {/* Navegação */}
            <div className="flex-1 p-8">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavItemClick(item.path)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium ${
                        isActive(item.path)
                          ? 'bg-gray-200 dark:bg-gray-900'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ações usuário */}
            <div className="p-4 border-t">
              {isAuthenticated() ? (
                <div className="space-y-2">

                  <div className="px-4 py-2">
                    <p className="text-sm font-medium">{user?.nome}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  {isAdmin() ? (
                    <>
                      <Button variant="ghost" className="w-full justify-start"
                        onClick={() => handleNavItemClick('/admin')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Painel Admin
                      </Button>

                      <Button variant="ghost" className="w-full justify-start"
                        onClick={() => handleNavItemClick('/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" className="w-full justify-start"
                      onClick={() => handleNavItemClick('/perfil')}>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Button>
                  )}

                  <Button variant="outline" className="w-full justify-start"
                    onClick={() => { handleLogout(); closeMobileMenu(); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>

                </div>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => handleNavItemClick('/login')}>
                    Entrar
                  </Button>

                  <Button variant="outline" className="w-full"
                    onClick={() => handleNavItemClick('/cadastro')}>
                    Cadastrar
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
