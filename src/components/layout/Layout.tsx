import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { LayoutProvider, useLayout } from '@/contexts';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useAppStore();
  const { rightPanelContent } = useLayout();

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gradient-nequi-dark transition-colors duration-300 flex overflow-hidden">
      {/* Sidebar fijo izquierdo */}
      <Sidebar />
      
      {/* Área central: Header + Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header solo en el área central */}
        <Header />
        
        {/* Contenido principal */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-transparent"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </motion.main>
      </div>
      
      {/* Panel derecho fijo para carrito - SIEMPRE visible en desktop */}
      <div className="w-[420px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden xl:flex flex-col">
        {rightPanelContent}
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
};