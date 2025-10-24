import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Package,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AddProductModal } from '@/components/inventory';
import { useNotifications } from '@/hooks';
import { productService } from '@/services';
import type { Product, ProductStats, ProductFilters } from '@/types';

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { success, error } = useNotifications();

  useEffect(() => {
    loadData();
  }, [currentPage, filters, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, statsResponse] = await Promise.all([
        productService.getProducts(currentPage, 20, { ...filters, search: searchTerm }),
        productService.getProductStats()
      ]);
      
      setProducts(productsResponse.data);
      setTotalPages(productsResponse.pagination.totalPages);
      setStats(statsResponse);
    } catch (err) {
      error('Error al cargar los datos', err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', color: 'text-red-600 bg-red-50' };
    if (stock <= 10) return { label: 'Stock bajo', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'En stock', color: 'text-green-600 bg-green-50' };
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      await productService.deleteProduct(id);
      success('Producto eliminado exitosamente');
      loadData();
    } catch (err) {
      error('Error al eliminar el producto', err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await productService.updateStock(id, newStock, 'set');
      success('Stock actualizado exitosamente');
      loadData();
    } catch (err) {
      error('Error al actualizar el stock', err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    description?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color.includes('red') ? 'bg-red-50' : 
          color.includes('yellow') ? 'bg-yellow-50' : 
          color.includes('green') ? 'bg-green-50' : 'bg-blue-50'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestiona todos tus productos y stock</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleAddProduct} className="bg-gradient-to-r from-nequi-pink to-nequi-purple text-white">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Productos"
            value={stats.total_products}
            icon={Package}
            color="text-blue-600"
            description="Productos registrados"
          />
          <StatCard
            title="Valor Total"
            value={formatCurrency(stats.total_value)}
            icon={BarChart3}
            color="text-green-600"
            description="Valor del inventario"
          />
          <StatCard
            title="Stock Bajo"
            value={stats.low_stock_count}
            icon={AlertTriangle}
            color="text-yellow-600"
            description="Productos con poco stock"
          />
          <StatCard
            title="Sin Stock"
            value={stats.out_of_stock_count}
            icon={TrendingDown}
            color="text-red-600"
            description="Productos agotados"
          />
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            <option value="Aceites">Aceites</option>
            <option value="Cuidado Personal">Cuidado Personal</option>
            <option value="Alimentación">Alimentación</option>
          </select>
          <select
            value={filters.low_stock ? 'low' : filters.out_of_stock ? 'out' : ''}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => ({
                ...prev,
                low_stock: value === 'low' ? true : undefined,
                out_of_stock: value === 'out' ? true : undefined
              }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="low">Stock bajo</option>
            <option value="out">Sin stock</option>
          </select>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Productos</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nequi-pink mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <Package className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedProduct(null);
        }}
        onProductSaved={() => {
          loadData();
        }}
        editProduct={selectedProduct}
      />
    </div>
  );
};