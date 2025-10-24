import type { 
  Client, 
  CreateClientData, 
  UpdateClientData,
  ClientFilters,
  ClientStats,
  ClientPurchaseHistory,
  ClientPointsTransaction,
  PaginatedResponse
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ClientService {
  private getRequestOptions(): RequestInit {
    return {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // CRUD Operations
  async createClient(clientData: CreateClientData): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        ...this.getRequestOptions(),
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al crear el cliente');
    }
  }

  async getClients(
    page = 1, 
    limit = 10, 
    filters?: ClientFilters
  ): Promise<PaginatedResponse<Client>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Add filters to params
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/clients?${params}`, {
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
      console.error('Error fetching clients:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener los clientes');
    }
  }

  async getClientById(id: string): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
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
      console.error('Error fetching client:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener el cliente');
    }
  }

  async updateClient(id: string, clientData: UpdateClientData): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'PUT',
        ...this.getRequestOptions(),
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al actualizar el cliente');
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'DELETE',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al eliminar el cliente');
    }
  }

  // Statistics and Analytics
  async getClientStats(): Promise<ClientStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/stats`, {
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
      console.error('Error fetching client stats:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener estadísticas de clientes');
    }
  }

  // Purchase History
  async getClientPurchaseHistory(
    clientId: string, 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<ClientPurchaseHistory>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(
        `${API_BASE_URL}/api/clients/${clientId}/purchases?${params}`, 
        {
          method: 'GET',
          ...this.getRequestOptions()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching client purchase history:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener historial de compras');
    }
  }

  // Points Management
  async getClientPointsHistory(
    clientId: string, 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<ClientPointsTransaction>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(
        `${API_BASE_URL}/api/clients/${clientId}/points?${params}`, 
        {
          method: 'GET',
          ...this.getRequestOptions()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching client points history:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener historial de puntos');
    }
  }

  async adjustClientPoints(
    clientId: string, 
    points: number, 
    description: string
  ): Promise<ClientPointsTransaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/points/adjust`, {
        method: 'POST',
        ...this.getRequestOptions(),
        body: JSON.stringify({ points, description })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adjusting client points:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al ajustar puntos del cliente');
    }
  }

  // Search and Validation
  async searchClients(query: string, limit = 10): Promise<Client[]> {
    try {
      const params = new URLSearchParams({
        search: query,
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/api/clients/search?${params}`, {
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
      console.error('Error searching clients:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al buscar clientes');
    }
  }

  async validateDocument(documentType: string, documentNumber: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/validate-document`, {
        method: 'POST',
        ...this.getRequestOptions(),
        body: JSON.stringify({ document_type: documentType, document_number: documentNumber })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('Error validating document:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al validar documento');
    }
  }

  // Export functionality
  async exportClients(filters?: ClientFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/clients/export?${params}`, {
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
      console.error('Error exporting clients:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al exportar clientes');
    }
  }
}

export const clientService = new ClientService();
