import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Settings, 
  CreditCard, 
  Upload,
  Download,
  Edit2,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Globe,
  Phone,
  Mail,
  MapPin,
  Camera,
  Save,
  FileText,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { CompanyInfoModal, PaymentMethodModal } from '../../components/company';
import { companyService } from '../../services';
import { useNotifications } from '../../hooks';
import type { 
  Company, 
  CompanySettings,
  PaymentMethod,
  CompanyStats,
  PaymentMethodFilters
} from '../../types';

interface CompanyPageProps {}

const CompanyPage: React.FC<CompanyPageProps> = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'info' | 'payment-methods' | 'settings' | 'stats'>('info');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [paymentFilters, setPaymentFilters] = useState<PaymentMethodFilters>({
    search: '',
    type: '',
    is_active: undefined,
  });

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, settingsData, paymentMethodsData, statsData] = await Promise.all([
        companyService.getCompany(),
        companyService.getCompanySettings(),
        companyService.getPaymentMethods(),
        companyService.getCompanyStats()
      ]);
      
      setCompany(companyData);
      setSettings(settingsData);
      setPaymentMethods(paymentMethodsData.data);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading company data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar la información de la empresa'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'El archivo debe ser una imagen'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'La imagen no puede superar los 5MB'
      });
      return;
    }

    try {
      setUploadingLogo(true);
      const result = await companyService.uploadLogo(file);
      
      // Update company data
      setCompany(prev => prev ? { ...prev, logo_url: result.logo_url } : null);
      
      addNotification({
        type: 'success',
        title: 'Logo actualizado',
        message: 'El logo de la empresa ha sido actualizado correctamente'
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo subir el logo'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleTogglePaymentMethod = async (paymentMethod: PaymentMethod) => {
    try {
      await companyService.togglePaymentMethodStatus(paymentMethod.id, !paymentMethod.is_active);
      addNotification({
        type: 'success',
        title: 'Método de pago actualizado',
        message: `Método de pago ${paymentMethod.is_active ? 'desactivado' : 'activado'} correctamente`
      });
      loadData();
    } catch (error) {
      console.error('Error toggling payment method:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el método de pago'
      });
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este método de pago?')) return;
    
    try {
      await companyService.deletePaymentMethod(paymentMethodId);
      addNotification({
        type: 'success',
        title: 'Método de pago eliminado',
        message: 'El método de pago ha sido eliminado correctamente'
      });
      loadData();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el método de pago'
      });
    }
  };

  const handleSelectPaymentMethod = (paymentMethodId: string) => {
    setSelectedPaymentMethods(prev => 
      prev.includes(paymentMethodId) 
        ? prev.filter(id => id !== paymentMethodId)
        : [...prev, paymentMethodId]
    );
  };

  const handleSelectAllPaymentMethods = () => {
    setSelectedPaymentMethods(
      selectedPaymentMethods.length === paymentMethods.length 
        ? [] 
        : paymentMethods.map(pm => pm.id)
    );
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    const icons = {
      cash: '💵',
      card: '💳',
      transfer: '🏦',
      digital_wallet: '📱',
      check: '📄',
      credit: '🏪',
      other: '❓'
    };
    return icons[type] || icons.other;
  };

  const getPaymentMethodTypeLabel = (type: PaymentMethod['type']) => {
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      digital_wallet: 'Billetera Digital',
      check: 'Cheque',
      credit: 'Crédito',
      other: 'Otro'
    };
    return labels[type] || 'Desconocido';
  };

  const filteredPaymentMethods = paymentMethods.filter(pm => {
    const matchesSearch = !paymentFilters.search || 
      pm.name.toLowerCase().includes(paymentFilters.search.toLowerCase()) ||
      pm.description?.toLowerCase().includes(paymentFilters.search.toLowerCase());
    
    const matchesType = !paymentFilters.type || pm.type === paymentFilters.type;
    const matchesStatus = paymentFilters.is_active === undefined || pm.is_active === paymentFilters.is_active;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando información de la empresa...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información de la Empresa</h1>
          <p className="text-gray-600">Gestiona la información de tu empresa y métodos de pago</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
          <Button 
            onClick={() => setShowCompanyModal(true)}
            className="flex items-center space-x-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>Editar Empresa</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.total_sales_today.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.total_sales_month.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Métodos de Pago</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_payment_methods}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_transactions}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'info', label: 'Información General', icon: Building2 },
            { id: 'payment-methods', label: 'Métodos de Pago', icon: CreditCard },
            { id: 'settings', label: 'Configuración', icon: Settings },
            { id: 'stats', label: 'Estadísticas', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'info' && company && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Logo */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo de la Empresa</h3>
            <div className="text-center space-y-4">
              {company.logo_url ? (
                <div className="relative">
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="mx-auto h-32 w-32 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => companyService.deleteLogo()}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-32 w-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>{company.logo_url ? 'Cambiar Logo' : 'Subir Logo'}</span>
                    </>
                  )}
                </label>
              </div>
              
              <p className="text-xs text-gray-500">
                Máximo 5MB. Formatos: JPG, PNG, GIF
              </p>
            </div>
          </Card>

          {/* Company Info */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Información de la Empresa</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCompanyModal(true)}
                className="flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Comercial
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {company.name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {company.legal_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIT
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {company.nit}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Régimen Tributario
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md capitalize">
                    {company.tax_regime === 'simplified' ? 'Simplificado' : 
                     company.tax_regime === 'common' ? 'Común' : 'Especial'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Teléfono</span>
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {company.phone}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {company.email}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Dirección</span>
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {company.address}, {company.city}, {company.state}
                  </p>
                </div>
                
                {company.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <span>Sitio Web</span>
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {company.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                  {company.description}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {selectedTab === 'payment-methods' && (
        <div className="space-y-6">
          {/* Payment Methods Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Buscar métodos de pago..."
                value={paymentFilters.search}
                onChange={(e) => setPaymentFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={paymentFilters.type || ''}
                onChange={(e) => setPaymentFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="digital_wallet">Billetera Digital</option>
                <option value="check">Cheque</option>
                <option value="credit">Crédito</option>
                <option value="other">Otro</option>
              </select>
              
              <select
                value={paymentFilters.is_active === undefined ? '' : paymentFilters.is_active.toString()}
                onChange={(e) => setPaymentFilters(prev => ({ 
                  ...prev, 
                  is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Método</span>
              </Button>
            </div>
          </div>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPaymentMethods.map((paymentMethod) => (
              <Card key={paymentMethod.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getPaymentMethodIcon(paymentMethod.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{paymentMethod.name}</h4>
                      <p className="text-sm text-gray-600">
                        {getPaymentMethodTypeLabel(paymentMethod.type)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePaymentMethod(paymentMethod)}
                      className={`p-1 rounded-full ${
                        paymentMethod.is_active ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {paymentMethod.is_active ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {paymentMethod.description && (
                  <p className="text-sm text-gray-600 mb-3">{paymentMethod.description}</p>
                )}
                
                <div className="space-y-2 text-xs text-gray-500">
                  {paymentMethod.commission_rate > 0 && (
                    <div className="flex justify-between">
                      <span>Comisión:</span>
                      <span>
                        {paymentMethod.commission_rate}
                        {paymentMethod.commission_type === 'percentage' ? '%' : ' COP'}
                      </span>
                    </div>
                  )}
                  
                  {paymentMethod.requires_reference && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Requiere referencia</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={`font-medium ${
                      paymentMethod.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {paymentMethod.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPaymentMethod(paymentMethod);
                      setShowPaymentModal(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredPaymentMethods.length === 0 && (
            <Card className="p-8">
              <div className="text-center">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay métodos de pago</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {paymentFilters.search || paymentFilters.type || paymentFilters.is_active !== undefined
                    ? 'No se encontraron métodos de pago con los filtros aplicados.'
                    : 'Comienza agregando tu primer método de pago.'
                  }
                </p>
                {!paymentFilters.search && !paymentFilters.type && paymentFilters.is_active === undefined && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar Método de Pago</span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && settings && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de la Empresa</h3>
          <p className="text-gray-600">Configuración - En desarrollo</p>
        </Card>
      )}

      {/* Stats Tab */}
      {selectedTab === 'stats' && stats && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Métodos de Pago</h3>
            
            {stats.sales_by_payment_method.length > 0 ? (
              <div className="space-y-4">
                {stats.sales_by_payment_method.map((item) => (
                  <div key={item.payment_method_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.payment_method_name}</p>
                      <p className="text-sm text-gray-600">{item.count} transacciones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${item.total_amount.toLocaleString('es-CO')}
                      </p>
                      <p className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay datos de ventas disponibles</p>
            )}
          </Card>
        </div>
      )}

      {/* Company Info Modal */}
      <CompanyInfoModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        company={company}
        onSave={loadData}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setEditingPaymentMethod(null);
        }}
        paymentMethod={editingPaymentMethod}
        onSave={loadData}
      />
    </div>
  );
};

export default CompanyPage;