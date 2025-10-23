# MercaloPOS - Sistema de Autenticación

## 🔐 Características de Seguridad

### Autenticación JWT
- **Tokens de acceso**: Tiempo de vida corto (15 minutos)
- **Tokens de refresh**: Tiempo de vida largo (7 días)
- **Rotación automática**: Los tokens se renuevan automáticamente
- **Interceptores HTTP**: Manejo transparente de tokens en todas las peticiones

### Medidas de Seguridad Implementadas

#### 🛡️ Protección CSRF
- Generación automática de tokens CSRF únicos
- Validación en todas las peticiones POST/PUT/DELETE
- Tokens almacenados en sessionStorage

#### 🚦 Rate Limiting
- **Login**: Máximo 5 intentos por 15 minutos
- **Backoff exponencial**: Incrementa el tiempo de espera tras fallos
- **Por usuario**: Limitación individual por dirección de email

#### 🕒 Gestión de Sesiones
- **Timeout automático**: 30 minutos de inactividad
- **Advertencia temprana**: Alerta 5 minutos antes del vencimiento
- **Extensión de sesión**: Renovación automática con actividad del usuario
- **Detección de actividad**: Mouse, teclado, scroll, touch

#### 🧹 Sanitización de Entrada
- **XSS Prevention**: Escape de caracteres HTML peligrosos
- **Script Removal**: Eliminación de tags `<script>` y eventos JavaScript
- **Email Sanitization**: Limpieza de caracteres no válidos en emails

#### 📊 Logging de Seguridad
- **Eventos monitoreados**: Login, logout, fallos de autenticación, expiración de tokens
- **Niveles de severidad**: Low, Medium, High
- **Almacenamiento local**: Últimos 1000 eventos
- **Reportes críticos**: Envío automático al servidor para eventos de alta severidad

#### 🔒 Headers de Seguridad
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Content-Security-Policy**: Política restrictiva de recursos
- **Referrer-Policy**: strict-origin-when-cross-origin

### 🎨 Diseño Nequi

#### Colores Corporativos
- **Primary Pink**: `#E91E63`
- **Primary Purple**: `#2D1B69`
- **Secondary Purple**: `#D81B60`
- **Gradients**: Degradados suaves entre púrpura y rosa

#### Tipografía
- **Font Principal**: Raleway (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

#### Componentes
- **Glassmorphism**: Efectos de vidrio esmerilado
- **Animaciones**: Framer Motion para transiciones suaves
- **Responsive**: Diseño mobile-first

## 📁 Estructura del Proyecto

```
src/
├── types/
│   ├── auth.ts          # Interfaces de autenticación
│   └── index.ts         # Exportaciones de tipos
├── services/
│   ├── authService.ts   # Servicio principal de autenticación
│   ├── securityService.ts # Utilidades de seguridad
│   └── index.ts         # Exportaciones de servicios
├── contexts/
│   ├── AuthContext.tsx  # Context de React para estado global
│   └── index.ts         # Exportaciones de contextos
├── guards/
│   ├── RouteGuards.tsx  # Protección de rutas
│   └── index.ts         # Exportaciones de guards
├── hooks/
│   ├── usePasswordReset.ts # Hook para recuperación de contraseña
│   ├── useAuthCheck.ts  # Hook para verificación de autenticación
│   └── index.ts         # Exportaciones de hooks
├── pages/Auth/
│   ├── LoginPage.tsx    # Página de inicio de sesión
│   ├── RegisterPage.tsx # Página de registro (multi-step)
│   ├── ForgotPasswordPage.tsx # Recuperación de contraseña
│   └── index.ts         # Exportaciones de páginas
└── components/ui/
    └── SessionWarningModal.tsx # Modal de advertencia de sesión
```

## 🚀 Implementación

### Configuración Inicial

1. **Variables de Entorno**:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=MercaloPOS
VITE_APP_VERSION=1.0.0
```

2. **Dependencias**:
```json
{
  "axios": "^1.6.0",
  "react-hot-toast": "^2.4.1",
  "react-hook-form": "^7.47.0",
  "@hookform/resolvers": "^3.3.2",
  "yup": "^1.3.3",
  "framer-motion": "^10.16.4"
}
```

### Uso del Sistema

#### Protección de Rutas
```tsx
<ProtectedRoute requiredRole={['admin', 'manager']}>
  <AdminPanel />
</ProtectedRoute>
```

#### Hook de Autenticación
```tsx
const { user, login, logout, isAuthenticated, isLoading } = useAuth();
```

#### Servicios de Seguridad
```tsx
import { SecurityLogger, CSRFService, RateLimitService } from '@/services';

// Logging de eventos
SecurityLogger.log({
  type: 'login_attempt',
  severity: 'low',
  message: 'User attempting login'
});

// Rate limiting
const result = RateLimitService.checkRateLimit('user@email.com');
if (!result.allowed) {
  // Handle rate limit
}
```

## 🔧 Configuración del Servidor

El frontend espera que el backend implemente los siguientes endpoints:

### Endpoints de Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/forgot-password` - Solicitar recuperación
- `POST /api/auth/reset-password` - Restablecer contraseña
- `POST /api/auth/change-password` - Cambiar contraseña

### Endpoints de Seguridad
- `POST /api/security/logs` - Recibir logs de seguridad

## 🧪 Testing

### Casos de Prueba Implementados

1. **Autenticación**:
   - Login exitoso
   - Login con credenciales incorrectas
   - Rate limiting en login
   - Renovación automática de tokens
   - Logout y limpieza de sesión

2. **Seguridad**:
   - Protección CSRF
   - Sanitización de entrada
   - Validación de headers
   - Expiración de sesión
   - Logging de eventos

3. **UI/UX**:
   - Formularios responsivos
   - Validación en tiempo real
   - Animaciones suaves
   - Feedback visual claro

## 📈 Métricas de Seguridad

El sistema incluye métricas automáticas para:

- **Intentos de login**: Exitosos y fallidos
- **Eventos de seguridad**: CSRF, XSS, rate limiting
- **Sesiones**: Creación, expiración, extensión
- **Tokens**: Emisión, renovación, revocación

## 🔮 Próximas Mejoras

1. **Autenticación de Dos Factores (2FA)**
2. **Single Sign-On (SSO)**
3. **Biometría** (para dispositivos compatibles)
4. **Audit Trail** completo
5. **Detección de Dispositivos** sospechosos
6. **Geolocalización** de login

---

## 📞 Soporte

Para soporte técnico o reportar vulnerabilidades de seguridad:
- Email: security@mercalopos.com
- Sistema de tickets interno

---

**Nota**: Este sistema está diseñado siguiendo las mejores prácticas de seguridad actuales. Se recomienda revisar y actualizar regularmente las medidas de seguridad según evolucionen las amenazas.