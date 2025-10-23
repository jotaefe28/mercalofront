import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  Moon, 
  Sun,
  Menu,
  Wallet
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    toggleMobileMenu,
    isSidebarCollapsed 
  } = useAppStore();

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
              <span className="text-gradient-nequi">Dashboard</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-nequi-pink-light font-raleway">
              Tu dinero, siempre seguro y disponible
            </p>
          </motion.div>
        </div>

        {/* Center - Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center flex-1 max-w-md mx-8"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Right side */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-3"
        >
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="relative"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </motion.div>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              3
            </motion.span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User profile */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <motion.div
              animate={{ 
                opacity: isSidebarCollapsed ? 1 : 1,
                width: 'auto'
              }}
              className="hidden sm:block"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                John Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};