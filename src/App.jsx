import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Layout from './components/Layout';
import EventosPage from './pages/EventosPage';
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
import AdminToggle from './components/AdminToggle';
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

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Rotas públicas de autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/cadastro" element={<CadastroOrgaoPage />} />
          
          {/* Rotas com layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<EventosPage />} />
            <Route path="eventos" element={<EventosPage />} />
            <Route path="reclamacoes" element={<ReclamacoesPage />} />
            <Route path="mapas" element={<MapasPage />} />
            
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
          
          {/* Rota 404 - deve ser a última */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <AdminToggle />
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

