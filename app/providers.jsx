'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastProvider from '../contexts/ToastContext';
import { SidebarProvider } from './contexts/SidebarContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function Providers({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950"></div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ToastProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ToastProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

