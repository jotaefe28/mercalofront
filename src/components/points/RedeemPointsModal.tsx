import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Gift, Search, Calculator } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { pointsService } from '../../services';
import type { Client, PointsConfig } from '../../types';
import { useNotifications } from '../../hooks';

interface RedeemPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: PointsConfig;
  onPointsRedeemed: () => void;
}

interface RedemptionFormData {
  document_number: string;
  points_to_redeem: number;
}

const RedeemPointsModal: React.FC<RedeemPointsModalProps> = ({
  isOpen,
  onClose,
  config,
  onPointsRedeemed
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [calculatedValue, setCalculatedValue] = useState(0);
  const { addNotification } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<RedemptionFormData>();

  const pointsToRedeem = watch('points_to_redeem');

  useEffect(() => {
    if (pointsToRedeem && config) {
      setCalculatedValue(pointsToRedeem * config.points_value_in_pesos);
    } else {
      setCalculatedValue(0);
    }
  }, [pointsToRedeem, config]);

  const searchClient = async (documentNumber: string) => {
    if (!documentNumber.trim()) return;

    try {
      setIsSearching(true);
      const client = await pointsService.searchClientByDocument(documentNumber);
      setSelectedClient(client);
    } catch (error) {
      console.error('Error searching client:', error);
      setSelectedClient(null);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Cliente no encontrado'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: RedemptionFormData) => {
    if (!selectedClient) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Debe buscar y seleccionar un cliente primero'
      });
      return;
    }

    if (data.points_to_redeem > selectedClient.points) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'El cliente no tiene suficientes puntos'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await pointsService.redeemPoints(
        selectedClient.id, 
        data.points_to_redeem,
        `Redención de ${data.points_to_redeem} puntos por $${calculatedValue.toLocaleString()}`
      );
      
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: `Se redimieron ${data.points_to_redeem} puntos por $${calculatedValue.toLocaleString()}`
      });
      
      onPointsRedeemed();
      handleClose();
    } catch (error) {
      console.error('Error redeeming points:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al redimir los puntos'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedClient(null);
    setCalculatedValue(0);
    onClose();
  };

  const handleDocumentSearch = () => {
    const documentNumber = watch('document_number');
    searchClient(documentNumber);
  };

  const handleMaxPoints = () => {
    if (selectedClient) {
      setValue('points_to_redeem', selectedClient.points);
    }
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Redimir Puntos
                </h2>
                <p className="text-sm text-gray-500">
                  Procesa la redención de puntos del cliente
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
              {/* Client Search */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Buscar Cliente
                </h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de documento
                    </label>
                    <Input
                      type="text"
                      {...register('document_number', {
                        required: 'Este campo es requerido'
                      })}
                      placeholder="Ingrese el número de documento"
                    />
                    {errors.document_number && (
                      <p className="text-sm text-red-600 mt-1">{errors.document_number.message}</p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleDocumentSearch}
                      disabled={isSearching}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSearching ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Buscando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Buscar
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              {selectedClient && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Información del Cliente</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nombre:</span>
                      <p className="font-medium">{selectedClient.name} {selectedClient.last_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Documento:</span>
                      <p className="font-medium">{selectedClient.document_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Puntos disponibles:</span>
                      <p className="font-medium text-blue-600 text-lg">{selectedClient.points.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor estimado:</span>
                      <p className="font-medium text-green-600 text-lg">
                        ${(selectedClient.points * (config?.points_value_in_pesos || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Redemption Details */}
              {selectedClient && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Detalles de Redención
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Puntos a redimir
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max={selectedClient.points}
                          {...register('points_to_redeem', {
                            required: 'Este campo es requerido',
                            min: { value: 1, message: 'Debe redimir al menos 1 punto' },
                            max: { 
                              value: selectedClient.points, 
                              message: 'No puede redimir más puntos de los disponibles' 
                            }
                          })}
                          placeholder="Cantidad de puntos"
                        />
                        {errors.points_to_redeem && (
                          <p className="text-sm text-red-600 mt-1">{errors.points_to_redeem.message}</p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleMaxPoints}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Máximo
                        </Button>
                      </div>
                    </div>

                    {/* Calculation Display */}
                    {pointsToRedeem > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="w-5 h-5 text-green-600" />
                          <h4 className="font-medium text-green-900">Cálculo de Redención</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-green-700">Puntos a redimir:</span>
                            <p className="font-medium text-lg">{pointsToRedeem?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-green-700">Valor en pesos:</span>
                            <p className="font-medium text-lg text-green-600">
                              ${calculatedValue.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700">Puntos restantes:</span>
                            <p className="font-medium">
                              {(selectedClient.points - (pointsToRedeem || 0)).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700">Tasa de conversión:</span>
                            <p className="font-medium">
                              ${config?.points_value_in_pesos} por punto
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                disabled={isLoading || !selectedClient || !pointsToRedeem}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Redimir Puntos
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

export default RedeemPointsModal;