import type { 
  PointsStats,
  PointsConfig,
  ClientPointsTransaction,
  PointsFilters,
  Client,
  PaginatedResponse
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class PointsService {
  private getRequestOptions(): RequestInit {
    return {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Statistics and Overview
  async getPointsStats(): Promise<PointsStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/stats`, {
        method: 'GET',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching points stats:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener estadísticas de puntos');
    }
  }

  // Points Transactions
  async getPointsTransactions(
    page = 1,
    limit = 10,
    filters?: PointsFilters
  ): Promise<PaginatedResponse<ClientPointsTransaction>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/points/transactions?${params}`, {
        method: 'GET',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching points transactions:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener transacciones de puntos');
    }
  }

  // Client Search and Points Info
  async searchClientByDocument(documentNumber: string): Promise<Client | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/client/search`, {
        method: 'POST',
        ...this.getRequestOptions(),
        body: JSON.stringify({ document: documentNumber })
      });

      if (response.status === 404) {
        return null; // Cliente no encontrado
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching client:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al buscar cliente');
    }
  }

  async getClientPointsBalance(clientId: string): Promise<{
    current_points: number;
    points_to_expire: number;
    expiry_date?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/client/${clientId}/balance`, {
        method: 'GET',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching client points balance:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener balance de puntos');
    }
  }

  // Points Configuration
  async getPointsConfig(): Promise<PointsConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/config`, {
        method: 'GET',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching points config:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener configuración de puntos');
    }
  }

  async updatePointsConfig(config: Partial<PointsConfig>): Promise<PointsConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/config`, {
        method: 'PUT',
        ...this.getRequestOptions(),
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating points config:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al actualizar configuración de puntos');
    }
  }

  // Points Operations
  async redeemPoints(clientId: string, points: number, description: string): Promise<ClientPointsTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/redeem`, {
        method: 'POST',
        ...this.getRequestOptions(),
        body: JSON.stringify({
          client_id: clientId,
          points,
          description
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error redeeming points:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al redimir puntos');
    }
  }

  async expirePoints(clientId: string, points: number, reason: string): Promise<ClientPointsTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/expire`, {
        method: 'POST',
        ...this.getRequestOptions(),
        body: JSON.stringify({
          client_id: clientId,
          points,
          reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error expiring points:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al expirar puntos');
    }
  }

  // Reports and Analytics
  async getPointsReport(dateFrom: string, dateTo: string): Promise<{
    total_issued: number;
    total_redeemed: number;
    total_expired: number;
    net_points: number;
    daily_breakdown: Array<{
      date: string;
      issued: number;
      redeemed: number;
      expired: number;
    }>;
    top_clients: Array<{
      client: Client;
      points_earned: number;
      points_used: number;
      net_points: number;
    }>;
  }> {
    try {
      const params = new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo
      });

      const response = await fetch(`${API_BASE_URL}/api/points/report?${params}`, {
        method: 'GET',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching points report:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener reporte de puntos');
    }
  }

  async exportPointsTransactions(filters?: PointsFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/points/export?${params}`, {
        method: 'GET',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error exporting points transactions:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al exportar transacciones de puntos');
    }
  }

  // Calculate points for a purchase
  calculatePointsForPurchase(amount: number, pointsConfig: PointsConfig): number {
    if (!pointsConfig.is_active || amount < pointsConfig.min_purchase_for_points) {
      return 0;
    }

    const calculatedPoints = Math.floor(amount * pointsConfig.points_per_peso);
    return Math.min(calculatedPoints, pointsConfig.max_points_per_transaction);
  }

  // Calculate peso value of points
  calculatePointsValue(points: number, pointsConfig: PointsConfig): number {
    return points * pointsConfig.points_value_in_pesos;
  }
}

export const pointsService = new PointsService();
