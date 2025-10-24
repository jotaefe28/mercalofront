import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Filter,
  Download,
  Search,
  Calendar,
  DollarSign,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Edit,
  Ban
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AccountDetailModal, PaymentModal } from '../../components/accounts';
import { accountsService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  AccountReceivable,
  AccountReceivableFilters,
  AccountReceivableStats,
  AccountReceivableResponse
} from '../../types';

interface AccountsPageProps {}

const AccountsPage: React.FC<AccountsPageProps> = () => {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [stats, setStats] = useState<AccountReceivableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState<AccountReceivableFilters>({
    status: 'all',
    period: 'this_month'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState<keyof AccountReceivable>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);

  const { addNotification } = useNotifications();

  // Quick filter options
  const statusOptions = [
    { value: 'all', label: 'Todos', color: 'text-gray-600' },
    { value: 'pending', label: 'Pendientes', color: 'text-yellow-600' },
    { value: 'partial', label: 'Pagos Parciales', color: 'text-blue-600' },
    { value: 'paid', label: 'Pagados', color: 'text-green-600' },
    { value: 'overdue', label: 'Vencidos', color: 'text-red-600' },
    { value: 'cancelled', label: 'Cancelados', color: 'text-gray-600' }
  ];

  const periodOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'this_week', label: 'Esta semana' },
    { value: 'last_week', label: 'Semana pasada' },
    { value: 'this_month', label: 'Este mes' },
    { value: 'last_month', label: 'Mes pasado' },
    { value: 'this_year', label: 'Este año' },
    { value: 'last_year', label: 'Año pasado' },
    { value: 'custom', label: 'Personalizado' }
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, [currentPage, filters, sortField, sortDirection]);

  // Quick search debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (quickSearch !== (filters.search || '')) {
        setFilters(prev => ({ ...prev, search: quickSearch || undefined }));
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [quickSearch]);

  const loadData = async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setSearchLoading(true);
      }

      // Build effective filters
      const effectiveFilters = {
        ...filters,
        ...accountsService.buildDateFilter(filters.period || 'this_month', filters.year, filters.month, filters.day)
      };

      const [accountsResponse, statsData] = await Promise.all([
        accountsService.getAccountsReceivable(effectiveFilters, currentPage, perPage),
        accountsService.getAccountsStats(effectiveFilters)
      ]);
      
      setAccounts(accountsResponse.data);
      setTotalPages(accountsResponse.pagination.total_pages);
      setTotalRecords(accountsResponse.pagination.total);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las cuentas por cobrar'
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSort = (field: keyof AccountReceivable) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewAccount = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
  };

  const handleAddPayment = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setShowPaymentModal(true);
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      const effectiveFilters = {
        ...filters,
        ...accountsService.buildDateFilter(filters.period || 'this_month', filters.year, filters.month, filters.day)
      };

      const blob = await accountsService.exportAccountsToExcel(effectiveFilters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cuentas-por-cobrar-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportación exitosa',
        message: 'El archivo se ha descargado correctamente'
      });
    } catch (error) {
      console.error('Error exporting accounts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo exportar el archivo'
      });
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusIcon = (status: AccountReceivable['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  // Computed values
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [accounts, sortField, sortDirection]);

  const getSortIcon = (field: keyof AccountReceivable) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <TrendingUp className="h-4 w-4 text-blue-600" />
      : <TrendingDown className="h-4 w-4 text-blue-600" />;
  };

  const currentStatusOption = statusOptions.find(opt => opt.value === filters.status) || statusOptions[0];
  const currentPeriodOption = periodOptions.find(opt => opt.value === filters.period) || periodOptions[4];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas por Cobrar</h1>
          <p className="text-gray-600">Gestiona las cuentas pendientes de pago</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {showFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center space-x-2"
          >
            {exportLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Exportar</span>
          </Button>
          <Button
            onClick={loadData}
            disabled={searchLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${searchLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cuentas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_accounts}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total por Cobrar</p>
                <p className="text-3xl font-bold text-gray-900">
                  {accountsService.formatCurrency(stats.pending_amount)}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cobrado</p>
                <p className="text-3xl font-bold text-green-600">
                  {accountsService.formatCurrency(stats.paid_amount)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cuentas Vencidas</p>
                <p className="text-3xl font-bold text-red-600">
                  {accountsService.formatCurrency(stats.overdue_amount)}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Cliente, factura, documento..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={filters.period || 'this_month'}
                onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Mínimo
              </label>
              <Input
                type="number"
                value={filters.amount_min || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amount_min: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Custom date inputs for custom period */}
          {filters.period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <Input
                  type="number"
                  value={filters.year || new Date().getFullYear()}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    year: parseInt(e.target.value) 
                  }))}
                  min="2020"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes (opcional)
                </label>
                <select
                  value={filters.month || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    month: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los meses</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('es-ES', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día (opcional)
                </label>
                <Input
                  type="number"
                  value={filters.day || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    day: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  min="1"
                  max="31"
                  placeholder="Día específico"
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Mostrando {accounts.length} de {totalRecords} cuentas</span>
          <span className={currentStatusOption.color}>
            Filtro: {currentStatusOption.label}
          </span>
          <span>Período: {currentPeriodOption.label}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Página {currentPage} de {totalPages}</span>
        </div>
      </div>

      {/* Accounts Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('invoice_number')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Factura</span>
                    {getSortIcon('invoice_number')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('client_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Cliente</span>
                    {getSortIcon('client_name')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total_amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total</span>
                    {getSortIcon('total_amount')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('pending_amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Pendiente</span>
                    {getSortIcon('pending_amount')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('due_date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vencimiento</span>
                    {getSortIcon('due_date')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAccounts.map((account) => {
                const overdueDays = accountsService.calculateOverdueDays(account.due_date);
                const isOverdue = overdueDays > 0 && account.status !== 'paid' && account.status !== 'cancelled';
                
                return (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {account.invoice_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(account.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.client_document}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {accountsService.formatCurrency(account.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {accountsService.formatCurrency(account.pending_amount)}
                      </div>
                      {account.paid_amount > 0 && (
                        <div className="text-xs text-gray-500">
                          Pagado: {accountsService.formatCurrency(account.paid_amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(account.due_date).toLocaleDateString('es-ES')}
                      </div>
                      {isOverdue && (
                        <div className="text-xs text-red-600">
                          Vencido por {overdueDays} días
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${accountsService.getStatusColor(account.status)}`}>
                        {getStatusIcon(account.status)}
                        <span className="ml-1">{accountsService.getStatusLabel(account.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAccount(account)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Ver</span>
                        </Button>
                        {account.status !== 'paid' && account.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            onClick={() => handleAddPayment(account)}
                            className="flex items-center space-x-1"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Pagar</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((currentPage - 1) * perPage) + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(currentPage * perPage, totalRecords)}</span> de{' '}
                  <span className="font-medium">{totalRecords}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-l-md"
                  >
                    Anterior
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="border-l-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-r-md border-l-0"
                  >
                    Siguiente
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Empty State */}
      {accounts.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay cuentas por cobrar
          </h3>
          <p className="text-gray-600 mb-4">
            No se encontraron cuentas con los filtros aplicados.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({ status: 'all', period: 'this_month' });
              setQuickSearch('');
            }}
          >
            Limpiar filtros
          </Button>
        </Card>
      )}

      {/* Modals */}
      {selectedAccount && (
        <>
          <AccountDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedAccount(null);
            }}
            account={selectedAccount}
            onPaymentAdded={() => {
              setShowDetailModal(false);
              setSelectedAccount(null);
              setShowPaymentModal(true);
            }}
          />

          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedAccount(null);
            }}
            account={selectedAccount}
            onPaymentAdded={() => {
              loadData();
              setShowPaymentModal(false);
              setSelectedAccount(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default AccountsPage;