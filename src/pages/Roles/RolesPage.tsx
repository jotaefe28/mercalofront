import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Key,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { RoleModal } from '../../components/roles';
import { userService } from '../../services';
import { useNotifications } from '../../hooks';
import type { UserRole, Permission } from '../../types';

interface RolesPageProps {}

const RolesPage: React.FC<RolesPageProps> = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        userService.getRoles(),
        userService.getPermissions()
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading roles data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar la información de roles'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return;
    
    try {
      await userService.deleteRole(roleId);
      addNotification({
        type: 'success',
        title: 'Rol eliminado',
        message: 'El rol ha sido eliminado correctamente'
      });
      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el rol'
      });
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600">Administra roles y permisos del sistema</p>
        </div>
        <Button 
          onClick={() => setShowRoleModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Rol</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Roles Grid */}
          <div className="grid gap-4">
            {filteredRoles.map((role) => (
              <Card 
                key={role.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedRole?.id === role.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {role.name}
                      </h3>
                      {role.description && (
                        <p className="text-sm text-gray-600">
                          {role.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Key className="h-4 w-4" />
                          <span>{role.permissions.length} permisos</span>
                        </div>
                        <span>•</span>
                        <span>Creado {new Date(role.created_at).toLocaleDateString('es-CO')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRole(role);
                        setShowRoleModal(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredRoles.length === 0 && (
            <Card className="p-8">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay roles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'No se encontraron roles con el término de búsqueda.'
                    : 'Comienza creando tu primer rol.'
                  }
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Role Details */}
        <div className="space-y-4">
          {selectedRole ? (
            <>
              {/* Role Info */}
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedRole.name}
                    </h3>
                    {selectedRole.description && (
                      <p className="text-sm text-gray-600">
                        {selectedRole.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Permisos:</span>
                    <span className="font-medium">{selectedRole.permissions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creado:</span>
                    <span>{new Date(selectedRole.created_at).toLocaleDateString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actualizado:</span>
                    <span>{new Date(selectedRole.updated_at).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>
              </Card>

              {/* Role Permissions */}
              <Card className="p-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Permisos del Rol
                </h4>
                
                {selectedRole.permissions.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      selectedRole.permissions.reduce((acc, permission) => {
                        if (!acc[permission.resource]) {
                          acc[permission.resource] = [];
                        }
                        acc[permission.resource].push(permission);
                        return acc;
                      }, {} as Record<string, Permission[]>)
                    ).map(([resource, perms]) => (
                      <div key={resource} className="border border-gray-200 rounded-lg p-3">
                        <h5 className="font-medium text-gray-900 mb-2 capitalize">
                          {resource}
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {perms.map((permission) => (
                            <span
                              key={permission.id}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {permission.action}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Key className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Este rol no tiene permisos asignados
                    </p>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Selecciona un rol
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Haz clic en un rol para ver sus detalles y permisos
                </p>
              </div>
            </Card>
          )}

          {/* All Permissions Reference */}
          <Card className="p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Permisos Disponibles
            </h4>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2 capitalize">
                    {resource}
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {perms.map((permission) => (
                      <span
                        key={permission.id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {permission.action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setEditingRole(null);
        }}
        role={editingRole}
        onSave={loadData}
      />
    </div>
  );
};

export default RolesPage;