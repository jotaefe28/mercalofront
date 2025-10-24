import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Save, 
  Loader2, 
  Plus,
  Minus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { clientService } from '@/services';
import type { Client, ClientPointsTransaction } from '@/types';

interface PointsAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onPointsAdjusted?: (transaction: ClientPointsTransaction) => void;
}

interface PointsFormData {
  points: number;
  description: string;
  type: 'add' | 'subtract';
}

export const PointsAdjustmentModal: React.FC<PointsAdjustmentModalProps> = ({
  isOpen,
  onClose,
  client,
  onPointsAdjusted
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PointsFormData>({
    defaultValues: {
      points: 0,
      type: 'add',
      description: ''
    }
  });

  const adjustmentType = watch('type');
  const pointsValue = watch('points');

  const onSubmit = async (data: PointsFormData) => {
    setIsSubmitting(true);
    
    try {
      const adjustmentPoints = data.type === 'subtract' ? -Math.abs(data.points) : Math.abs(data.points);
      
      const transaction = await clientService.adjustClientPoints(
        client.id,
        adjustmentPoints,
        data.description
      );
      
      toast.success(`Puntos ${data.type === 'add' ? 'agregados' : 'descontados'} exitosamente`);
      onPointsAdjusted?.(transaction);
      reset();
      onClose();
    } catch (error) {
      console.error('Error adjusting points:', error);
      toast.error(error instanceof Error ? error.message : 'Error al ajustar puntos');
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

  const getNewPointsBalance = () => {
    const adjustment = adjustmentType === 'subtract' ? -Math.abs(pointsValue) : Math.abs(pointsValue);
    return Math.max(0, client.points + adjustment);
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-nequi-purple-dark to-nequi-pink p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Ajustar Puntos</h2>
                      <p className="text-sm text-white/80">
                        Cliente: {client.name} {client.last_name}
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
                  {/* Current Points Display */}
                  <div className="p-6 bg-gray-50 border-b">
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Puntos Actuales</p>
                        <div className="flex items-center justify-center mt-2">
                          <Star className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="text-2xl font-bold text-gray-900">
                            {client.points.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                          {adjustmentType === 'add' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Nuevos Puntos</p>
                        <div className="flex items-center justify-center mt-2">
                          <Star className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className={`text-2xl font-bold ${
                            getNewPointsBalance() > client.points ? 'text-green-600' : 
                            getNewPointsBalance() < client.points ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {getNewPointsBalance().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Adjustment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de ajuste *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setValue('type', 'add')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            adjustmentType === 'add'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Agregar Puntos</span>
                          </div>
                          <p className="text-xs mt-1 opacity-75">
                            Incrementar saldo de puntos
                          </p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setValue('type', 'subtract')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            adjustmentType === 'subtract'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Minus className="w-5 h-5" />
                            <span className="font-medium">Descontar Puntos</span>
                          </div>
                          <p className="text-xs mt-1 opacity-75">
                            Reducir saldo de puntos
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Points Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad de puntos *
                      </label>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('points', { 
                            required: 'La cantidad es requerida',
                            min: { value: 1, message: 'Debe ser mayor a 0' },
                            max: adjustmentType === 'subtract' 
                              ? { value: client.points, message: 'No puede exceder los puntos actuales' }
                              : undefined,
                            valueAsNumber: true
                          })}
                          type="number"
                          min="1"
                          max={adjustmentType === 'subtract' ? client.points : undefined}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="Ej: 100"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.points && (
                        <p className="text-red-500 text-xs mt-1">{errors.points.message}</p>
                      )}
                      {adjustmentType === 'subtract' && (
                        <p className="text-gray-500 text-xs mt-1">
                          Máximo disponible: {client.points.toLocaleString()} puntos
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo del ajuste *
                      </label>
                      <textarea
                        {...register('description', { 
                          required: 'El motivo es requerido',
                          minLength: { value: 5, message: 'Mínimo 5 caracteres' }
                        })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all resize-none"
                        placeholder="Explica el motivo del ajuste de puntos..."
                        disabled={isSubmitting}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Quick Suggestions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sugerencias rápidas
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {adjustmentType === 'add' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Bonificación por lealtad del cliente')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Bonificación por lealtad
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Compensación por inconveniente')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Compensación por inconveniente
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Promoción especial')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Promoción especial
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Regalo de cumpleaños')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Regalo de cumpleaños
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Corrección de error en sistema')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Corrección de error
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Ajuste por devolución')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Ajuste por devolución
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Puntos duplicados por error')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Puntos duplicados
                            </button>
                            <button
                              type="button"
                              onClick={() => setValue('description', 'Expiración manual')}
                              className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Expiración manual
                            </button>
                          </>
                        )}
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
                      className={`px-6 py-2 text-white rounded-xl transition-all disabled:opacity-50 flex items-center space-x-2 ${
                        adjustmentType === 'add'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>
                            {adjustmentType === 'add' ? 'Agregar Puntos' : 'Descontar Puntos'}
                          </span>
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