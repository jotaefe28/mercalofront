import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  Save, 
  Loader2, 
  DollarSign, 
  Hash, 
  Tag, 
  FileText,
  Barcode,
  Truck,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { productService } from '@/services';
import type { CreateProductData, Product } from '@/types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSaved?: (product: Product) => void;
  editProduct?: Product | null;
}

interface ProductFormData extends CreateProductData {}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductSaved,
  editProduct
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editProduct;
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: {
      stock: 0,
      price: 0,
      cost: 0,
      min_stock: 5,
      max_stock: 100,
      reorder_point: 10
    }
  });

  // Watch price and cost to calculate margin
  const price = watch('price');
  const cost = watch('cost');
  const margin = price && cost ? ((price - cost) / price * 100).toFixed(1) : '0';

  useEffect(() => {
    if (isEditing && editProduct) {
      // Fill form with edit data
      Object.entries(editProduct).forEach(([key, value]) => {
        if (key in editProduct) {
          setValue(key as keyof ProductFormData, value);
        }
      });
    } else {
      // Reset form for new product
      reset({
        stock: 0,
        price: 0,
        cost: 0,
        min_stock: 5,
        max_stock: 100,
        reorder_point: 10
      });
    }
  }, [isEditing, editProduct, setValue, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      let savedProduct: Product;
      
      if (isEditing && editProduct) {
        savedProduct = await productService.updateProduct(editProduct.id, data);
        toast.success('Producto actualizado exitosamente');
      } else {
        savedProduct = await productService.createProduct(data);
        toast.success('Producto creado exitosamente');
      }
      
      onProductSaved?.(savedProduct);
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    setValue('sku', `PRD${timestamp}${random}`);
  };

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
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-nequi-purple-dark to-nequi-pink p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {isEditing ? 'Editar Producto' : 'Agregar Producto'}
                      </h2>
                      <p className="text-sm text-white/80">
                        {isEditing ? 'Modifica los datos del producto' : 'Registra un nuevo producto en el inventario'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Container */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                  {/* Form Fields */}
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del producto *
                          </label>
                          <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              {...register('name', { 
                                required: 'El nombre es requerido',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                              })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                              placeholder="Ej: Aceite de cocina"
                              disabled={isSubmitting}
                            />
                          </div>
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU *
                          </label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1">
                              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                {...register('sku', { 
                                  required: 'El SKU es requerido',
                                  pattern: {
                                    value: /^[A-Za-z0-9-_]+$/,
                                    message: 'Solo letras, números, guiones y guiones bajos'
                                  }
                                })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                                placeholder="Ej: PRD001"
                                disabled={isSubmitting}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={generateSKU}
                              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium"
                              disabled={isSubmitting}
                            >
                              Generar
                            </button>
                          </div>
                          {errors.sku && (
                            <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría *
                          </label>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                              {...register('category', { required: 'La categoría es requerida' })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all appearance-none"
                              disabled={isSubmitting}
                            >
                              <option value="">Seleccionar categoría</option>
                              <option value="Aceites">Aceites</option>
                              <option value="Cuidado Personal">Cuidado Personal</option>
                              <option value="Alimentación">Alimentación</option>
                              <option value="Bebidas">Bebidas</option>
                              <option value="Limpieza">Limpieza</option>
                              <option value="Electrónicos">Electrónicos</option>
                              <option value="Otros">Otros</option>
                            </select>
                          </div>
                          {errors.category && (
                            <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                              {...register('description')}
                              rows={3}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all resize-none"
                              placeholder="Descripción del producto..."
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio de costo
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              {...register('cost', { 
                                min: { value: 0, message: 'El costo debe ser mayor a 0' },
                                valueAsNumber: true
                              })}
                              type="number"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                              placeholder="0.00"
                              disabled={isSubmitting}
                            />
                          </div>
                          {errors.cost && (
                            <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio de venta *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              {...register('price', { 
                                required: 'El precio es requerido',
                                min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
                                valueAsNumber: true
                              })}
                              type="number"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                              placeholder="0.00"
                              disabled={isSubmitting}
                            />
                          </div>
                          {errors.price && (
                            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Margen de ganancia
                          </label>
                          <div className="w-full px-4 py-3 bg-gray-50 rounded-xl border">
                            <span className={`font-medium ${parseFloat(margin) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {margin}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inventory */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock actual *
                          </label>
                          <input
                            {...register('stock', { 
                              required: 'El stock es requerido',
                              min: { value: 0, message: 'El stock debe ser mayor o igual a 0' },
                              valueAsNumber: true
                            })}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                            placeholder="0"
                            disabled={isSubmitting}
                          />
                          {errors.stock && (
                            <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock mínimo
                          </label>
                          <div className="relative">
                            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-yellow-500" />
                            <input
                              {...register('min_stock', { 
                                min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                                valueAsNumber: true
                              })}
                              type="number"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                              placeholder="5"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock máximo
                          </label>
                          <input
                            {...register('max_stock', { 
                              min: { value: 1, message: 'Debe ser mayor a 0' },
                              valueAsNumber: true
                            })}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                            placeholder="100"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Punto de reorden
                          </label>
                          <input
                            {...register('reorder_point', { 
                              min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                              valueAsNumber: true
                            })}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                            placeholder="10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Código de barras
                          </label>
                          <div className="relative">
                            <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              {...register('barcode')}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                              placeholder="Ej: 123456789012"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Proveedor
                          </label>
                          <div className="relative">
                            <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              {...register('supplier')}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                              placeholder="Nombre del proveedor"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ubicación
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              {...register('location')}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                              placeholder="Ej: Estante A-1"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-6 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-gradient-to-r from-nequi-pink to-nequi-purple text-white rounded-xl hover:from-nequi-pink-dark hover:to-nequi-purple-dark transition-all disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{isEditing ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};