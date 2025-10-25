import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Download,
  Upload,
  Star,
  CreditCard,
  TrendingUp,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AddClientModal, ClientHistory, PointsAdjustmentModal } from '@/components/clients';
import { useNotifications } from '@/hooks';
import { clientService } from '@/services';
import type { Client, ClientStats, ClientFilters, PaginatedResponse } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, change }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${change.isPositive ? '' : 'rotate-180'}`} />
            <span>{Math.abs(change.value)}% vs mes anterior</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </Card>
);

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ClientFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<Client>['pagination'] | null>(null);

  const { success, error } = useNotifications();

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsResponse, statsResponse] = await Promise.all([
        clientService.getClients(currentPage, 10, { ...filters, search: searchTerm }),
        clientService.getClientStats()
      ]);
      
      setClients(clientsResponse.data);
      setPagination(clientsResponse.pagination);
      setStats(statsResponse);
    } catch (err) {
      error('Error al cargar los datos', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setFilters({ ...filters, search: value });
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setShowAddModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowAddModal(true);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowHistory(true);
  };

  const handleAdjustPoints = (client: Client) => {
    setSelectedClient(client);
    setShowPointsModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return;
    
    try {
      await clientService.deleteClient(id);
      success('Cliente eliminado exitosamente');
      loadData();
    } catch (err) {
      error('Error al eliminar el cliente', err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleExportClients = async () => {
    try {
      const blob = await clientService.exportClients(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Clientes exportados exitosamente');
    } catch (err) {
      error('Error al exportar clientes', err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'blocked': return 'Bloqueado';
      default: return status;
    }
  };

  return (
    <>
      {showHistory && selectedClient ? (
        <ClientHistory 
          client={selectedClient} 
          onBack={() => {
            setShowHistory(false);
            setSelectedClient(null);
          }} 
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p className="text-gray-600">Administra tu base de clientes y programa de fidelización</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleExportClients}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button onClick={handleAddClient} className="bg-gradient-to-r from-nequi-pink to-nequi-purple text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar Cliente
              </Button>
            </div>
          </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Clientes"
            value={stats.total_clients.toLocaleString()}
            icon={Users}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Clientes Activos"
            value={stats.active_clients.toLocaleString()}
            icon={UserCheck}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Nuevos este Mes"
            value={stats.new_clients_this_month}
            icon={TrendingUp}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            title="Puntos Emitidos"
            value={stats.total_points_issued.toLocaleString()}
            icon={Star}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, documento, teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="blocked">Bloqueados</option>
            </select>
            <select
              value={filters.document_type || ''}
              onChange={(e) => setFilters({ ...filters, document_type: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
            >
              <option value="">Tipo de documento</option>
              <option value="cedula">Cédula</option>
              <option value="nit">NIT</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="cedula_extranjeria">Cédula de Extranjería</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Más Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nequi-pink"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compras
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Compra
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-nequi-pink to-nequi-purple rounded-full flex items-center justify-center text-white font-medium">
                            {client.name.charAt(0)}{client.last_name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {client.name} {client.last_name}
                            </div>
                            {client.email && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {client.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.document}</div>
                        <div className="text-sm text-gray-500 uppercase">{client.document_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {client.phone}
                        </div>
                        {client.city && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {client.city}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {client.points.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.total_purchases}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(client.total_spent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                          {getStatusText(client.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.last_purchase ? (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(client.last_purchase)}
                          </div>
                        ) : (
                          'Nunca'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAdjustPoints(client)}
                          >
                            <Award className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} clientes
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrev}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={!pagination.hasNext}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

          {/* Client History View */}
          {selectedClient && showHistory && (
            <ClientHistory
              client={selectedClient}
              onBack={() => {
                setShowHistory(false);
                setSelectedClient(null);
              }}
            />
          )}
        </div>
      )}

      {/* Add/Edit Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedClient(null);
        }}
        onClientSaved={() => {
          loadData();
        }}
        editClient={selectedClient}
      />

      {/* Points Adjustment Modal */}
      {selectedClient && (
        <PointsAdjustmentModal
          isOpen={showPointsModal}
          onClose={() => {
            setShowPointsModal(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          onPointsAdjusted={() => {
            loadData();
          }}
        />
      )}
    </>
  );
};