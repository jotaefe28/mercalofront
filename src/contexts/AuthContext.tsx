import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { 
  AuthState, 
  User, 
  Company, 
  LoginCredentials, 
  RegisterData, 
  ChangePasswordData 
} from '@/types';
import { authService } from '@/services';
import toast from 'react-hot-toast';

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; company: Company; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  company: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        company: action.payload.company,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        company: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// Context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    // Rate limiting check
    const rateLimitKey = `login_${credentials.email}`;
    if (authService.isRateLimited(rateLimitKey)) {
      const error = 'Too many login attempts. Please try again in 15 minutes.';
      dispatch({ type: 'AUTH_FAILURE', payload: error });
      toast.error(error);
      return;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.login(credentials);

      if (response.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            company: response.data.company,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          },
        });

        // Reset rate limit on successful login
        authService.resetRateLimit(rateLimitKey);
        toast.success(`¡Bienvenido, ${response.data.user.name}!`);
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.register(data);

      if (response.success) {
        toast.success('Cuenta creada exitosamente. Por favor, inicia sesión.');
        dispatch({ type: 'AUTH_CLEAR_ERROR' });
      } else {
        throw new Error(response.message || 'Error al registrar usuario');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al registrar usuario';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.success('Sesión cerrada exitosamente');
    } catch (error: any) {
      // Continue with logout even if server request fails
      dispatch({ type: 'AUTH_LOGOUT' });
      console.error('Error during logout:', error);
    }
  };

  // Change password function
  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.changePassword(data);

      if (response.success) {
        toast.success('Contraseña cambiada exitosamente');
        dispatch({ type: 'AUTH_CLEAR_ERROR' });
      } else {
        throw new Error(response.message || 'Error al cambiar contraseña');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al cambiar contraseña';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    const token = authService.getAccessToken();
    
    dispatch({ type: 'AUTH_START' });

    if (!token) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }

    try {
      // If token is valid, decode payload and rehydrate user
      if (authService.isTokenValid(token)) {
        const payload = authService.getPayloadFromToken(token);

        if (payload) {
          const user: User = {
            id: payload.sub as string,
            email: payload.email as string,
            name: (payload.name as string) || payload.email || 'Usuario',
            role: (payload.role as any) || 'user',
            companyId: (payload.companyId as string) || '',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // For now, company is minimal; in real app call authService.getCurrentUser() or /auth/me
          const company: Company = {
            id: (payload.companyId as string) || '',
            name: 'Mi Tienda',
            businessType: 'Retail',
            nit: '',
            address: '',
            phone: '',
            email: user.email,
            plan: 'BASIC' as any,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              company,
              accessToken: token,
              refreshToken: authService.getRefreshToken() || '',
            },
          });

          // If token is close to expiry, try to refresh proactively
          const exp = payload.exp as number;
          const nowSec = Math.floor(Date.now() / 1000);
          const secondsLeft = exp - nowSec;

          if (secondsLeft < 60 && authService.getRefreshToken()) {
            try {
              const newToken = await authService.refreshToken();
              // update token in context
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user,
                  company,
                  accessToken: newToken,
                  refreshToken: authService.getRefreshToken() || '',
                },
              });
            } catch (refreshErr) {
              console.warn('Token refresh failed during rehydrate:', refreshErr);
            }
          }

          return;
        }
      }

      // If token invalid or payload couldn't be decoded, try server verify or logout
      const verified = await authService.verifyToken();
      if (verified) {
        // If server verifies token, attempt to fetch current user
        try {
          const currentUser = await authService.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: currentUser,
              company: currentUser.company as any,
              accessToken: token,
              refreshToken: authService.getRefreshToken() || '',
            },
          });
          return;
        } catch (meErr) {
          console.warn('Could not fetch /auth/me during rehydrate:', meErr);
        }
      }

      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error: any) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    changePassword,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Re-export types
export type { AuthState, AuthContextType };