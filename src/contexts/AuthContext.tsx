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
  | { type: 'AUTH_SUCCESS'; payload: { user: User; company: Company } }
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
        isLoading: false,
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

// Context types
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
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

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.success('Sesión cerrada exitosamente');
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
      console.error('Logout error:', error);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.register(data);

      if (response.success) {
        toast.success('Registro exitoso. Por favor inicia sesión.');
        dispatch({ type: 'AUTH_CLEAR_ERROR' });
      } else {
        throw new Error(response.message || 'Error al registrarse');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al registrarse';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
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
    dispatch({ type: 'AUTH_START' });

    try {
      // Verify authentication with server using cookies
      const isValid = await authService.verifyToken();
      
      if (isValid) {
        // Get current user data from server
        const currentUser = await authService.getCurrentUser();
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: currentUser,
            company: {
              id: currentUser.companyId,
              name: 'Mi Empresa', // This would come from server
              businessType: 'Retail',
              nit: '',
              address: '',
              phone: '',
              email: '',
              plan: 'basic' as const,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    changePassword,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;