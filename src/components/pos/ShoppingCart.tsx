import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, X, CreditCard, Banknote, Package } from 'lucide-react';
import type { CartItem } from '@/types';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isOpen,
  onToggle,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'store' | 'home'>('store');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      onCheckout();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <>
      {/* Cart Panel - Completamente fijo para POS */}
      <div className="h-full w-full bg-white dark:bg-gray-800 flex flex-col"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)',
        }}
      >
        {/* Header optimizado - Más compacto */}
        <div className="relative p-4 bg-gradient-to-br from-nequi-purple-dark via-nequi-purple to-nequi-pink text-white overflow-hidden">
          {/* Patrón de fondo decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 w-20 h-20 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-2 left-2 w-16 h-16 bg-nequi-pink rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCartIcon className="w-5 h-5" />
                <div>
                  <h3 className="text-lg font-bold font-raleway">
                    Carrito de Compras
                  </h3>
                  <p className="text-xs text-white/80">
                    {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {items.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={onClearCart}
                    className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors backdrop-blur-sm"
                    title="Limpiar carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
                <button
                  onClick={onToggle}
                  className="lg:hidden p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Items con scroll mejorado */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-nequi-pink/20 scrollbar-track-transparent">
            <AnimatePresence mode="wait">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center h-full text-center p-8"
                >
                  <motion.div 
                    className="relative mb-6"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div className="bg-gradient-to-br from-nequi-purple-light to-nequi-pink w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl">
                      <Package className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                  </motion.div>
                  
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                    ¡Tu carrito está esperando!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs leading-relaxed">
                    Agrega productos desde el catálogo para comenzar una venta increíble
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">💡</div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800 dark:text-white text-sm">Tip Pro</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          Usa <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Ctrl+F</kbd> para buscar productos rápidamente
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="p-6 space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-nequi-pink transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            SKU: <span className="font-mono">{item.sku}</span>
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all ml-2"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="w-8 h-8 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-xl flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          
                          <div className="bg-nequi-pink text-white px-3 py-1 rounded-lg font-bold min-w-[2rem] text-center">
                            {item.quantity}
                          </div>
                          
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-nequi-pink hover:bg-nequi-pink-dark rounded-xl flex items-center justify-center text-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-nequi-pink">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatPrice(item.price)} c/u
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Checkout Section Optimizada */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t-2 border-gray-100 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-4 space-y-4"
          >
            {/* Resumen del Total */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-600">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal ({totalItems} items):</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Descuentos:</span>
                  <span className="text-green-600 font-semibold">$0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Impuestos:</span>
                  <span className="text-gray-600 dark:text-gray-400">Incluidos</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-nequi-pink to-nequi-purple bg-clip-text text-transparent">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  <div className="text-right text-xs mt-1">
                    <span className="text-nequi-purple font-medium">
                      🎯 Puntos a generar: +{Math.floor(totalAmount / 1000)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Entrega - Sin iconos */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Método de Entrega
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <motion.label 
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === 'store' 
                      ? 'border-nequi-pink bg-nequi-pink/5 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="store"
                    checked={deliveryMethod === 'store'}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'store' | 'home')}
                    className="text-nequi-pink focus:ring-nequi-pink mr-2"
                  />
                  <span className="text-sm font-medium">Tienda</span>
                </motion.label>
                
                <motion.label 
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === 'home' 
                      ? 'border-nequi-pink bg-nequi-pink/5 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="home"
                    checked={deliveryMethod === 'home'}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'store' | 'home')}
                    className="text-nequi-pink focus:ring-nequi-pink mr-2"
                  />
                  <span className="text-sm font-medium">Domicilio</span>
                </motion.label>
              </div>
            </div>

            {/* Botones de Pago */}
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-nequi-pink via-nequi-pink-dark to-nequi-purple hover:from-nequi-pink-dark hover:to-nequi-purple text-white py-3 px-6 rounded-xl transition-all duration-300 font-bold flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar Ahora</span>
                    <span className="text-sm opacity-80">({formatPrice(totalAmount)})</span>
                  </>
                )}
              </motion.button>
              
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 px-3 rounded-lg transition-all font-semibold flex items-center justify-center space-x-1 shadow-lg text-sm"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Efectivo</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 px-3 rounded-lg transition-all font-semibold flex items-center justify-center space-x-1 shadow-lg text-sm"
                >
                  <span>💳</span>
                  <span>Después</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2.5 px-3 rounded-lg transition-all font-semibold flex items-center justify-center shadow-lg text-sm"
                  title="Más opciones de pago"
                >
                  <span>➕</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};