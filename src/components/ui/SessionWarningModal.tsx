import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { useAuth } from '@/contexts';

export const SessionWarningModal: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { logout } = useAuth();

  useEffect(() => {
    const handleSessionWarning = (event: CustomEvent) => {
      setRemainingTime(event.detail.remainingTime);
      setShowWarning(true);
    };

    const handleSessionExpired = () => {
      setShowWarning(false);
    };

    window.addEventListener('session-warning', handleSessionWarning as EventListener);
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-warning', handleSessionWarning as EventListener);
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    // In a real app, you might want to ping the server to extend the session
    setShowWarning(false);
    window.dispatchEvent(new CustomEvent('extend-session'));
  };

  const handleLogout = async () => {
    setShowWarning(false);
    await logout();
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sesión por Expirar
                </h2>
              </div>
              <button
                onClick={() => setShowWarning(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tu sesión expirará pronto por inactividad. ¿Deseas continuar?
              </p>
              
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Tiempo restante: <strong className="text-orange-600 dark:text-orange-400">
                    {formatTime(remainingTime)}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleExtendSession}
                className="flex-1 bg-nequi-pink hover:bg-nequi-pink-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continuar Sesión
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};