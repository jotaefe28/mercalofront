import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Search, 
  Filter,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Award,
  Clock,
  BarChart3,
  RefreshCw,
  Gift,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import PointsConfigModal from '../../components/points/PointsConfigModal';
import RedeemPointsModal from '../../components/points/RedeemPointsModal';
import { useNotifications } from '@/hooks';
import { pointsService } from '@/services';
import type { 
  PointsStats, 
  PointsConfig, 
  ClientPointsTransaction, 
  PointsFilters, 
  Client,
  PaginatedResponse 
} from '@/types';

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

export const PointsPage: React.FC = () => {
  const [stats, setStats] = useState<PointsStats | null>(null);
  const [config, setConfig] = useState<PointsConfig | null>(null);
  const [transactions, setTransactions] = useState<ClientPointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [filters, setFilters] = useState<PointsFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<ClientPointsTransaction>['pagination'] | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'transactions' | 'config'>('overview');
  
  // Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);

  const { success, error } = useNotifications();

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, configResponse, transactionsResponse] = await Promise.all([
        pointsService.getPointsStats(),
        pointsService.getPointsConfig(),
        pointsService.getPointsTransactions(currentPage, 10, filters)
      ]);
      
      setStats(statsResponse);
      setConfig(configResponse);
      setTransactions(transactionsResponse.data);
      setPagination(transactionsResponse.pagination);
    } catch (err) {
      error('Error al cargar los datos', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSearch = async () => {
    if (!searchTerm.trim()) {
      error('Ingresa un número de documento');
      return;
    }

    try {
      setClientSearchLoading(true);
      const client = await pointsService.searchClientByDocument(searchTerm.trim());
      
      if (client) {
        setSelectedClient(client);
        success('Cliente encontrado');
      } else {
        error('Cliente no encontrado');
        setSelectedClient(null);
      }
    } catch (err) {
      error('Error al buscar cliente', err instanceof Error ? err.message : 'Error desconocido');
      setSelectedClient(null);
    } finally {
      setClientSearchLoading(false);
    }
  };

  const handleExportTransactions = async () => {
    try {
      const blob = await pointsService.exportPointsTransactions(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transacciones_puntos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Transacciones exportadas exitosamente');
    } catch (err) {
      error('Error al exportar transacciones', err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600 bg-green-100';
      case 'used': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'adjustment': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'earned': return 'Ganados';
      case 'used': return 'Usados';
      case 'expired': return 'Expirados';
      case 'adjustment': return 'Ajuste';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nequi-pink"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Puntos</h1>
          <p className="text-gray-600">Gestiona el programa de fidelización y consulta puntos de clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportTransactions}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsRedemptionModalOpen(true)}>
            <Gift className="w-4 h-4 mr-2" />
            Redimir Puntos
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsConfigModalOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-nequi-pink text-nequi-pink'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-nequi-pink text-nequi-pink'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Consultar Cliente
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-nequi-pink text-nequi-pink'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Todas las Transacciones
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'config'
                ? 'border-nequi-pink text-nequi-pink'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuración
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && stats && config && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Puntos Emitidos"
              value={stats.total_points_issued.toLocaleString()}
              icon={Star}
              color="text-yellow-600"
              bgColor="bg-yellow-100"
            />
            <StatCard
              title="Puntos Redimidos"
              value={stats.total_points_redeemed.toLocaleString()}
              icon={Gift}
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatCard
              title="Puntos Activos"
              value={stats.active_points.toLocaleString()}
              icon={Target}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatCard
              title="Clientes con Puntos"
              value={stats.total_clients_with_points.toLocaleString()}
              icon={Users}
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración Actual</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Puntos por peso:</span>
                  <span className="font-medium">{config.points_per_peso}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compra mínima:</span>
                  <span className="font-medium">{formatCurrency(config.min_purchase_for_points)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor por punto:</span>
                  <span className="font-medium">{formatCurrency(config.points_value_in_pesos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiración:</span>
                  <span className="font-medium">{config.points_expiry_days} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    config.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {config.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clientes</h3>
              <div className="space-y-3">
                {stats.top_earners.slice(0, 5).map((earner, index) => (
                  <div key={earner.client.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-nequi-pink to-nequi-purple rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {earner.client.name} {earner.client.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{earner.client.document_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-yellow-600">
                        <Star className="w-3 h-3 mr-1" />
                        <span className="text-sm font-medium">{earner.points.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buscar Cliente</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Número de documento del cliente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleClientSearch()}
                />
              </div>
              <Button 
                onClick={handleClientSearch}
                disabled={clientSearchLoading}
                className="bg-gradient-to-r from-nequi-pink to-nequi-purple text-white"
              >
                {clientSearchLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>

          {/* Client Results */}
          {selectedClient && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {selectedClient.points.toLocaleString()} puntos
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Datos Personales</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Nombre:</span> {selectedClient.name} {selectedClient.last_name}</p>
                    <p><span className="text-gray-600">Documento:</span> {selectedClient.document_type.toUpperCase()} {selectedClient.document_number}</p>
                    <p><span className="text-gray-600">Teléfono:</span> {selectedClient.phone}</p>
                    {selectedClient.email && (
                      <p><span className="text-gray-600">Email:</span> {selectedClient.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Total compras:</span> {selectedClient.total_purchases}</p>
                    <p><span className="text-gray-600">Total gastado:</span> {formatCurrency(selectedClient.total_spent)}</p>
                    <p><span className="text-gray-600">Puntos actuales:</span> {selectedClient.points.toLocaleString()}</p>
                    {config && (
                      <p><span className="text-gray-600">Valor en dinero:</span> {formatCurrency(pointsService.calculatePointsValue(selectedClient.points, config))}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <Card className="overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="earned">Ganados</option>
                <option value="used">Usados</option>
                <option value="expired">Expirados</option>
                <option value="adjustment">Ajustes</option>
              </select>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
                placeholder="Fecha desde"
              />
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
                placeholder="Fecha hasta"
              />
              <Button variant="outline" size="sm" onClick={() => setFilters({})}>
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(transaction.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        Cliente ID: {transaction.client_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                        {getTransactionTypeName(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        <span className={`text-sm font-medium ${
                          transaction.type === 'earned' || (transaction.type === 'adjustment' && transaction.points > 0)
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'earned' || (transaction.type === 'adjustment' && transaction.points > 0) ? '+' : '-'}
                          {Math.abs(transaction.points).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {transaction.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.sale_id ? (
                        <span className="text-sm text-blue-600">
                          #{transaction.sale_id}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
                  {pagination.total} transacciones
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
        </Card>
      )}

      {activeTab === 'config' && config && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Sistema de Puntos</h3>
            <p className="text-gray-600 mb-6">
              Configura las reglas y parámetros del programa de fidelización.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Configuración Actual</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Puntos por peso gastado:</span>
                    <span className="font-medium">{config.points_per_peso}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Compra mínima para puntos:</span>
                    <span className="font-medium">{formatCurrency(config.min_purchase_for_points)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Valor de cada punto:</span>
                    <span className="font-medium">{formatCurrency(config.points_value_in_pesos)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Días hasta expiración:</span>
                    <span className="font-medium">{config.points_expiry_days} días</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Máximo puntos por compra:</span>
                    <span className="font-medium">{config.max_points_per_transaction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Estado del sistema:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      config.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`}>
                      {config.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Simulador</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Ejemplos con la configuración actual:</p>
                  <div className="space-y-2 text-sm">
                    <p>• Compra de {formatCurrency(10000)} = <span className="font-medium text-yellow-600">{pointsService.calculatePointsForPurchase(10000, config)} puntos</span></p>
                    <p>• Compra de {formatCurrency(50000)} = <span className="font-medium text-yellow-600">{pointsService.calculatePointsForPurchase(50000, config)} puntos</span></p>
                    <p>• 100 puntos = <span className="font-medium text-green-600">{formatCurrency(pointsService.calculatePointsValue(100, config))}</span></p>
                    <p>• 1000 puntos = <span className="font-medium text-green-600">{formatCurrency(pointsService.calculatePointsValue(1000, config))}</span></p>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-nequi-pink to-nequi-purple text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Modificar Configuración
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      <PointsConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config || undefined}
        onConfigUpdate={(newConfig: PointsConfig) => {
          setConfig(newConfig);
          loadData(); // Refresh data after config update
        }}
      />

      <RedeemPointsModal
        isOpen={isRedemptionModalOpen}
        onClose={() => setIsRedemptionModalOpen(false)}
        config={config || undefined}
        onPointsRedeemed={() => {
          loadData(); // Refresh data after redemption
        }}
      />
    </div>
  );
};