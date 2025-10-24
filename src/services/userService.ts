import axios from 'axios';
import type {
  User,
  UserRole,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserStats,
  UserActivity,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  Permission,
  ChangePasswordData
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  // User CRUD operations
  async getUsers(filters?: UserFilters & PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await api.get('/api/users', {
      params: filters,
    });
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/api/users/${id}`);
    return response.data.data;
  },

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await api.post('/api/users', userData);
    return response.data.data;
  },

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await api.patch(
      `/api/users/${id}/status`,
      { is_active: isActive }
    );
    return response.data.data;
  },

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await api.patch(
      `/api/users/${id}/reset-password`,
      { password: newPassword }
    );
  },

  async changeUserPassword(id: string, passwordData: ChangePasswordData): Promise<void> {
    await api.patch(
      `/api/users/${id}/change-password`,
      passwordData
    );
  },

  // Role management
  async getRoles(): Promise<UserRole[]> {
    const response = await api.get('/api/roles');
    return response.data.data;
  },

  async getRoleById(id: string): Promise<UserRole> {
    const response = await api.get(`/api/roles/${id}`);
    return response.data.data;
  },

  async createRole(roleData: Omit<UserRole, 'id' | 'created_at' | 'updated_at'>): Promise<UserRole> {
    const response = await api.post('/api/roles', roleData);
    return response.data.data;
  },

  async updateRole(id: string, roleData: Partial<Omit<UserRole, 'id' | 'created_at' | 'updated_at'>>): Promise<UserRole> {
    const response = await api.put(`/api/roles/${id}`, roleData);
    return response.data.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/api/roles/${id}`);
  },

  async assignRole(userId: string, roleId: string): Promise<User> {
    const response = await api.patch(
      `/api/users/${userId}/role`,
      { role_id: roleId }
    );
    return response.data.data;
  },

  // Permission management
  async getPermissions(): Promise<Permission[]> {
    const response = await api.get('/api/permissions');
    return response.data.data;
  },

  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    const response = await api.get(`/api/permissions/resource/${resource}`);
    return response.data.data;
  },

  async createPermission(permissionData: Omit<Permission, 'id'>): Promise<Permission> {
    const response = await api.post('/api/permissions', permissionData);
    return response.data.data;
  },

  async updatePermission(id: string, permissionData: Partial<Omit<Permission, 'id'>>): Promise<Permission> {
    const response = await api.put(`/api/permissions/${id}`, permissionData);
    return response.data.data;
  },

  async deletePermission(id: string): Promise<void> {
    await api.delete(`/api/permissions/${id}`);
  },

  async addPermissionToRole(roleId: string, permissionId: string): Promise<UserRole> {
    const response = await api.post(
      `/api/roles/${roleId}/permissions`,
      { permission_id: permissionId }
    );
    return response.data.data;
  },

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<UserRole> {
    const response = await api.delete(
      `/api/roles/${roleId}/permissions/${permissionId}`
    );
    return response.data.data;
  },

  // User statistics and analytics
  async getUserStats(): Promise<UserStats> {
    const response = await api.get('/api/users/stats');
    return response.data.data;
  },

  async getUserActivity(
    userId?: string,
    filters?: {
      date_from?: string;
      date_to?: string;
      action?: string;
      limit?: number;
    }
  ): Promise<UserActivity[]> {
    const params = userId ? { user_id: userId, ...filters } : filters;
    const response = await api.get('/api/users/activity', {
      params,
    });
    return response.data.data;
  },

  // Bulk operations
  async bulkUpdateUsers(
    userIds: string[],
    updateData: {
      is_active?: boolean;
      role_id?: string;
    }
  ): Promise<User[]> {
    const response = await api.patch(
      '/api/users/bulk-update',
      {
        user_ids: userIds,
        ...updateData,
      }
    );
    return response.data.data;
  },

  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    await api.delete('/api/users/bulk-delete', {
      data: { user_ids: userIds },
    });
  },

  // User profile management
  async updateProfile(userData: {
    name?: string;
    phone?: string;
    position?: string;
  }): Promise<User> {
    const response = await api.put('/api/users/profile', userData);
    return response.data.data;
  },

  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    await api.patch('/api/users/change-password', passwordData);
  },

  // Search and filters
  async searchUsers(query: string, filters?: {
    role?: string;
    is_active?: boolean;
    limit?: number;
  }): Promise<User[]> {
    const response = await api.get('/api/users/search', {
      params: { q: query, ...filters },
    });
    return response.data.data;
  },

  async getUsersByRole(roleId: string): Promise<User[]> {
    const response = await api.get(`/api/roles/${roleId}/users`);
    return response.data.data;
  },

  // User session management
  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    user_id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current: boolean;
    created_at: string;
  }>> {
    const response = await api.get(`/api/users/${userId}/sessions`);
    return response.data.data;
  },

  async revokeUserSession(userId: string, sessionId: string): Promise<void> {
    await api.delete(`/api/users/${userId}/sessions/${sessionId}`);
  },

  async revokeAllUserSessions(userId: string): Promise<void> {
    await api.delete(`/api/users/${userId}/sessions`);
  },

  // Export functionality
  async exportUsers(filters?: UserFilters): Promise<Blob> {
    const response = await api.get('/api/users/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  // User import (for bulk operations)
  async importUsers(file: File): Promise<{
    success: number;
    errors: Array<{
      row: number;
      errors: string[];
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Permission checking utilities
  async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const response = await api.get(`/api/users/${userId}/permissions/check`, {
      params: { resource, action },
    });
    return response.data.data.hasPermission;
  },

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const response = await api.get(`/api/users/${userId}/permissions`);
    return response.data.data;
  },
};

export default userService;