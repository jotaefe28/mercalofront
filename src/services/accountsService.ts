import axios from 'axios';
import type { 
  AccountReceivable,
  AccountReceivableResponse,
  AccountReceivableFilters,
  AccountReceivableStats,
  CreateAccountReceivableData,
  UpdateAccountReceivableData,
  CreateAccountPaymentData,
  AccountPayment,
  InvoiceDetail
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookie-based authentication
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add any additional headers or auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const accountsService = {
  // =======================================
  // ACCOUNTS RECEIVABLE OPERATIONS
  // =======================================

  /**
   * Get all accounts receivable with filters and pagination
   */
  async getAccountsReceivable(filters?: AccountReceivableFilters, page = 1, perPage = 20): Promise<AccountReceivableResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    return api.get(`/accounts-receivable?${params.toString()}`);
  },

  /**
   * Get a specific account receivable by ID
   */
  async getAccountReceivable(id: string): Promise<AccountReceivable> {
    return api.get(`/accounts-receivable/${id}`);
  },

  /**
   * Create a new account receivable
   */
  async createAccountReceivable(data: CreateAccountReceivableData): Promise<AccountReceivable> {
    return api.post('/accounts-receivable', data);
  },

  /**
   * Update an existing account receivable
   */
  async updateAccountReceivable(id: string, data: UpdateAccountReceivableData): Promise<AccountReceivable> {
    return api.put(`/accounts-receivable/${id}`, data);
  },

  /**
   * Delete an account receivable
   */
  async deleteAccountReceivable(id: string): Promise<void> {
    return api.delete(`/accounts-receivable/${id}`);
  },

  /**
   * Mark account as paid
   */
  async markAccountAsPaid(id: string, paymentData: CreateAccountPaymentData): Promise<AccountReceivable> {
    return api.post(`/accounts-receivable/${id}/mark-paid`, paymentData);
  },

  /**
   * Cancel an account receivable
   */
  async cancelAccountReceivable(id: string, reason?: string): Promise<AccountReceivable> {
    return api.post(`/accounts-receivable/${id}/cancel`, { reason });
  },

  // =======================================
  // PAYMENTS OPERATIONS
  // =======================================

  /**
   * Get payments for a specific account
   */
  async getAccountPayments(accountId: string): Promise<AccountPayment[]> {
    return api.get(`/accounts-receivable/${accountId}/payments`);
  },

  /**
   * Create a new payment for an account
   */
  async createAccountPayment(data: CreateAccountPaymentData): Promise<AccountPayment> {
    const formData = new FormData();
    
    // Add all payment data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return api.post('/account-payments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update a payment
   */
  async updateAccountPayment(id: string, data: Partial<CreateAccountPaymentData>): Promise<AccountPayment> {
    return api.put(`/account-payments/${id}`, data);
  },

  /**
   * Delete a payment
   */
  async deleteAccountPayment(id: string): Promise<void> {
    return api.delete(`/account-payments/${id}`);
  },

  /**
   * Cancel a payment
   */
  async cancelAccountPayment(id: string, reason?: string): Promise<AccountPayment> {
    return api.post(`/account-payments/${id}/cancel`, { reason });
  },

  // =======================================
  // INVOICE OPERATIONS
  // =======================================

  /**
   * Get invoice details for an account
   */
  async getInvoiceDetail(invoiceId: string): Promise<InvoiceDetail> {
    return api.get(`/invoices/${invoiceId}`);
  },

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(invoiceId: string): Promise<Blob> {
    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Send invoice by email
   */
  async sendInvoiceEmail(invoiceId: string, email: string, message?: string): Promise<void> {
    return api.post(`/invoices/${invoiceId}/send-email`, {
      email,
      message
    });
  },

  // =======================================
  // STATISTICS AND REPORTS
  // =======================================

  /**
   * Get accounts receivable statistics
   */
  async getAccountsStats(filters?: AccountReceivableFilters): Promise<AccountReceivableStats> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return api.get(`/accounts-receivable/stats?${params.toString()}`);
  },

  /**
   * Get aging report
   */
  async getAgingReport(filters?: AccountReceivableFilters): Promise<{
    current: AccountReceivable[];
    days_31_60: AccountReceivable[];
    days_61_90: AccountReceivable[];
    days_91_120: AccountReceivable[];
    over_120_days: AccountReceivable[];
  }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return api.get(`/accounts-receivable/aging-report?${params.toString()}`);
  },

  /**
   * Export accounts receivable to Excel
   */
  async exportAccountsToExcel(filters?: AccountReceivableFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/accounts-receivable/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // =======================================
  // UTILITY FUNCTIONS
  // =======================================

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number, pendingAmount: number): {
    isValid: boolean;
    error?: string;
  } {
    if (amount <= 0) {
      return {
        isValid: false,
        error: 'El monto debe ser mayor a 0'
      };
    }

    if (amount > pendingAmount) {
      return {
        isValid: false,
        error: 'El monto no puede ser mayor al saldo pendiente'
      };
    }

    return { isValid: true };
  },

  /**
   * Calculate overdue days
   */
  calculateOverdueDays(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Get status color
   */
  getStatusColor(status: AccountReceivable['status']): string {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      partial: 'text-blue-600 bg-blue-50 border-blue-200',
      paid: 'text-green-600 bg-green-50 border-green-200',
      overdue: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || colors.pending;
  },

  /**
   * Get status label
   */
  getStatusLabel(status: AccountReceivable['status']): string {
    const labels = {
      pending: 'Pendiente',
      partial: 'Pago Parcial',
      paid: 'Pagado',
      overdue: 'Vencido',
      cancelled: 'Cancelado'
    };
    return labels[status] || 'Desconocido';
  },

  /**
   * Build date filter for common periods
   */
  buildDateFilter(period: string, year?: number, month?: number, day?: number): Partial<AccountReceivableFilters> {
    const today = new Date();
    const filters: Partial<AccountReceivableFilters> = {};

    switch (period) {
      case 'today':
        filters.date_from = today.toISOString().split('T')[0];
        filters.date_to = today.toISOString().split('T')[0];
        break;
      
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filters.date_from = yesterday.toISOString().split('T')[0];
        filters.date_to = yesterday.toISOString().split('T')[0];
        break;
      
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        filters.date_from = startOfWeek.toISOString().split('T')[0];
        filters.date_to = today.toISOString().split('T')[0];
        break;
      
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        filters.date_from = startOfMonth.toISOString().split('T')[0];
        filters.date_to = today.toISOString().split('T')[0];
        break;
      
      case 'this_year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        filters.date_from = startOfYear.toISOString().split('T')[0];
        filters.date_to = today.toISOString().split('T')[0];
        break;
      
      case 'custom':
        if (year) {
          if (month && day) {
            // Specific day
            const specificDate = new Date(year, month - 1, day);
            filters.date_from = specificDate.toISOString().split('T')[0];
            filters.date_to = specificDate.toISOString().split('T')[0];
          } else if (month) {
            // Specific month
            const startOfCustomMonth = new Date(year, month - 1, 1);
            const endOfCustomMonth = new Date(year, month, 0);
            filters.date_from = startOfCustomMonth.toISOString().split('T')[0];
            filters.date_to = endOfCustomMonth.toISOString().split('T')[0];
          } else {
            // Specific year
            const startOfCustomYear = new Date(year, 0, 1);
            const endOfCustomYear = new Date(year, 11, 31);
            filters.date_from = startOfCustomYear.toISOString().split('T')[0];
            filters.date_to = endOfCustomYear.toISOString().split('T')[0];
          }
        }
        break;
    }

    return filters;
  }
};