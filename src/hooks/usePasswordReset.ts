import { useState, useCallback } from 'react';
import type { PasswordResetRequest, PasswordReset } from '@/types';
import { authService } from '@/services';
import toast from 'react-hot-toast';

interface UsePasswordResetReturn {
  isLoading: boolean;
  error: string | null;
  requestReset: (email: string) => Promise<boolean>;
  resetPassword: (data: PasswordReset) => Promise<boolean>;
  clearError: () => void;
}

export function usePasswordReset(): UsePasswordResetReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.requestPasswordReset({ email });
      
      if (response.success) {
        toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico');
        return true;
      } else {
        throw new Error(response.message || 'Error al solicitar recuperación');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al solicitar recuperación';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: PasswordReset): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword(data);
      
      if (response.success) {
        toast.success('Contraseña restablecida exitosamente');
        return true;
      } else {
        throw new Error(response.message || 'Error al restablecer contraseña');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al restablecer contraseña';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    requestReset,
    resetPassword,
    clearError,
  };
}