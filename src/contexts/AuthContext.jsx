import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('furniture_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('furniture_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // In a real app, this would be an API call
      const storedUsers = JSON.parse(localStorage.getItem('furniture_users') || '[]');
      const foundUser = storedUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('furniture_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // Store user in localStorage (in a real app, this would be an API call)
      const storedUsers = JSON.parse(localStorage.getItem('furniture_users') || '[]');
      storedUsers.push(newUser);
      localStorage.setItem('furniture_users', JSON.stringify(storedUsers));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('furniture_user', JSON.stringify(userWithoutPassword));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('furniture_user');
  };

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('furniture_user', JSON.stringify(updatedUser));
      
      // Update in users list
      const storedUsers = JSON.parse(localStorage.getItem('furniture_users') || '[]');
      const updatedUsers = storedUsers.map(u => 
        u.id === user.id ? { ...u, ...userData } : u
      );
      localStorage.setItem('furniture_users', JSON.stringify(updatedUsers));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};