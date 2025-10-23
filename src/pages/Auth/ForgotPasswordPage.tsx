import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { usePasswordReset } from '@/hooks';

// Validation schema
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('El correo electrónico es requerido')
    .email('Debe ser un correo electrónico válido'),
});

interface FormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { requestReset, isLoading, error } = usePasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    const success = await requestReset(data.email);
    if (success) {
      setIsSuccess(true);
    }
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
          <p className="text-nequi-purple-light">
            {isSuccess ? 'Revisa tu correo electrónico' : 'Recupera tu contraseña'}
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
        >
          {!isSuccess ? (
            <>
              {/* Instructions */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">¿Olvidaste tu contraseña?</h2>
                <p className="text-white/80 text-sm">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

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

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-white font-medium">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                      placeholder="tu@correo.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-nequi-pink hover:bg-nequi-pink-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  {(isSubmitting || isLoading) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Enlace de Recuperación</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">¡Correo Enviado!</h2>
              <p className="text-white/80 text-sm mb-6">
                Te hemos enviado un enlace de recuperación a{' '}
                <span className="font-medium text-nequi-pink">{getValues('email')}</span>.
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                <p className="text-blue-100 text-sm">
                  <strong>Nota:</strong> Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 mb-4"
              >
                Enviar Nuevamente
              </button>
            </motion.div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-nequi-pink hover:text-nequi-pink-light font-medium transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
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