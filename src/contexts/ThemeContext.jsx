import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    // Load theme and language from localStorage
    const savedTheme = localStorage.getItem('furniture_theme') || 'light';
    const savedLanguage = localStorage.getItem('furniture_language') || 'English';
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    
    // Apply theme to document
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('furniture_theme', newTheme);
    applyTheme(newTheme);
  };

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('furniture_language', newLanguage);
  };

  const value = {
    theme,
    language,
    updateTheme,
    updateLanguage,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};