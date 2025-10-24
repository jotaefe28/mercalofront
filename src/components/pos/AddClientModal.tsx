import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: (client: any) => void;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  document: string;
  documentType: 'CC' | 'CE' | 'NIT';
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClientFormData>();

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newClient = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        points: 0
      };

      toast.success('Cliente agregado exitosamente');
      onClientAdded?.(newClient);
      reset();
      onClose();
    } catch (error) {
      toast.error('Error al agregar cliente');
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-nequi-purple-dark to-nequi-pink p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Agregar Cliente</h2>
                      <p className="text-sm text-white/80">Registra un nuevo cliente</p>
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
                  <div className="flex-1 p-6 space-y-5 overflow-y-auto">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('name', { 
                            required: 'El nombre es requerido',
                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="Ej: Juan Pérez"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('email', { 
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Email inválido'
                            }
                          })}
                          type="email"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="ejemplo@correo.com"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('phone', { 
                            required: 'El teléfono es requerido',
                            pattern: {
                              value: /^[0-9+\s-()]+$/,
                              message: 'Formato de teléfono inválido'
                            }
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="Ej: +57 300 123 4567"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo
                        </label>
                        <select
                          {...register('documentType')}
                          className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          disabled={isSubmitting}
                        >
                          <option value="CC">CC</option>
                          <option value="CE">CE</option>
                          <option value="NIT">NIT</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de documento
                        </label>
                        <input
                          {...register('document', { 
                            pattern: {
                              value: /^[0-9-]+$/,
                              message: 'Solo números y guiones'
                            }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="123456789"
                          disabled={isSubmitting}
                        />
                        {errors.document && (
                          <p className="text-red-500 text-sm mt-1">{errors.document.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Dirección */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('address')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="Calle 123 #45-67"
                          disabled={isSubmitting}
                        />
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
                          <span>Guardar Cliente</span>
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