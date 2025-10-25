import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Save, Loader2, Calendar, IdCard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { clientService } from '@/services';
import type { CreateClientData, Client } from '@/types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: (client: Client) => void;
}

interface ClientFormData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  birth_date?: string;
  // Campos auxiliares para el formulario
  document_type?: 'cedula' | 'nit' | 'pasaporte' | 'cedula_extranjeria';
  document_number?: string;
  last_name?: string;
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
  } = useForm<ClientFormData>({
    defaultValues: {
      document_type: 'cedula'
    }
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    
    try {
      // Combinar los campos para crear el documento y nombre completo
      const clientData: CreateClientData = {
        name: `${data.name} ${data.last_name || ''}`.trim(),
        email: data.email,
        phone: data.phone,
        document: data.document_number || '',
        address: data.address,
        city: data.city,
        birth_date: data.birth_date
      };
      
      const newClient = await clientService.createClient(clientData);
      
      toast.success('Cliente agregado exitosamente');
      onClientAdded?.(newClient);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar cliente');
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
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
                      <p className="text-sm text-white/80">Registra un nuevo cliente en el sistema</p>
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
                    {/* Documento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de documento *
                        </label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            {...register('document_type', { required: 'Tipo de documento requerido' })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all appearance-none"
                            disabled={isSubmitting}
                          >
                            <option value="cedula">Cédula</option>
                            <option value="nit">NIT</option>
                            <option value="pasaporte">Pasaporte</option>
                            <option value="cedula_extranjeria">Cédula de Extranjería</option>
                          </select>
                        </div>
                        {errors.document_type && (
                          <p className="text-red-500 text-xs mt-1">{errors.document_type.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de documento *
                        </label>
                        <input
                          {...register('document_number', { 
                            required: 'Número de documento requerido',
                            pattern: {
                              value: /^[0-9A-Za-z-]+$/,
                              message: 'Solo números, letras y guiones'
                            }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="Ej: 12345678"
                          disabled={isSubmitting}
                        />
                        {errors.document_number && (
                          <p className="text-red-500 text-xs mt-1">{errors.document_number.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Nombres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombres *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('name', { 
                              required: 'Los nombres son requeridos',
                              minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                            placeholder="Ej: Juan Carlos"
                            disabled={isSubmitting}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellidos *
                        </label>
                        <input
                          {...register('last_name', { 
                            required: 'Los apellidos son requeridos',
                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="Ej: Pérez García"
                          disabled={isSubmitting}
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                value: /^\+?[0-9\s-()]+$/,
                                message: 'Formato de teléfono inválido'
                              }
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                            placeholder="Ej: +573001234567"
                            disabled={isSubmitting}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('email', { 
                              pattern: {
                                value: /^\S+@\S+\.\S+$/,
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
                          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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

                    {/* Ubicación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad
                        </label>
                        <input
                          {...register('city')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                          placeholder="Ej: Bogotá"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Fecha de nacimiento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de nacimiento
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('birth_date')}
                          type="date"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
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