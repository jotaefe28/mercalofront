import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  PasswordResetRequest,
  PasswordReset,
  ChangePasswordData,
  ApiResponse,
  User
} from '@/types';

class AuthService {
  private readonly baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

  constructor() {
    console.log('🔧 AuthService initialized with baseURL:', this.baseURL);
  }

  // Helper method to make fetch requests
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🌐 Making fetch request to:', url);
    console.log('📤 Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'Present' : 'None'
    });

    try {
      const response = await fetch(url, {
        credentials: 'include', // Para enviar cookies automáticamente
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('✅ Response data parsed:', data);

      if (!response.ok) {
        console.error('❌ Response not ok:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Fetch error:', error);
      
      // Si es un error de parsing JSON, lo manejamos
      if (error.name === 'SyntaxError') {
        throw new Error('Error parsing server response');
      }
      
      throw this.handleError(error);
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🔍 AuthService - Starting login with:', { 
      email: credentials.email, 
      baseURL: this.baseURL 
    });

    const loginData = {
      email: credentials.email,
      password: credentials.password,
    };

    console.log('📤 AuthService - Sending login data:', { 
      email: loginData.email 
    });

    try {
      const response = await this.makeRequest<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      console.log('📡 Raw server response:', response);

      // Adaptamos la respuesta del servidor al formato esperado
      if (response.ok === true || response.success === true) {
        console.log('🎉 AuthService - Login successful!');
        
        // Convertimos la respuesta del servidor al formato esperado
        const adaptedResponse: LoginResponse = {
          success: true,
          data: {
            user: response.user,
            message: response.message
          },
          message: response.message || 'Login exitoso'
        };
        
        console.log('✅ Adapted response:', adaptedResponse);
        return adaptedResponse;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      console.error('❌ AuthService - Login failed:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      return await this.makeRequest<ApiResponse<User>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 AuthService - Logging out');
    
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
      console.log('✅ AuthService - Logout successful');
    } catch (error) {
      // Continue with logout even if server request fails
      console.error('⚠️ Error during server logout:', error);
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      console.log('🔍 AuthService - Verifying token...');
      const response = await this.makeRequest<any>('/auth/verify');
      
      console.log('📡 Verify response:', response);
      
      // El servidor puede devolver {authenticated: true} o {success: true}
      const isAuthenticated = response.authenticated === true || 
                            response.success === true || 
                            response.ok === true;
      
      console.log('✅ Token verification result:', isAuthenticated);
      return isAuthenticated;
    } catch (error) {
      console.log('🔍 Token verification failed:', error);
      return false;
    }
  }

  async getVerifyData(): Promise<any> {
    try {
      console.log('🔍 AuthService - Getting verify data...');
      const response = await this.makeRequest<any>('/auth/verify');
      console.log('📡 Verify data response:', response);
      return response;
    } catch (error) {
      console.log('🔍 Get verify data failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 AuthService - Getting current user...');
      const response = await this.makeRequest<any>('/auth/me');
      
      console.log('📡 Current user response:', response);
      
      // El servidor puede devolver el usuario directamente o en response.data
      const user = response.user || response.data?.user || response.data;
      
      if (!user) {
        throw new Error('User data not found in response');
      }
      
      console.log('✅ Current user:', user);
      return user;
    } catch (error: any) {
      console.error('❌ Failed to get current user:', error);
      throw this.handleError(error);
    }
  }

  // Password management
  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async resetPassword(data: PasswordReset): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    // Since we're using cookies, we need to verify with the server
    return await this.verifyToken();
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred');
  }

  // Rate limiting helper (simplified version)
  private rateLimitAttempts = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.rateLimitAttempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.rateLimitAttempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (attempt.count >= maxAttempts) {
      return true;
    }

    attempt.count++;
    return false;
  }

  resetRateLimit(key: string): void {
    this.rateLimitAttempts.delete(key);
  }
}

export const authService = new AuthService();
export default authService;