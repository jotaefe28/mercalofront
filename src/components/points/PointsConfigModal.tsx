import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Save, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { pointsService } from '../../services';
import type { PointsConfig } from '../../types';
import { useNotifications } from '../../hooks';

interface PointsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: PointsConfig;
  onConfigUpdate: (config: PointsConfig) => void;
}

interface ConfigFormData {
  points_per_peso: number;
  min_purchase_for_points: number;
  points_expiry_days: number;
  max_points_per_transaction: number;
  points_value_in_pesos: number;
}

const PointsConfigModal: React.FC<PointsConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ConfigFormData>();

  useEffect(() => {
    if (config) {
      setValue('points_per_peso', config.points_per_peso);
      setValue('min_purchase_for_points', config.min_purchase_for_points);
      setValue('points_expiry_days', config.points_expiry_days);
      setValue('max_points_per_transaction', config.max_points_per_transaction);
      setValue('points_value_in_pesos', config.points_value_in_pesos);
    }
  }, [config, setValue]);

  const onSubmit = async (data: ConfigFormData) => {
    try {
      setIsLoading(true);
      
      const updatedConfig: PointsConfig = {
        ...data,
        is_active: config?.is_active ?? true,
        id: config?.id ?? '1',
        created_at: config?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await pointsService.updatePointsConfig(updatedConfig);
      onConfigUpdate(updatedConfig);
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Configuración de puntos actualizada exitosamente'
      });
      onClose();
    } catch (error) {
      console.error('Error updating points config:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar la configuración'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Configuración de Puntos
                </h2>
                <p className="text-sm text-gray-500">
                  Gestiona los parámetros del sistema de puntos
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {/* Acumulación de Puntos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Acumulación de Puntos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puntos por peso gastado
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('points_per_peso', {
                        required: 'Este campo es requerido',
                        min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                      })}
                      placeholder="ej: 1"
                    />
                    {errors.points_per_peso && (
                      <p className="text-sm text-red-600 mt-1">{errors.points_per_peso.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compra mínima para puntos
                    </label>
                    <Input
                      type="number"
                      min="0"
                      {...register('min_purchase_for_points', {
                        required: 'Este campo es requerido',
                        min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                      })}
                      placeholder="ej: 10000"
                    />
                    {errors.min_purchase_for_points && (
                      <p className="text-sm text-red-600 mt-1">{errors.min_purchase_for_points.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Días para expiración
                    </label>
                    <Input
                      type="number"
                      min="1"
                      {...register('points_expiry_days', {
                        required: 'Este campo es requerido',
                        min: { value: 1, message: 'Debe ser mayor a 0' }
                      })}
                      placeholder="ej: 365"
                    />
                    {errors.points_expiry_days && (
                      <p className="text-sm text-red-600 mt-1">{errors.points_expiry_days.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Máximo puntos por transacción
                    </label>
                    <Input
                      type="number"
                      min="0"
                      {...register('max_points_per_transaction', {
                        required: 'Este campo es requerido',
                        min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                      })}
                      placeholder="ej: 1000"
                    />
                    {errors.max_points_per_transaction && (
                      <p className="text-sm text-red-600 mt-1">{errors.max_points_per_transaction.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Redención de Puntos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Redención de Puntos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor en pesos por punto
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('points_value_in_pesos', {
                        required: 'Este campo es requerido',
                        min: { value: 0, message: 'Debe ser mayor a 0' }
                      })}
                      placeholder="ej: 10"
                    />
                    {errors.points_value_in_pesos && (
                      <p className="text-sm text-red-600 mt-1">{errors.points_value_in_pesos.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Información</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los puntos se acumulan automáticamente en cada venta</li>
                  <li>• Los puntos expiran después del número de días configurado</li>
                  <li>• El máximo de puntos por transacción limita la acumulación</li>
                  <li>• Los puntos se pueden redimir según el valor configurado</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Guardar Configuración
                  </div>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PointsConfigModal;