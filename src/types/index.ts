export * from './auth';
export * from './pos';

// Client types
export interface Client {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone: string;
  document: string;
  address?: string;
  city?: string;
  birth_date?: string;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone: string;
  document: string;
  address?: string;
  city?: string;
  birth_date?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  is_active?: boolean;
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

// User Management Types
export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role_id: string;
  phone?: string;
  position?: string;
  is_active?: boolean;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
  password?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
  created_from?: string;
  created_to?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  roles_count: number;
  recent_users: number;
  users_by_role: Array<{
    role: string;
    count: number;
  }>;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
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

// Company Management Types
export interface Company {
  id: string;
  name: string;
  legal_name: string;
  nit: string;
  document_type: 'nit' | 'cedula' | 'passport';
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  tax_regime: 'simplified' | 'common' | 'special';
  industry: string;
  description?: string;
  is_active: boolean;
  settings: CompanySettings;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: string;
  company_id: string;
  currency: string;
  tax_rate: number;
  timezone: string;
  date_format: string;
  decimal_places: number;
  receipt_template: 'simple' | 'detailed' | 'custom';
  auto_backup: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  language: 'es' | 'en';
  notification_preferences: {
    email_notifications: boolean;
    sms_notifications: boolean;
    low_stock_alerts: boolean;
    daily_reports: boolean;
    weekly_reports: boolean;
    monthly_reports: boolean;
  };
  business_hours: {
    monday: BusinessHours;
    tuesday: BusinessHours;
    wednesday: BusinessHours;
    thursday: BusinessHours;
    friday: BusinessHours;
    saturday: BusinessHours;
    sunday: BusinessHours;
  };
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  break_start?: string;
  break_end?: string;
}

export interface PaymentMethod {
  id: string;
  company_id: string;
  name: string;
  type: 'cash' | 'card' | 'transfer' | 'digital_wallet' | 'check' | 'credit' | 'other';
  description?: string;
  is_active: boolean;
  requires_reference: boolean;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  minimum_amount?: number;
  maximum_amount?: number;
  settings: PaymentMethodSettings;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodSettings {
  card_types?: ('visa' | 'mastercard' | 'amex' | 'dinners' | 'discover')[];
  bank_accounts?: BankAccount[];
  digital_wallet_info?: {
    wallet_type: 'nequi' | 'daviplata' | 'bancolombia' | 'other';
    account_number?: string;
    qr_code?: string;
  };
  requires_approval?: boolean;
  auto_reconciliation?: boolean;
  integration_config?: Record<string, any>;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_type: 'checking' | 'savings';
  account_number: string;
  account_holder: string;
  is_primary: boolean;
}

export interface CreateCompanyData {
  name: string;
  legal_name: string;
  nit: string;
  document_type: 'nit' | 'cedula' | 'passport';
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  phone: string;
  email: string;
  website?: string;
  tax_regime: 'simplified' | 'common' | 'special';
  industry: string;
  description?: string;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  is_active?: boolean;
  logo_url?: string;
}

export interface CreatePaymentMethodData {
  name: string;
  type: 'cash' | 'card' | 'transfer' | 'digital_wallet' | 'check' | 'credit' | 'other';
  description?: string;
  is_active?: boolean;
  requires_reference?: boolean;
  commission_rate?: number;
  commission_type?: 'percentage' | 'fixed';
  minimum_amount?: number;
  maximum_amount?: number;
  settings?: Partial<PaymentMethodSettings>;
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {}

export interface CompanyStats {
  total_sales_today: number;
  total_sales_month: number;
  total_sales_year: number;
  active_payment_methods: number;
  total_transactions: number;
  avg_transaction_value: number;
  top_payment_methods: Array<{
    payment_method: PaymentMethod;
    usage_count: number;
    total_amount: number;
  }>;
  sales_by_payment_method: Array<{
    payment_method_id: string;
    payment_method_name: string;
    count: number;
    total_amount: number;
    percentage: number;
  }>;
}

export interface CompanyFilters {
  search?: string;
  tax_regime?: string;
  industry?: string;
  is_active?: boolean;
}

export interface PaymentMethodFilters {
  search?: string;
  type?: string;
  is_active?: boolean;
  requires_reference?: boolean;
}

// =======================================
// ACCOUNTS RECEIVABLE TYPES
// =======================================

export interface AccountReceivable {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  client_document: string;
  client_email?: string;
  client_phone?: string;
  sale_id: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  updated_at: string;
  payment_terms: string; // "30 días", "60 días", etc.
  notes?: string;
  credit_limit?: number;
  days_overdue?: number;
  // Invoice details
  invoice_details: InvoiceDetail;
  // Payment history
  payments: AccountPayment[];
  // Available payment methods for this account
  available_payment_methods: PaymentMethod[];
}

export interface InvoiceDetail {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  items: InvoiceItem[];
  seller_info: {
    name: string;
    document: string;
    address: string;
  };
  buyer_info: {
    name: string;
    document: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  payment_terms: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  subtotal: number;
  total: number;
}

export interface AccountPayment {
  id: string;
  account_id: string;
  payment_method_id: string;
  payment_method_name: string;
  amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  created_by: string;
  created_at: string;
  proof_of_payment?: string; // URL to uploaded file
}

export interface CreateAccountReceivableData {
  client_id: string;
  sale_id: string;
  total_amount: number;
  due_date: string;
  payment_terms: string;
  notes?: string;
  credit_limit?: number;
}

export interface UpdateAccountReceivableData {
  due_date?: string;
  payment_terms?: string;
  notes?: string;
  credit_limit?: number;
  status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
}

export interface CreateAccountPaymentData {
  account_id: string;
  payment_method_id: string;
  amount: number;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  proof_of_payment?: File;
}

export interface AccountReceivableFilters {
  search?: string; // Search by client name, invoice number, or document
  status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'all';
  client_id?: string;
  date_from?: string;
  date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  amount_min?: number;
  amount_max?: number;
  payment_terms?: string;
  is_overdue?: boolean;
  // Date filters
  period?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
  year?: number;
  month?: number;
  day?: number;
}

export interface AccountReceivableStats {
  total_accounts: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  average_days_to_pay: number;
  accounts_by_status: {
    pending: number;
    partial: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  amounts_by_status: {
    pending: number;
    partial: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  top_clients: {
    client_id: string;
    client_name: string;
    total_amount: number;
    accounts_count: number;
  }[];
  aging_report: {
    current: number; // 0-30 days
    days_31_60: number;
    days_61_90: number;
    days_91_120: number;
    over_120_days: number;
  };
}

export interface AccountReceivableResponse {
  data: AccountReceivable[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  summary: {
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    overdue_amount: number;
  };
}