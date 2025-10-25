import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Home, 
  Settings, 
  Users, 
  ChevronLeft,
  Menu,
  CreditCard,
  ShoppingCart,
  Package,
  TrendingUp,
  UserCheck,
  Star,
  Building2,
  UserCog
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { id: 'pos', label: 'POS / Ventas', icon: ShoppingCart, href: '/', badge: 'Activo', badgeColor: 'bg-green-500' },
  { id: 'inventory', label: 'Inventario', icon: Package, href: '/inventory' },
  { id: 'sales-report', label: 'Reporte de ventas', icon: TrendingUp, href: '/sales-report' },
  { id: 'clients', label: 'Clientes', icon: UserCheck, href: '/clients' },
  { id: 'points', label: 'Puntos', icon: Star, href: '/points' },
  { id: 'accounts', label: 'Cuentas por Cobrar', icon: CreditCard, href: '/accounts' },
  { id: 'company', label: 'Empresa', icon: Building2, href: '/company' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/users' },
  { id: 'roles', label: 'Roles y Permisos', icon: UserCog, href: '/roles' },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isSidebarCollapsed, 
    toggleSidebar, 
    isMobileMenuOpen,
    setMobileMenuOpen 
  } = useAppStore();

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.href);
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
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
          <div className="flex items-center justify-between p-4 border-b border-nequi-purple/20">
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
              {isSidebarCollapsed && (
                <div className="w-8 h-8 bg-gradient-nequi rounded-lg flex items-center justify-center shadow-nequi mx-auto">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
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
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <div key={item.id} className="relative group">
                  <motion.button
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-3 py-3' : 'justify-start space-x-3 px-4 py-3'
                    } rounded-xl text-left transition-all duration-200 font-raleway font-medium relative ${
                      isActive
                        ? 'bg-gradient-nequi text-white shadow-nequi'
                        : 'text-nequi-pink-light hover:bg-white/10 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02, x: isSidebarCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon 
                      className={`h-5 w-5 ${
                        isActive ? 'text-white' : 'text-nequi-pink-light group-hover:text-white'
                      } ${isSidebarCollapsed ? 'mx-auto' : ''}`} 
                    />
                    
                    {!isSidebarCollapsed && (
                      <motion.span
                        animate={{ 
                          opacity: isSidebarCollapsed ? 0 : 1,
                          width: isSidebarCollapsed ? 0 : 'auto'
                        }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}

                    {/* Badge */}
                    {!isSidebarCollapsed && item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-2 py-1 text-xs rounded-full text-white font-medium ${
                          item.badgeColor || 'bg-nequi-pink'
                        }`}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                    
                    {/* Indicador activo */}
                    {isActive && !isSidebarCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-2 h-2 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Indicador activo para sidebar colapsado */}
                    {isActive && isSidebarCollapsed && (
                      <motion.div
                        className="absolute -right-1 top-1/8 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>

                  {/* Tooltip para sidebar colapsado */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                        {item.label}
                        {item.badge && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            item.badgeColor || 'bg-nequi-pink'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer con versión */}
          <div className="p-3 border-t border-nequi-purple/20">
            {!isSidebarCollapsed && (
              <motion.div
                animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="bg-white/10 rounded-lg p-3 glass-nequi-dark">
                  <div className="text-xs text-nequi-pink-light font-raleway">
                    Versión 1.0.0
                  </div>
                  <div className="text-xs text-white/70 font-raleway mt-1">
                    ¡Tu dinero seguro!
                  </div>
                </div>
              </motion.div>
            )}
            {isSidebarCollapsed && (
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-nequi-pink rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};