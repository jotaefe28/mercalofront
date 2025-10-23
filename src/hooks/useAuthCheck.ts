import { useState, useEffect } from 'react';
import { authService } from '@/services';

interface UseAuthCheckReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

export function useAuthCheck(): UseAuthCheckReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const isValid = await authService.verifyToken();
      setIsAuthenticated(isValid);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  };
}