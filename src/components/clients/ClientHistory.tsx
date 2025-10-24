import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Star, 
  CreditCard, 
  Package,
  TrendingUp,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { clientService } from '@/services';
import { useNotifications } from '@/hooks';
import type { Client, ClientPurchaseHistory, ClientPointsTransaction, PaginatedResponse } from '@/types';

interface ClientHistoryProps {
  client: Client;
  onBack: () => void;
}

export const ClientHistory: React.FC<ClientHistoryProps> = ({ client, onBack }) => {
  const [purchases, setPurchases] = useState<ClientPurchaseHistory[]>([]);
  const [pointsHistory, setPointsHistory] = useState<ClientPointsTransaction[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'points'>('purchases');
  const [purchasePage, setPurchasePage] = useState(1);
  const [pointsPage, setPointsPage] = useState(1);
  const [purchasesPagination, setPurchasesPagination] = useState<PaginatedResponse<ClientPurchaseHistory>['pagination'] | null>(null);
  const [pointsPagination, setPointsPagination] = useState<PaginatedResponse<ClientPointsTransaction>['pagination'] | null>(null);

  const { error } = useNotifications();

  useEffect(() => {
    loadPurchaseHistory();
  }, [purchasePage]);

  useEffect(() => {
    loadPointsHistory();
  }, [pointsPage]);

  const loadPurchaseHistory = async () => {
    try {
      setLoadingPurchases(true);
      const response = await clientService.getClientPurchaseHistory(client.id, purchasePage, 10);
      setPurchases(response.data);
      setPurchasesPagination(response.pagination);
    } catch (err) {
      error('Error al cargar el historial de compras', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingPurchases(false);
    }
  };

  const loadPointsHistory = async () => {
    try {
      setLoadingPoints(true);
      const response = await clientService.getClientPointsHistory(client.id, pointsPage, 10);
      setPointsHistory(response.data);
      setPointsPagination(response.pagination);
    } catch (err) {
      error('Error al cargar el historial de puntos', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingPoints(false);
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return DollarSign;
      case 'card': return CreditCard;
      case 'points': return Star;
      default: return Package;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'digital': return 'Digital';
      case 'points': return 'Puntos';
      case 'mixed': return 'Mixto';
      default: return method;
    }
  };

  const getPointsTypeColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600 bg-green-100';
      case 'used': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'adjustment': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPointsTypeName = (type: string) => {
    switch (type) {
      case 'earned': return 'Ganados';
      case 'used': return 'Usados';
      case 'expired': return 'Expirados';
      case 'adjustment': return 'Ajuste';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Historial de {client.name} {client.last_name}
            </h1>
            <p className="text-gray-600">
              {client.document_type.toUpperCase()}: {client.document_number}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadPurchaseHistory}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Client Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Compras</p>
              <p className="text-2xl font-bold text-gray-900">{client.total_purchases}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(client.total_spent)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Puntos Actuales</p>
              <p className="text-2xl font-bold text-gray-900">{client.points.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {client.total_purchases > 0 ? formatCurrency(client.total_spent / client.total_purchases) : '$0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchases'
                ? 'border-nequi-pink text-nequi-pink'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Historial de Compras
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'points'
                ? 'border-nequi-pink text-nequi-pink'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Historial de Puntos
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'purchases' && (
        <Card className="overflow-hidden">
          {loadingPurchases ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nequi-pink"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay compras registradas</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Venta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artículos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método de Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchases.map((purchase) => {
                      const PaymentIcon = getPaymentMethodIcon(purchase.payment_method);
                      return (
                        <motion.tr
                          key={purchase.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDate(purchase.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              #{purchase.sale_id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {purchase.items_count} artículo{purchase.items_count !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(purchase.total)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <PaymentIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {getPaymentMethodName(purchase.payment_method)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {purchase.points_earned > 0 && (
                                <div className="text-green-600">
                                  +{purchase.points_earned} ganados
                                </div>
                              )}
                              {purchase.points_used > 0 && (
                                <div className="text-blue-600">
                                  -{purchase.points_used} usados
                                </div>
                              )}
                              {purchase.points_earned === 0 && purchase.points_used === 0 && (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Purchases Pagination */}
              {purchasesPagination && purchasesPagination.totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Mostrando {((purchasesPagination.page - 1) * purchasesPagination.limit) + 1} a{' '}
                      {Math.min(purchasesPagination.page * purchasesPagination.limit, purchasesPagination.total)} de{' '}
                      {purchasesPagination.total} compras
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPurchasePage(prev => Math.max(1, prev - 1))}
                        disabled={!purchasesPagination.hasPrev}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPurchasePage(prev => Math.min(purchasesPagination.totalPages, prev + 1))}
                        disabled={!purchasesPagination.hasNext}
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
      )}

      {activeTab === 'points' && (
        <Card className="overflow-hidden">
          {loadingPoints ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nequi-pink"></div>
            </div>
          ) : pointsHistory.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay movimientos de puntos registrados</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
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
                    {pointsHistory.map((transaction) => (
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPointsTypeColor(transaction.type)}`}>
                            {getPointsTypeName(transaction.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            <span className={`text-sm font-medium ${
                              transaction.type === 'earned' || transaction.type === 'adjustment' && transaction.points > 0
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

              {/* Points Pagination */}
              {pointsPagination && pointsPagination.totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Mostrando {((pointsPagination.page - 1) * pointsPagination.limit) + 1} a{' '}
                      {Math.min(pointsPagination.page * pointsPagination.limit, pointsPagination.total)} de{' '}
                      {pointsPagination.total} transacciones
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPointsPage(prev => Math.max(1, prev - 1))}
                        disabled={!pointsPagination.hasPrev}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPointsPage(prev => Math.min(pointsPagination.totalPages, prev + 1))}
                        disabled={!pointsPagination.hasNext}
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
      )}
    </div>
  );
};