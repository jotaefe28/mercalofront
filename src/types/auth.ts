export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  businessType: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  plan: PlanType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  // User data
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Company data
  companyName: string;
  businessType: string;
  nit: string;
  address: string;
  phone: string;
  companyEmail: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    company: Company;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: number;
  };
  message: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: AuthError[];
}

export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  VIEWER: 'viewer'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const PlanType = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

export type PlanType = typeof PlanType[keyof typeof PlanType];

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// JWT Token payload interface
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  companyId: string;
  iat: number;
  exp: number;
}