import type { Product, CreateProductData, UpdateProductData, ProductFilters, ProductStats, PaginatedResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class ProductService {
  private getRequestOptions(): RequestInit {
    return {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        ...this.getRequestOptions(),
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al crear el producto');
    }
  }

  async getProducts(
    page = 1, 
    limit = 20, 
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`${API_BASE_URL}/api/products?${params}`, {
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
      console.error('Error fetching products:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener los productos');
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
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
      console.error('Error fetching product:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener el producto');
    }
  }

  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        ...this.getRequestOptions(),
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al actualizar el producto');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        ...this.getRequestOptions()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al eliminar el producto');
    }
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/stock`, {
        method: 'PATCH',
        ...this.getRequestOptions(),
        body: JSON.stringify({ quantity, operation })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating stock:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al actualizar el stock');
    }
  }

  async getProductStats(): Promise<ProductStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/stats`, {
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
      console.error('Error fetching product stats:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener las estadísticas');
    }
  }

  async searchProducts(query: string, limit = 10): Promise<Product[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/api/products/search?${params}`, {
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
      console.error('Error searching products:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al buscar productos');
    }
  }

  async getCategories(): Promise<Array<{ id: string, name: string, count: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/categories`, {
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
      console.error('Error fetching categories:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener las categorías');
    }
  }

  async getSuppliers(): Promise<Array<{ id: string, name: string, count: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/suppliers`, {
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
      console.error('Error fetching suppliers:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al obtener los proveedores');
    }
  }
}

export const productService = new ProductService();
