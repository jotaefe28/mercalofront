import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Home, 
  Settings, 
  Users, 
  ChevronLeft,
  Menu,
  CreditCard
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/' },
  { id: 'reports', label: 'Reportes', icon: BarChart3, href: '/reports' },
  { id: 'clients', label: 'Clientes', icon: Users, href: '/clients' },
  { id: 'calendar', label: 'Calendario', icon: Calendar, href: '/calendar' },
  { id: 'settings', label: 'Configuración', icon: Settings, href: '/settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { 
    isSidebarCollapsed, 
    toggleSidebar, 
    currentPage, 
    setCurrentPage,
    isMobileMenuOpen,
    setMobileMenuOpen 
  } = useAppStore();

  const handleMenuClick = (itemId: string) => {
    setCurrentPage(itemId);
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarCollapsed ? 80 : 280,
          x: isMobileMenuOpen ? 0 : window.innerWidth < 768 ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full bg-gradient-nequi-purple border-r border-nequi-purple/20 z-50 md:relative md:translate-x-0 shadow-nequi-purple ${className}`}
      >
        <div className="flex flex-col h-full">
          {/* Header con logo estilo Nequi */}
          <div className="flex items-center justify-between p-6 border-b border-nequi-purple/20">
            <motion.div
              animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3"
            >
              {!isSidebarCollapsed && (
                <>
                  <div className="w-10 h-10 bg-gradient-nequi rounded-xl flex items-center justify-center shadow-nequi">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white font-raleway">
                      MercaloPOS
                    </div>
                    <div className="text-sm text-nequi-pink-light font-raleway">
                      Dashboard
                    </div>
                  </div>
                </>
              )}
            </motion.div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex text-white hover:bg-nequi-purple/30 hover:text-nequi-pink-light"
            >
              <motion.div
                animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.div>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-white hover:bg-nequi-purple/30"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group font-raleway font-medium ${
                    isActive
                      ? 'bg-gradient-nequi text-white shadow-nequi'
                      : 'text-nequi-pink-light hover:bg-white/10 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon 
                    className={`h-5 w-5 ${
                      isActive ? 'text-white' : 'text-nequi-pink-light group-hover:text-white'
                    }`} 
                  />
                  <motion.span
                    animate={{ 
                      opacity: isSidebarCollapsed ? 0 : 1,
                      width: isSidebarCollapsed ? 0 : 'auto'
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {!isSidebarCollapsed && item.label}
                  </motion.span>
                  
                  {/* Indicador activo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Footer con versión */}
          <div className="p-4 border-t border-nequi-purple/20">
            <motion.div
              animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              {!isSidebarCollapsed && (
                <div className="bg-white/10 rounded-lg p-3 glass-nequi-dark">
                  <div className="text-xs text-nequi-pink-light font-raleway">
                    Versión 1.0.0
                  </div>
                  <div className="text-xs text-white/70 font-raleway mt-1">
                    ¡Tu dinero seguro!
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};