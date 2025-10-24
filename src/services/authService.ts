import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RefreshTokenResponse,
  PasswordResetRequest,
  PasswordReset,
  ChangePasswordData,
  ApiResponse,
  User,
  JWTPayload
} from '@/types';
import { 
  CSRFService, 
  SecurityHeadersService, 
  SecurityLogger, 
  SanitizationService,
  SessionSecurityService,
  RateLimitService
} from './securityService';

class AuthService {
  private api: AxiosInstance;
  private readonly baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  private readonly tokenKey = 'mercalo_access_token';
  private readonly refreshTokenKey = 'mercalo_refresh_token';
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...SecurityHeadersService.getSecurityHeaders(),
      },
      timeout: 10000,
    });

    this.setupInterceptors();
    this.initializeSecurity();
  }

  private initializeSecurity(): void {
    // Initialize CSRF token
    if (!CSRFService.getCSRFToken()) {
      const token = CSRFService.generateCSRFToken();
      CSRFService.setCSRFToken(token);
    }

    // Initialize session security
    SessionSecurityService.initializeSessionSecurity();

    // Listen for session events
    window.addEventListener('session-expired', this.handleSessionExpired.bind(this));
    window.addEventListener('session-warning', this.handleSessionWarning.bind(this));
  }

  private handleSessionExpired(): void {
    this.logout();
    window.location.href = '/login?reason=session-expired';
  }

  private handleSessionWarning(event: Event): void {
    const customEvent = event as CustomEvent;
    // Show session warning modal/toast
    console.warn('Session will expire soon:', customEvent.detail?.remainingTime);
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token and security headers
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token
        const csrfHeaders = CSRFService.getCSRFHeaders();
        Object.assign(config.headers, csrfHeaders);

        // Add security headers
        const securityHeaders = SecurityHeadersService.getSecurityHeaders();
        Object.assign(config.headers, securityHeaders);

        // Update session activity
        SessionSecurityService.updateLastActivity();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh and security validation
    this.api.interceptors.response.use(
      (response) => {
        // Validate security headers in response
        const hasSecurityHeaders = SecurityHeadersService.validateSecurityHeaders(
          response.headers as Record<string, string>
        );

        if (!hasSecurityHeaders) {
          SecurityLogger.log({
            type: 'security_header_missing',
            severity: 'medium',
            message: 'Response missing required security headers',
            details: { url: response.config.url }
          });
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          SecurityLogger.log({
            type: 'token_expired',
            severity: 'medium',
            message: 'Access token expired, attempting refresh',
            details: { url: originalRequest.url }
          });

          try {
            const newToken = await this.handleTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            SecurityLogger.log({
              type: 'token_refresh',
              severity: 'high',
              message: 'Token refresh failed, forcing logout',
            });

            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Log security-related errors
        if (error.response?.status === 403) {
          SecurityLogger.log({
            type: 'csrf_violation',
            severity: 'high',
            message: 'CSRF token validation failed',
            details: { url: originalRequest.url }
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleTokenRefresh(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshToken().then((newToken) => {
      this.refreshPromise = null;
      return newToken;
    }).catch((error) => {
      this.refreshPromise = null;
      throw error;
    });

    return this.refreshPromise;
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Sanitize input
    const sanitizedCredentials = {
      ...credentials,
      email: SanitizationService.sanitizeEmail(credentials.email),
      password: credentials.password, // Don't sanitize password to avoid breaking it
    };

    // Rate limiting check
    const rateLimitKey = `login_${sanitizedCredentials.email}`;
    const rateLimitResult = RateLimitService.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      SecurityLogger.log({
        type: 'rate_limit_exceeded',
        severity: 'high',
        message: 'Login rate limit exceeded',
        details: { 
          email: sanitizedCredentials.email,
          retryAfter: rateLimitResult.retryAfter,
          remainingAttempts: rateLimitResult.remainingAttempts
        }
      });

      throw new Error(`Too many login attempts. Try again in ${Math.ceil(rateLimitResult.retryAfter / 1000 / 60)} minutes.`);
    }

    SecurityLogger.log({
      type: 'login_attempt',
      severity: 'low',
      message: 'User attempting to login',
      details: { email: sanitizedCredentials.email }
    });

    try {
      // Simulate API call - in real app this would be actual API call
      // For demo, we'll accept any email/password combination
      
      // Create mock tokens with dynamic expiration so they remain valid across reloads
      const now = Math.floor(Date.now() / 1000);
      const accessPayload = {
        sub: 'ced14a9-66a0-488b-b333-9e69e5eb8d31',
        email: sanitizedCredentials.email,
        role: 'admin',
        companyId: '9715672a-1a30-424d-8906-0c99b9014017',
        iat: now,
        exp: now + 15 * 60, // 15 minutes
      } as Record<string, any>;

      const mockAccessToken = this.createMockToken(accessPayload);
      const mockRefreshToken = `refresh-${Math.random().toString(36).slice(2)}`;

      const mockResponse: LoginResponse = {
        success: true,
        data: {
          user: {
            id: 'ced14a9-66a0-488b-b333-9e69e5eb8d31',
            email: sanitizedCredentials.email,
            name: 'Administrador Principal',
            role: 'admin' as any,
            companyId: '9715672a-1a30-424d-8906-0c99b9014017',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          company: {
            id: '9715672a-1a30-424d-8906-0c99b9014017',
            name: 'Mi Nueva Tienda POS',
            businessType: 'Retail',
            nit: '123456789-0',
            address: 'Calle Principal 123',
            phone: '+57 300 123 4567',
            email: sanitizedCredentials.email,
            plan: 'BASIC' as any,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          expiresIn: 900, // 15 minutes
        },
        message: 'Inicio de sesión exitoso'
      };

      // Store tokens
      this.setTokens(mockAccessToken, mockRefreshToken);

      // Reset rate limit on successful login
      RateLimitService.resetRateLimit(rateLimitKey);

      // Extend session
      SessionSecurityService.extendSession();

      SecurityLogger.log({
        type: 'login_success',
        severity: 'low',
        message: 'User successfully logged in',
        details: { 
          email: sanitizedCredentials.email,
          userId: mockResponse.data.user.id
        }
      });

      return mockResponse;
    } catch (error: any) {
      SecurityLogger.log({
        type: 'login_failure',
        severity: 'medium',
        message: 'Login attempt failed',
        details: { 
          email: sanitizedCredentials.email,
          error: error.message
        }
      });

      // Increment backoff on failed login
      RateLimitService.incrementBackoff(rateLimitKey);

      throw this.handleError(error);
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    SecurityLogger.log({
      type: 'logout',
      severity: 'low',
      message: 'User logging out',
    });

    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Continue with logout even if server request fails
      console.error('Error during server logout:', error);
    } finally {
      this.clearTokens();
      CSRFService.removeCSRFToken();
      SessionSecurityService.destroySession();
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response: AxiosResponse<RefreshTokenResponse> = await axios.post(
        `${this.baseURL}/auth/refresh`,
        { refreshToken }
      );

      if (response.data.success) {
        const { accessToken } = response.data.data;
        this.setAccessToken(accessToken);
        return accessToken;
      }

      throw new Error('Failed to refresh token');
    } catch (error: any) {
      this.clearTokens();
      throw this.handleError(error);
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.api.get('/auth/verify');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
      return response.data.data!;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Password management
  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async resetPassword(data: PasswordReset): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Token management
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private setAccessToken(accessToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Token validation
  isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Create a simple mock JWT for demo purposes (NOT secure)
  private createMockToken(payload: Record<string, any>): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encode = (obj: Record<string, any>) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const headerB64 = encode(header);
    const payloadB64 = encode(payload);
    const signature = 'signature'; // placeholder

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  // Expose a helper to get the token payload (safe for demo)
  getPayloadFromToken(token: string): JWTPayload | null {
    try {
      return this.decodeToken(token);
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string): JWTPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  getTokenExpiration(token: string): Date | null {
    try {
      const payload = this.decodeToken(token);
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token ? this.isTokenValid(token) : false;
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }

    return new Error('An unexpected error occurred');
  }

  // Rate limiting helper
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