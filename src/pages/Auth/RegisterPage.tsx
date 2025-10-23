import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts';
import type { RegisterData } from '@/types';

// Validation schema
const registerSchema = yup.object().shape({
  // User data
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: yup
    .string()
    .required('El correo electrónico es requerido')
    .email('Debe ser un correo electrónico válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  
  // Company data
  companyName: yup
    .string()
    .required('El nombre de la empresa es requerido')
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  businessType: yup
    .string()
    .required('El tipo de negocio es requerido'),
  nit: yup
    .string()
    .required('El NIT es requerido')
    .matches(/^\d+$/, 'El NIT debe contener solo números'),
  address: yup
    .string()
    .required('La dirección es requerida'),
  phone: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^\d+$/, 'El teléfono debe contener solo números'),
  companyEmail: yup
    .string()
    .required('El correo de la empresa es requerido')
    .email('Debe ser un correo electrónico válido'),
});

const businessTypes = [
  'Retail/Tienda',
  'Restaurante',
  'Cafetería',
  'Farmacia',
  'Supermercado',
  'Boutique',
  'Servicios',
  'Otro'
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
  } = useForm<RegisterData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['name', 'email', 'password', 'confirmPassword']
      : ['companyName', 'businessType', 'nit', 'address', 'phone', 'companyEmail'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nequi-purple-light to-nequi-purple-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-nequi-purple-dark">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-raleway mb-2">MercaloPOS</h1>
          <p className="text-nequi-purple-light">Crea tu cuenta empresarial</p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-nequi-pink' : 'bg-white/20'
            } transition-colors`}>
              {currentStep > 1 ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <span className="text-white text-sm font-semibold">1</span>
              )}
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-nequi-pink' : 'bg-white/20'} transition-colors`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-nequi-pink' : 'bg-white/20'
            } transition-colors`}>
              <span className="text-white text-sm font-semibold">2</span>
            </div>
          </div>
        </motion.div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                <span className="text-red-100 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Información Personal</h2>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Nombre Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('name')}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-300 text-sm">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="tu@correo.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Confirmar Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-300 text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-nequi-pink hover:bg-nequi-pink-dark text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {/* Step 2: Company Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Información de la Empresa</h2>

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Nombre de la Empresa</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('companyName')}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-red-300 text-sm">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Tipo de Negocio</label>
                  <select
                    {...register('businessType')}
                    className="w-full py-3 px-4 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                  >
                    <option value="">Selecciona el tipo de negocio</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type} className="text-gray-900">
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="text-red-300 text-sm">{errors.businessType.message}</p>
                  )}
                </div>

                {/* NIT */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">NIT</label>
                  <input
                    {...register('nit')}
                    type="text"
                    className="w-full py-3 px-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                    placeholder="123456789"
                  />
                  {errors.nit && (
                    <p className="text-red-300 text-sm">{errors.nit.message}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Dirección</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('address')}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="Dirección de la empresa"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-300 text-sm">{errors.address.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Teléfono</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="3001234567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-300 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                {/* Company Email */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">Correo de la Empresa</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('companyEmail')}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                  {errors.companyEmail && (
                    <p className="text-red-300 text-sm">{errors.companyEmail.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="flex-1 bg-nequi-pink hover:bg-nequi-pink-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    {(isSubmitting || isLoading) ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <span>Crear Cuenta</span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-nequi-pink hover:text-nequi-pink-light font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-white/60 text-xs">
            © 2024 MercaloPOS. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}