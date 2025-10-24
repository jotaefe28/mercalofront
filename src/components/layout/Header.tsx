import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui/Button';
import {  UserMenu } from '@/components/pos';
interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { 
    isDarkMode, 
    toggleDarkMode, 
    toggleMobileMenu,
    isSidebarCollapsed 
  } = useAppStore();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gradient-nequi-purple border-b border-gray-200 dark:border-nequi-purple/20 px-6 py-4 shadow-nequi ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-nequi-purple/30"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page title con estilo Nequi */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-raleway">
              <span className="text-gradient-nequi">POS Sistema</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-nequi-pink-light font-raleway">
              Sistema de Punto de Venta - MercaloPOS
            </p>
          </motion.div>
        </div>
        
        {/* Right side - UserMenu alineado al carrito */}
        <div className="xl:mr-8">
          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
};