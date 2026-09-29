import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';
import { authenticateSocket } from '@/services/socketService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser deve ser usado dentro de um UserProvider');
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = (userData, token) => {
    if (token) localStorage.setItem('token', token);
    if (token) authenticateSocket();
    setUser({
      ...userData,
      nome: userData.nome || userData.name || 'Usuário',
      name: userData.name || userData.nome || 'Usuário',
      isLoggedIn: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => prev ? { ...prev, ...updates } : prev);

  const isAuthenticated = () => Boolean(user?.isLoggedIn && localStorage.getItem('token'));
  const isAdmin = () => ['AGENCY_ATTENDANT', 'AGENCY_MANAGER', 'FLUXO_ADMIN'].includes(user?.role);
  const isCitizen = () => user?.role === 'CITIZEN';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/api/usuarios/me')
      .then(({ data }) => setUser((prev) => ({ ...prev, ...data, isLoggedIn: true })))
      .catch(() => logout());
  }, []);

  return (
    <UserContext.Provider value={{
      user, login, logout, updateUser, setUser,
      isAuthenticated, isAdmin, isCitizen,
    }}>
      {children}
    </UserContext.Provider>
  );
};
