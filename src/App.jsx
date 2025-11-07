import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import { useEffect, useState } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import Layout from './components/Layout';
import EventosPage from './pages/EventosPage';
import DetalheEvento from './components/DetalheEvento';
import ReclamacoesPage from './pages/ReclamacoesPage';
import MapasPage from './pages/MapasPage';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CadastroOrgaoPage from './pages/CadastroOrgaoPage';
import PerfilPage from './pages/PerfilPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

// Componente para proteger rotas de usuário
const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useUser();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Componente para proteger rotas de administrador
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useUser();

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * ScrollToTopOnNavigate
 * - Rola automaticamente para o topo quando a rota muda
 */
function ScrollToTopOnNavigate() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function AppContent() {
  const [loading, setLoading] = useState(true);

  // Tela de loading inicial
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen isVisible message="Carregando..." type="data" />;
  }

  return (
    <Router>
      {/* Garante scroll automático ao navegar entre páginas */}
      <ScrollToTopOnNavigate />

      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Rotas públicas de autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/cadastro" element={<CadastroOrgaoPage />} />

          {/* Rotas com layout */}
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <ProtectedUserRoute>
                  <EventosPage />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="eventos"
              element={
                <ProtectedUserRoute>
                  <EventosPage />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="reclamacoes"
              element={
                <ProtectedUserRoute>
                  <ReclamacoesPage />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="mapas"
              element={
                <ProtectedUserRoute>
                  <MapasPage />
                </ProtectedUserRoute>
              }
            />

            {/* Rota protegida de usuário */}
            <Route
              path="perfil"
              element={
                <ProtectedUserRoute>
                  <PerfilPage />
                </ProtectedUserRoute>
              }
            />

            {/* Rotas protegidas de administrador */}
            <Route
              path="admin"
              element={
                <ProtectedAdminRoute>
                  <AdminPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedAdminRoute>
                  <DashboardPage />
                </ProtectedAdminRoute>
              }
            />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
