import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  MessageCircle, 
  Printer, 
  Download,
  Share2,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Package
} from 'lucide-react';
import type { CartItem } from '@/types';
import toast from 'react-hot-toast';

interface SalesSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData?: {
    items: CartItem[];
    total: number;
    client?: {
      name: string;
      phone?: string;
      email?: string;
    };
    deliveryMethod: 'store' | 'home';
    paymentMethod: string;
    saleNumber: string;
  };
}

export const SalesSummaryModal: React.FC<SalesSummaryModalProps> = ({
  isOpen,
  onClose,
  saleData
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppShare = async () => {
    setIsProcessing('whatsapp');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const message = `🧾 *Factura de Venta #${saleData?.saleNumber}*\n\n` +
        `📅 Fecha: ${new Date().toLocaleDateString('es-CO')}\n` +
        `👤 Cliente: ${saleData?.client?.name || 'Cliente General'}\n` +
        `💰 Total: ${formatPrice(saleData?.total || 0)}\n\n` +
        `📦 Productos:\n` +
        (saleData?.items.map(item => 
          `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
        ).join('\n') || '') +
        `\n\n¡Gracias por tu compra! 🛍️`;

      const whatsappUrl = `https://wa.me/${saleData?.client?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast.success('Factura enviada por WhatsApp');
    } catch (error) {
      toast.error('Error al enviar por WhatsApp');
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePrint = async () => {
    setIsProcessing('print');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.print();
      toast.success('Factura enviada a impresión');
    } catch (error) {
      toast.error('Error al imprimir');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDownload = async () => {
    setIsProcessing('download');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Factura descargada exitosamente');
    } catch (error) {
      toast.error('Error al descargar');
    } finally {
      setIsProcessing(null);
    }
  };

  if (!saleData) return null;

  const totalItems = saleData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8" />
                </motion.div>
                <h2 className="text-2xl font-bold">¡Venta Exitosa!</h2>
                <p className="text-green-100 mt-1">Factura #{saleData.saleNumber}</p>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Sale Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Detalles de la Venta
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Fecha:</span>
                        <div className="font-medium">{new Date().toLocaleDateString('es-CO')}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Hora:</span>
                        <div className="font-medium">{new Date().toLocaleTimeString('es-CO')}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Artículos:</span>
                        <div className="font-medium">{totalItems}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Entrega:</span>
                        <div className="font-medium">
                          {saleData.deliveryMethod === 'store' ? '🏪 Tienda' : '🏠 Domicilio'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Info */}
                  {saleData.client && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Información del Cliente
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Nombre:</span>
                          <div className="font-medium">{saleData.client.name}</div>
                        </div>
                        {saleData.client.phone && (
                          <div>
                            <span className="text-gray-600">Teléfono:</span>
                            <div className="font-medium">{saleData.client.phone}</div>
                          </div>
                        )}
                        {saleData.client.email && (
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <div className="font-medium">{saleData.client.email}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
                    <div className="space-y-2">
                      {saleData.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{item.quantity}x {formatPrice(item.price)}</div>
                            <div className="text-sm text-gray-600">{formatPrice(item.price * item.quantity)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-nequi-purple/10 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-nequi-pink to-nequi-purple bg-clip-text text-transparent">
                        {formatPrice(saleData.total)}
                      </span>
                    </div>
                    <div className="text-right text-sm text-nequi-purple mt-1">
                      Puntos generados: +{Math.floor(saleData.total / 1000)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <motion.button
                    onClick={handleWhatsAppShare}
                    disabled={!!isProcessing}
                    className="flex flex-col items-center justify-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isProcessing === 'whatsapp' ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                    <span className="text-xs mt-1">WhatsApp</span>
                  </motion.button>

                  <motion.button
                    onClick={handlePrint}
                    disabled={!!isProcessing}
                    className="flex flex-col items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isProcessing === 'print' ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Printer className="w-5 h-5" />
                    )}
                    <span className="text-xs mt-1">Imprimir</span>
                  </motion.button>

                  <motion.button
                    onClick={handleDownload}
                    disabled={!!isProcessing}
                    className="flex flex-col items-center justify-center p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isProcessing === 'download' ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    <span className="text-xs mt-1">Descargar</span>
                  </motion.button>
                </div>

                <motion.button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                  whileTap={{ scale: 0.98 }}
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};