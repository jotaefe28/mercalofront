import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts';
import type { LoginCredentials } from '@/types';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('El correo electrónico es requerido')
    .email('Debe ser un correo electrónico válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: yup.boolean().default(false),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('🔍 LoginPage - Starting login process');
      console.log('🌐 LoginPage - Environment variables:', {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        NODE_ENV: import.meta.env.NODE_ENV
      });
      console.log('📧 LoginPage - Form data:', { 
        email: data.email, 
        rememberMe: data.rememberMe 
      });

      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      };
      
      console.log('🚀 LoginPage - Calling auth context login...');
      await login(credentials);
      
      console.log('✅ LoginPage - Login successful, navigating...');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('❌ LoginPage - Login failed:', error);
      // Error handling is done in the context
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
          <p className="text-nequi-purple-light">Inicia sesión en tu cuenta</p>
        </motion.div>

        {/* Login Form */}
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

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-white font-medium">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-nequi-pink focus:border-transparent transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/30 text-nequi-pink focus:ring-nequi-pink focus:ring-offset-0 bg-white/20"
                />
                <span className="ml-2 text-white text-sm">Recordarme</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-nequi-pink hover:text-nequi-pink-light transition-colors text-sm"
              >
                ¿Olvidaste tu contraseña?
              </Link>
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
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-nequi-pink hover:text-nequi-pink-light font-medium transition-colors"
              >
                Regístrate aquí
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