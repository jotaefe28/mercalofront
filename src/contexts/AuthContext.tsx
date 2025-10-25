import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { 
  User, 
  Company, 
  LoginCredentials, 
  RegisterData, 
  ChangePasswordData 
} from '@/types';
import { authService } from '@/services';
import toast from 'react-hot-toast';

// Define AuthState interface locally
interface AuthState {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

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
    console.log('🔐 AuthContext - Login function called');
    
    const rateLimitKey = `login_${credentials.email}`;
    
    if (authService.isRateLimited(rateLimitKey)) {
      const error = 'Too many login attempts. Please try again in 15 minutes.';
      console.log('⏰ AuthContext - Rate limited:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error });
      toast.error(error);
      return;
    }

    console.log('🚦 AuthContext - Dispatching AUTH_START');
    dispatch({ type: 'AUTH_START' });

    try {
      console.log('📞 AuthContext - Calling authService.login...');
      const response = await authService.login(credentials);

      console.log('📡 AuthContext - Response received:', response);

      if (response.success && response.data?.user) {
        console.log('✅ AuthContext - Login successful, dispatching AUTH_SUCCESS');
        console.log('👤 User data:', response.data.user);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            company: {
              id: '1',
              name: response.data.user.name + ' Company',
              legal_name: response.data.user.name + ' Company',
              nit: '123456789',
              document_type: 'nit' as const,
              address: 'Dirección por defecto',
              city: 'Bogotá',
              state: 'Cundinamarca',
              country: 'Colombia',
              phone: '123456789',
              email: response.data.user.email,
              tax_regime: 'simplified' as const,
              industry: 'Retail',
              is_active: true,
              settings: {} as any,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        });

        // Reset rate limit on successful login
        authService.resetRateLimit(rateLimitKey);
        toast.success(`¡Bienvenido, ${response.data.user.name}!`);
      } else {
        console.error('❌ AuthContext - Invalid response structure:', response);
        throw new Error(response.message || 'Error al iniciar sesión - respuesta inválida');
      }
    } catch (error: any) {
      console.error('❌ AuthContext - Login error:', error);
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
    console.log('🔒 AuthContext - Starting auth check...');
    dispatch({ type: 'AUTH_START' });

    try {
      // Verify authentication with server using cookies
      console.log('🔍 AuthContext - Verifying token...');
      const isValid = await authService.verifyToken();
      
      console.log('🔍 AuthContext - Token verification result:', isValid);
      
      if (isValid) {
        console.log('✅ AuthContext - Token valid, getting current user...');
        
        let currentUser;
        try {
          // Intenta obtener el usuario actual del endpoint /auth/me
          currentUser = await authService.getCurrentUser();
          console.log('👤 AuthContext - Current user from /auth/me:', currentUser);
        } catch (error) {
          console.log('⚠️ AuthContext - /auth/me failed, trying to get user from verify response...');
          // Si falla, intenta verificar de nuevo y obtener el usuario de la respuesta
          try {
            const verifyResponse = await authService.getVerifyData();
            currentUser = verifyResponse.user;
            if (!currentUser) {
              throw new Error('No user data available');
            }
            console.log('👤 AuthContext - Current user from verify:', currentUser);
          } catch (verifyError) {
            console.error('❌ AuthContext - Could not get user data:', verifyError);
            dispatch({ type: 'AUTH_LOGOUT' });
            return;
          }
        }
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: currentUser,
            company: {
              id: '1',
              name: 'Mi Nueva Tienda POS',
              legal_name: 'Mi Nueva Tienda POS S.A.S',
              nit: '123456789',
              document_type: 'nit' as const,
              address: 'Dirección por defecto',
              city: 'Bogotá',
              state: 'Cundinamarca',
              country: 'Colombia',
              phone: '123456789',
              email: currentUser.email,
              tax_regime: 'simplified' as const,
              industry: 'Retail',
              is_active: true,
              settings: {} as any,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        });
        
        console.log('✅ AuthContext - Authentication successful, user is logged in');
      } else {
        console.log('❌ AuthContext - Token invalid, logging out...');
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('❌ AuthContext - Auth check failed:', error);
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