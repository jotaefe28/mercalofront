import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Package, Plus, Minus, UserPlus } from 'lucide-react';
import type { Product, CartItem } from '@/types';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddClient?: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  searchTerm,
  onSearchChange,
  onAddClient,
}) => {
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockColor = (stock: number) => {
    if (stock > 50) return 'text-green-600';
    if (stock > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex-1 p-6">
      {/* Header del catálogo */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-raleway mb-2">
          Catálogo de Productos
        </h2>
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-nequi-pink focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Botón Agregar Cliente */}
            {onAddClient && (
              <motion.button
                onClick={onAddClient}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-nequi-pink to-nequi-purple text-white px-3 md:px-4 py-2 rounded-xl flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
                title="Agregar nuevo cliente"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden md:block">Agregar Cliente</span>
              </motion.button>
            )}
            
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all hover:shadow-md"
            onClick={() => onAddToCart(product)}
          >
            {/* Product Image */}
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="w-12 h-12 text-gray-400" />
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white font-raleway">
                {product.name}
              </h3>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-nequi-pink">
                  {formatPrice(product.price)}
                </span>
                <span className={`text-sm font-medium ${getStockColor(product.stock)}`}>
                  Stock: {product.stock}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                SKU: {product.sku}
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full bg-nequi-pink hover:bg-nequi-pink-dark text-white py-2 px-4 rounded-lg transition-colors font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Agregar
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {filteredProducts.length > 0 && (
        <div className="mt-8 text-center">
          <button className="text-nequi-pink hover:text-nequi-pink-dark font-medium">
            Mostrar más
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};