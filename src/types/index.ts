export * from './auth';
export * from './pos';

// Client types
export interface Client {
  id: string;
  document_type: 'cedula' | 'nit' | 'pasaporte' | 'cedula_extranjeria';
  document_number: string;
  name: string;
  last_name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  department?: string;
  birth_date?: string;
  points: number;
  total_purchases: number;
  total_spent: number;
  last_purchase?: string;
  status: 'active' | 'inactive' | 'blocked';
  preferred_payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  document_type: 'cedula' | 'nit' | 'pasaporte' | 'cedula_extranjeria';
  document_number: string;
  name: string;
  last_name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  department?: string;
  birth_date?: string;
  notes?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: 'active' | 'inactive' | 'blocked';
  preferred_payment_method?: string;
}

export interface ClientFilters {
  search?: string;
  document_type?: string;
  status?: string;
  city?: string;
  has_email?: boolean;
  min_purchases?: number;
  max_purchases?: number;
  min_spent?: number;
  max_spent?: number;
}

export interface ClientStats {
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  total_points_issued: number;
  avg_purchases_per_client: number;
  top_spending_clients: Array<{
    client: Client;
    total_spent: number;
  }>;
}

export interface ClientPurchaseHistory {
  id: string;
  client_id: string;
  sale_id: string;
  total: number;
  items_count: number;
  payment_method: string;
  points_earned: number;
  points_used: number;
  created_at: string;
}

export interface ClientPointsTransaction {
  id: string;
  client_id: string;
  type: 'earned' | 'used' | 'expired' | 'adjustment';
  points: number;
  description: string;
  sale_id?: string;
  created_at: string;
}

// Points System Configuration
export interface PointsConfig {
  id: string;
  points_per_peso: number; // Puntos ganados por cada peso gastado
  min_purchase_for_points: number; // Mínima compra para ganar puntos
  points_expiry_days: number; // Días hasta que expiren los puntos
  max_points_per_transaction: number; // Máximo de puntos por transacción
  points_value_in_pesos: number; // Valor de cada punto en pesos
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PointsStats {
  total_points_issued: number;
  total_points_redeemed: number;
  total_points_expired: number;
  active_points: number;
  total_clients_with_points: number;
  avg_points_per_client: number;
  points_issued_this_month: number;
  points_redeemed_this_month: number;
  top_earners: Array<{
    client: Client;
    points: number;
  }>;
}

export interface PointsFilters {
  client_id?: string;
  type?: 'earned' | 'used' | 'expired' | 'adjustment';
  date_from?: string;
  date_to?: string;
  min_points?: number;
  max_points?: number;
  sale_id?: string;
}

// API related types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Common UI types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}