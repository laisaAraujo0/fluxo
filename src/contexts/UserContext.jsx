import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Inicializar o estado do usuário a partir do localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Salvar o usuário no localStorage sempre que mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData) => {
    const userWithLogin = { 
      ...userData, 
      nome: userData.nome || userData.name || 'Usuário',
      telefone: userData.telefone || '', // Adiciona telefone
      isLoggedIn: true 
    };
    setUser(userWithLogin);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const toggleAdmin = () => {
    if (user) {
      setUser(prev => ({ ...prev, isAdmin: !prev.isAdmin }));
    }
  };

  const updateUser = (updates) => {
    if (user) {
      setUser(prev => ({ ...prev, ...updates }));
    }
  };

  const isAuthenticated = () => {
    return user !== null && user.isLoggedIn === true;
  };

  const isAdmin = () => {
    return (
      user !== null &&
      (
        user.tipo === 'ADMIN' ||
        user.tipo === 'AGENCY_ATTENDANT' ||
        user.tipo === 'AGENCY_MANAGER'
      )
    );
  };

  const isUsuario = () => {
    return user !== null && user.tipo === 'usuario';
  };

  const value = {
    user,
    login,
    logout,
    toggleAdmin,
    updateUser,
    setUser,
    isAuthenticated,
    isAdmin,
    isUsuario
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
