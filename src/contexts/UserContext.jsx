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
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const decoded = JSON.parse(atob(savedToken.split('.')[1]));
        
        // Verifica se o token expirou
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return null;
        }

        return { 
          ...JSON.parse(savedUser), 
          token: savedToken, 
          isLoggedIn: true,
          id: decoded.id || JSON.parse(savedUser)?.id 
        };
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        return null;
      }
    }
    return null;
  });

  // Salvar o usuário no localStorage sempre que mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('token', user.token);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const login = (userData) => {
    const userWithLogin = { 
      ...userData, 
      nome: userData.nome || userData.name || 'Usuário',
      telefone: userData.telefone || '', // Adiciona telefone
      isLoggedIn: true,
      tipo: userData.tipo || 'usuario',
      isAdmin: userData.isAdmin || false
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
    return user !== null && user.isLoggedIn === true && !!user.token;
  };

  const isAdmin = () => {
    return user !== null && user.tipo === 'administrador';
  };

  const isUsuario = () => {
    return user !== null && user.tipo === 'usuario';
  };

  const getToken = () => {
    return user?.token || localStorage.getItem('token');
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
    isUsuario,
    getToken
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
