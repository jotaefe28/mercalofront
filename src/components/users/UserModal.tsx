import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { userService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  User, 
  UserRole, 
  CreateUserData, 
  UpdateUserData,
  FormState 
} from '../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role_id: string;
  phone: string;
  position: string;
  is_active: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formState, setFormState] = useState<FormState<UserFormData>>({
    data: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role_id: '',
      phone: '',
      position: '',
      is_active: true
    },
    errors: {},
    isSubmitting: false,
    isDirty: false
  });

  const { addNotification } = useNotifications();

  // Load roles and initialize form
  useEffect(() => {
    if (isOpen) {
      loadRoles();
      initializeForm();
    }
  }, [isOpen, user]);

  const loadRoles = async () => {
    try {
      const rolesData = await userService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los roles'
      });
    }
  };

  const initializeForm = () => {
    if (user) {
      // Edit mode
      setFormState({
        data: {
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: '',
          role_id: user.role.id,
          phone: user.phone || '',
          position: user.position || '',
          is_active: user.is_active
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
          email: '',
          password: '',
          confirmPassword: '',
          role_id: '',
          phone: '',
          position: '',
          is_active: true
        },
        errors: {},
        isSubmitting: false,
        isDirty: false
      });
    }
  };

  const updateFormData = (field: keyof UserFormData, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: '' } // Clear field error on change
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const { data } = formState;

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    } else if (data.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Email validation
    if (!data.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Ingrese un email válido';
    }

    // Password validation (only for new users or when changing password)
    if (!user || data.password) {
      if (!data.password) {
        errors.password = 'La contraseña es obligatoria';
      } else if (data.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // Role validation
    if (!data.role_id) {
      errors.role_id = 'Debe seleccionar un rol';
    }

    // Phone validation (optional but format check)
    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      errors.phone = 'Ingrese un número de teléfono válido';
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
      
      if (user) {
        // Update existing user
        const updateData: UpdateUserData = {
          name: data.name,
          email: data.email,
          role_id: data.role_id,
          phone: data.phone || undefined,
          position: data.position || undefined,
          is_active: data.is_active
        };

        // Only include password if it's provided
        if (data.password) {
          updateData.password = data.password;
        }

        await userService.updateUser(user.id, updateData);
        
        addNotification({
          type: 'success',
          title: 'Usuario actualizado',
          message: 'El usuario ha sido actualizado correctamente'
        });
      } else {
        // Create new user
        const createData: CreateUserData = {
          name: data.name,
          email: data.email,
          password: data.password,
          role_id: data.role_id,
          phone: data.phone || undefined,
          position: data.position || undefined,
          is_active: data.is_active
        };

        await userService.createUser(createData);
        
        addNotification({
          type: 'success',
          title: 'Usuario creado',
          message: 'El usuario ha sido creado correctamente'
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      
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
          message: error.response?.data?.message || 'No se pudo guardar el usuario'
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {user ? 'Editar Usuario' : 'Nuevo Usuario'}
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
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <Input
                type="text"
                value={formState.data.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Ingrese el nombre completo"
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formState.data.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="usuario@empresa.com"
                disabled={formState.isSubmitting}
                className={formState.errors.email ? 'border-red-300' : ''}
              />
              {formState.errors.email && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {!user && '*'}
                {user && (
                  <span className="text-sm text-gray-500 font-normal">
                    {' '}(dejar vacío para mantener la actual)
                  </span>
                )}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formState.data.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder={user ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  disabled={formState.isSubmitting}
                  className={formState.errors.password ? 'border-red-300' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formState.errors.password && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            {(!user || formState.data.password) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formState.data.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    placeholder="Confirme la contraseña"
                    disabled={formState.isSubmitting}
                    className={formState.errors.confirmPassword ? 'border-red-300' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formState.errors.confirmPassword && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formState.errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                value={formState.data.role_id}
                onChange={(e) => updateFormData('role_id', e.target.value)}
                disabled={formState.isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formState.errors.role_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione un rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                    {role.description && ` - ${role.description}`}
                  </option>
                ))}
              </select>
              {formState.errors.role_id && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.role_id}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <Input
                type="tel"
                value={formState.data.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+57 300 123 4567"
                disabled={formState.isSubmitting}
                className={formState.errors.phone ? 'border-red-300' : ''}
              />
              {formState.errors.phone && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formState.errors.phone}
                </div>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <Input
                type="text"
                value={formState.data.position}
                onChange={(e) => updateFormData('position', e.target.value)}
                placeholder="Ej: Gerente, Cajero, Vendedor"
                disabled={formState.isSubmitting}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formState.data.is_active}
                onChange={(e) => updateFormData('is_active', e.target.checked)}
                disabled={formState.isSubmitting}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Usuario activo
              </label>
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
                  <span>{user ? 'Actualizar' : 'Crear'} Usuario</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;