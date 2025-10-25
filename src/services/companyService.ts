import axios from 'axios';
import type {
  Company,
  CompanySettings,
  PaymentMethod,
  CreateCompanyData,
  UpdateCompanyData,
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
  CompanyStats,
  CompanyFilters,
  PaymentMethodFilters,
  PaginationParams,
  PaginatedResponse,
  BusinessHours
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const companyService = {
  // Company CRUD operations
  async getCompany(): Promise<Company> {
    const response = await api.get('/company');
    return response.data.data;
  },

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    const response = await api.post('/company', companyData);
    return response.data.data;
  },

  async updateCompany(companyData: UpdateCompanyData): Promise<Company> {
    const response = await api.put('/company', companyData);
    return response.data.data;
  },

  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post('/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async deleteLogo(): Promise<void> {
    await api.delete('/company/logo');
  },

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings> {
    const response = await api.get('/company/settings');
    return response.data.data;
  },

  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const response = await api.put('/company/settings', settings);
    return response.data.data;
  },

  async updateBusinessHours(businessHours: Record<string, BusinessHours>): Promise<CompanySettings> {
    const response = await api.put('/company/settings/business-hours', {
      business_hours: businessHours
    });
    return response.data.data;
  },

  async updateNotificationPreferences(preferences: CompanySettings['notification_preferences']): Promise<CompanySettings> {
    const response = await api.put('/company/settings/notifications', {
      notification_preferences: preferences
    });
    return response.data.data;
  },

  // Payment Methods CRUD
  async getPaymentMethods(filters?: PaymentMethodFilters & PaginationParams): Promise<PaginatedResponse<PaymentMethod>> {
    const response = await api.get('/company/payment-methods', {
      params: filters,
    });
    return response.data;
  },

  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    const response = await api.get(`/company/payment-methods/${id}`);
    return response.data.data;
  },

  async createPaymentMethod(paymentMethodData: CreatePaymentMethodData): Promise<PaymentMethod> {
    const response = await api.post('/company/payment-methods', paymentMethodData);
    return response.data.data;
  },

  async updatePaymentMethod(id: string, paymentMethodData: UpdatePaymentMethodData): Promise<PaymentMethod> {
    const response = await api.put(`/company/payment-methods/${id}`, paymentMethodData);
    return response.data.data;
  },

  async deletePaymentMethod(id: string): Promise<void> {
    await api.delete(`/company/payment-methods/${id}`);
  },

  async togglePaymentMethodStatus(id: string, isActive: boolean): Promise<PaymentMethod> {
    const response = await api.patch(`/company/payment-methods/${id}/status`, {
      is_active: isActive
    });
    return response.data.data;
  },

  // Payment Method bulk operations
  async bulkUpdatePaymentMethods(
    paymentMethodIds: string[],
    updateData: {
      is_active?: boolean;
      commission_rate?: number;
    }
  ): Promise<PaymentMethod[]> {
    const response = await api.patch('/company/payment-methods/bulk-update', {
      payment_method_ids: paymentMethodIds,
      ...updateData,
    });
    return response.data.data;
  },

  async bulkDeletePaymentMethods(paymentMethodIds: string[]): Promise<void> {
    await api.delete('/company/payment-methods/bulk-delete', {
      data: { payment_method_ids: paymentMethodIds },
    });
  },

  // Company Statistics
  async getCompanyStats(): Promise<CompanyStats> {
    const response = await api.get('/company/stats');
    return response.data.data;
  },

  async getPaymentMethodStats(
    filters?: {
      date_from?: string;
      date_to?: string;
      payment_method_id?: string;
    }
  ): Promise<{
    total_transactions: number;
    total_amount: number;
    avg_transaction_value: number;
    transactions_by_day: Array<{
      date: string;
      count: number;
      total_amount: number;
    }>;
    top_payment_methods: Array<{
      payment_method: PaymentMethod;
      count: number;
      total_amount: number;
      percentage: number;
    }>;
  }> {
    const response = await api.get('/company/payment-methods/stats', {
      params: filters,
    });
    return response.data.data;
  },

  // Search and filters
  async searchPaymentMethods(query: string, filters?: {
    type?: string;
    is_active?: boolean;
    limit?: number;
  }): Promise<PaymentMethod[]> {
    const response = await api.get('/company/payment-methods/search', {
      params: { q: query, ...filters },
    });
    return response.data.data;
  },

  async getPaymentMethodsByType(type: PaymentMethod['type']): Promise<PaymentMethod[]> {
    const response = await api.get(`/company/payment-methods/type/${type}`);
    return response.data.data;
  },

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/company/payment-methods/active');
    return response.data.data;
  },

  // Company validation
  async validateNIT(nit: string): Promise<{
    is_valid: boolean;
    company_name?: string;
    message?: string;
  }> {
    const response = await api.post('/company/validate-nit', { nit });
    return response.data.data;
  },

  async checkCompanyExists(): Promise<{ exists: boolean }> {
    const response = await api.get('/company/exists');
    return response.data.data;
  },

  // Export functionality
  async exportCompanyData(): Promise<Blob> {
    const response = await api.get('/company/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportPaymentMethods(filters?: PaymentMethodFilters): Promise<Blob> {
    const response = await api.get('/company/payment-methods/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  // Import functionality
  async importPaymentMethods(file: File): Promise<{
    success: number;
    errors: Array<{
      row: number;
      errors: string[];
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/company/payment-methods/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Backup and restore
  async createBackup(): Promise<{
    backup_id: string;
    filename: string;
    size: number;
    created_at: string;
  }> {
    const response = await api.post('/company/backup');
    return response.data.data;
  },

  async getBackups(): Promise<Array<{
    id: string;
    filename: string;
    size: number;
    type: 'manual' | 'automatic';
    created_at: string;
  }>> {
    const response = await api.get('/company/backups');
    return response.data.data;
  },

  async downloadBackup(backupId: string): Promise<Blob> {
    const response = await api.get(`/company/backups/${backupId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteBackup(backupId: string): Promise<void> {
    await api.delete(`/company/backups/${backupId}`);
  },

  async restoreBackup(backupId: string): Promise<void> {
    await api.post(`/company/backups/${backupId}/restore`);
  },

  // Integration utilities
  async testPaymentMethodIntegration(paymentMethodId: string): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, any>;
  }> {
    const response = await api.post(`/company/payment-methods/${paymentMethodId}/test`);
    return response.data.data;
  },

  async syncPaymentMethodData(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await api.post(`/company/payment-methods/${paymentMethodId}/sync`);
    return response.data.data;
  },

  // Company onboarding
  async completeOnboarding(data: {
    company: CreateCompanyData;
    settings: Partial<CompanySettings>;
    payment_methods: CreatePaymentMethodData[];
  }): Promise<{
    company: Company;
    settings: CompanySettings;
    payment_methods: PaymentMethod[];
  }> {
    const response = await api.post('/company/onboarding', data);
    return response.data.data;
  },

  async getOnboardingStatus(): Promise<{
    is_completed: boolean;
    completed_steps: string[];
    pending_steps: string[];
    progress_percentage: number;
  }> {
    const response = await api.get('/company/onboarding/status');
    return response.data.data;
  },

  // Tax and fiscal utilities
  async calculateTax(amount: number, taxType?: string): Promise<{
    base_amount: number;
    tax_amount: number;
    total_amount: number;
    tax_rate: number;
    tax_details: Record<string, any>;
  }> {
    const response = await api.post('/company/calculate-tax', {
      amount,
      tax_type: taxType
    });
    return response.data.data;
  },

  async getFiscalInformation(): Promise<{
    tax_year: number;
    tax_period: string;
    fiscal_responsibilities: string[];
    tax_regime: string;
    resolution_number?: string;
    resolution_date?: string;
    consecutive_numbering: {
      current: number;
      authorized_from: number;
      authorized_to: number;
    };
  }> {
    const response = await api.get('/company/fiscal-info');
    return response.data.data;
  },

  async updateFiscalInformation(fiscalData: {
    resolution_number?: string;
    resolution_date?: string;
    authorized_from?: number;
    authorized_to?: number;
    fiscal_responsibilities?: string[];
  }): Promise<void> {
    await api.put('/company/fiscal-info', fiscalData);
  }
};

export default companyService;
