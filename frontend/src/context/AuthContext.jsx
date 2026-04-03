import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted user session
    const storedUser = localStorage.getItem('eigen_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('eigen_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('eigen_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eigen_user');
  };

  const isAuthenticated = !!user;

  const isAdmin = () => {
    return user?.roles?.includes('ADMIN') || false;
  };

  const isCoordinator = () => {
    return user?.roles?.includes('COORDINATOR') || false;
  };

  const isParticipant = () => {
    return user?.roles?.includes('STUDENT') || user?.roles?.includes('OUTSIDE_STUDENT') || false;
  };

  const getUserClubs = () => {
    return user?.clubMemberships || [];
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    isAdmin,
    isCoordinator,
    isParticipant,
    getUserClubs,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
