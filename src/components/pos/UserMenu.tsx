import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  UserCircle, 
  Shield, 
  Bell,
  CreditCard,
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // El toast se manejará desde el contexto de autenticación
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: UserCircle,
      label: 'Mi Perfil',
      action: () => {
        console.log('Abriendo perfil...');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Configuración',
      action: () => {
        console.log('Abriendo configuración...');
        setIsOpen(false);
      }
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      action: () => {
        console.log('Abriendo notificaciones...');
        setIsOpen(false);
      }
    },
    {
      icon: CreditCard,
      label: 'Facturación',
      action: () => {
        console.log('Abriendo facturación...');
        setIsOpen(false);
      }
    },
    {
      icon: Shield,
      label: 'Seguridad',
      action: () => {
        console.log('Abriendo seguridad...');
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all backdrop-blur-sm border border-white/30"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-nequi-pink to-nequi-purple rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-black">
            {user?.name || 'Usuario'}
          </div>
          <div className="text-xs text-black/70">
            {user?.role || 'admin'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-black/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[60]"
          >
            {/* Header del menú */}
            <div className="bg-gradient-to-r from-nequi-purple-dark to-nequi-pink p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">{user?.name || 'Usuario Admin'}</div>
                  <div className="text-sm text-white/80">{user?.email || 'admin@nuevatienda.com'}</div>
                </div>
              </div>
            </div>

            {/* Items del menú */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Cerrar sesión */}
            <div className="border-t border-gray-200">
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">Cerrar Sesión</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};