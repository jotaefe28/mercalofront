import React, { useState, useEffect } from 'react';
import { X, Save, Shield, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { userService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  UserRole, 
  Permission,
  FormState 
} from '../../types';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole | null;
  onSave: () => void;
}

interface RoleFormData {
  name: string;
  description: string;
  selectedPermissions: string[];
}

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  role,
  onSave
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formState, setFormState] = useState<FormState<RoleFormData>>({
    data: {
      name: '',
      description: '',
      selectedPermissions: []
    },
    errors: {},
    isSubmitting: false,
    isDirty: false
  });

  const { addNotification } = useNotifications();

  // Load permissions and initialize form
  useEffect(() => {
    if (isOpen) {
      loadPermissions();
      initializeForm();
    }
  }, [isOpen, role]);

  const loadPermissions = async () => {
    try {
      const permissionsData = await userService.getPermissions();
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading permissions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los permisos'
      });
    }
  };

  const initializeForm = () => {
    if (role) {
      // Edit mode
      setFormState({
        data: {
          name: role.name,
          description: role.description || '',
          selectedPermissions: role.permissions.map(p => p.id)
        },
        errors: {},
        isSubmitting: false,
        isDirty: false
      });
    } else {
      // Create mode
      setFormState({
        data: {
          name: '',
          description: '',
          selectedPermissions: []
        },
        errors: {},
        isSubmitting: false,
        isDirty: false
      });
    }
  };

  const updateFormData = (field: keyof RoleFormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: '' }
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const { data } = formState;

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'El nombre del rol es obligatorio';
    } else if (data.name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Permissions validation
    if (data.selectedPermissions.length === 0) {
      errors.selectedPermissions = 'Debe seleccionar al menos un permiso';
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));
    setLoading(true);

    try {
      const { data } = formState;
      const roleData = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        permissions: permissions.filter(p => data.selectedPermissions.includes(p.id))
      };

      if (role) {
        // Update existing role
        await userService.updateRole(role.id, roleData);
        addNotification({
          type: 'success',
          title: 'Rol actualizado',
          message: 'El rol ha sido actualizado correctamente'
        });
      } else {
        // Create new role
        await userService.createRole(roleData);
        addNotification({
          type: 'success',
          title: 'Rol creado',
          message: 'El rol ha sido creado correctamente'
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving role:', error);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            serverErrors[field] = messages[0];
          }
        });
        setFormState(prev => ({ ...prev, errors: serverErrors }));
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'No se pudo guardar el rol'
        });
      }
    } finally {
      setLoading(false);
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleClose = () => {
    if (formState.isDirty && !formState.isSubmitting) {
      if (confirm('¿Estás seguro de que deseas cerrar? Los cambios no guardados se perderán.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const togglePermission = (permissionId: string) => {
    const { selectedPermissions } = formState.data;
    const newPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];
    
    updateFormData('selectedPermissions', newPermissions);
  };

  const toggleAllPermissionsForResource = (resource: string) => {
    const resourcePermissions = permissions.filter(p => p.resource === resource);
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    const { selectedPermissions } = formState.data;
    
    const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));
    
    let newPermissions: string[];
    if (allSelected) {
      // Remove all resource permissions
      newPermissions = selectedPermissions.filter(id => !resourcePermissionIds.includes(id));
    } else {
      // Add all resource permissions
      newPermissions = [...new Set([...selectedPermissions, ...resourcePermissionIds])];
    }
    
    updateFormData('selectedPermissions', newPermissions);
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span>{role ? 'Editar Rol' : 'Nuevo Rol'}</span>
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={formState.isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Información del Rol</h4>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del rol *
                </label>
                <Input
                  type="text"
                  value={formState.data.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Ej: Administrador, Vendedor, Cajero"
                  disabled={formState.isSubmitting}
                  className={formState.errors.name ? 'border-red-300' : ''}
                />
                {formState.errors.name && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formState.errors.name}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formState.data.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe las responsabilidades de este rol..."
                  disabled={formState.isSubmitting}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-gray-900">Permisos</h4>
                <div className="text-sm text-gray-600">
                  {formState.data.selectedPermissions.length} de {permissions.length} seleccionados
                </div>
              </div>
              
              {formState.errors.selectedPermissions && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.selectedPermissions}
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
                  const resourcePermissionIds = resourcePermissions.map(p => p.id);
                  const selectedCount = resourcePermissionIds.filter(id => 
                    formState.data.selectedPermissions.includes(id)
                  ).length;
                  const allSelected = selectedCount === resourcePermissionIds.length;
                  const someSelected = selectedCount > 0 && selectedCount < resourcePermissionIds.length;

                  return (
                    <div key={resource} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleAllPermissionsForResource(resource)}
                            className={`relative inline-flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                              allSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : someSelected
                                ? 'bg-blue-100 border-blue-600'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            disabled={formState.isSubmitting}
                          >
                            {allSelected && <Check className="h-3 w-3" />}
                            {someSelected && !allSelected && (
                              <div className="h-2 w-2 bg-blue-600 rounded" />
                            )}
                          </button>
                          <h5 className="font-medium text-gray-900 capitalize">
                            {resource}
                          </h5>
                        </div>
                        <span className="text-sm text-gray-500">
                          {selectedCount}/{resourcePermissionIds.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {resourcePermissions.map((permission) => {
                          const isSelected = formState.data.selectedPermissions.includes(permission.id);
                          
                          return (
                            <button
                              key={permission.id}
                              type="button"
                              onClick={() => togglePermission(permission.id)}
                              disabled={formState.isSubmitting}
                              className={`flex items-center space-x-2 p-2 rounded-md border transition-colors text-left ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`relative inline-flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {permission.action}
                                </div>
                                {permission.description && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {permission.description}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || !formState.isDirty}
              className="flex items-center space-x-2"
            >
              {formState.isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{role ? 'Actualizar' : 'Crear'} Rol</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;