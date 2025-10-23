# MercaloPOS Dashboard

Dashboard profesional y moderno construido con React 18, Vite, TypeScript y Tailwind CSS.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS con modo dark/light
- **Framer Motion** - Animaciones suaves
- **Recharts** - Gráficos y visualizaciones
- **Zustand** - Gestión de estado global
- **React Router DOM** - Navegación entre páginas
- **Lucide React** - Iconos modernos

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Card, Input)
│   ├── charts/          # Gráficos con Recharts
│   ├── layout/          # Sidebar, Header, Layout
│   └── common/          # Componentes reutilizables
├── pages/
│   ├── Dashboard/       # Página principal con métricas
│   ├── Reports/         # Reportes financieros
│   ├── Clients/         # Gestión de clientes
│   ├── Calendar/        # Calendario de eventos
│   └── Settings/        # Configuraciones
├── store/               # Estado global con Zustand
├── hooks/               # Hooks personalizados
├── routes/              # Configuración de rutas
├── utils/               # Utilidades y helpers
├── assets/              # Recursos estáticos
├── App.tsx              # Componente principal
└── main.tsx             # Punto de entrada
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js v20.19+ o v22.12+ (recomendado)
- npm o yarn

### Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

3. **Construir para producción:**
```bash
npm run build
```

4. **Previsualizar build de producción:**
```bash
npm run preview
```

## ✨ Características

### 🎨 Diseño y UI
- **Diseño moderno y minimalista** con gradientes suaves
- **Modo dark/light** integrado
- **Responsive design** para desktop, tablet y móvil
- **Animaciones fluidas** con Framer Motion
- **Tipografía profesional** (Inter y Poppins)

### 🧭 Navegación
- **Sidebar colapsable** con animaciones
- **Navegación por pestañas** entre páginas
- **Menú móvil** con backdrop
- **Transiciones suaves** entre vistas

### 📊 Dashboard
- **Tarjetas de métricas** con gradientes
- **Gráficos interactivos** (barras, líneas, pie)
- **Tabla de clientes** con estados
- **Indicadores de rendimiento** con cambios porcentuales

### 🔧 Funcionalidades
- **Estado global persistente** con Zustand
- **Tema dark/light** guardado en localStorage
- **Sidebar responsive** que se adapta al tamaño de pantalla
- **Búsqueda global** en el header
- **Notificaciones** con badge
- **Perfil de usuario** integrado

## 🎯 Páginas Disponibles

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Dashboard | Página principal con métricas y gráficos |
| `/reports` | Reports | Reportes financieros |
| `/clients` | Clients | Gestión de clientes |
| `/calendar` | Calendar | Calendario de eventos |
| `/settings` | Settings | Configuraciones |

## 🚀 Comandos npm

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Build
npm run build        # Construir para producción
npm run preview      # Previsualizar build

# Linting
npm run lint         # Ejecutar ESLint
```

## 📦 Dependencias Principales

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "framer-motion": "^11.x",
  "recharts": "^2.x",
  "zustand": "^4.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x",
  "clsx": "^2.x"
}
```

---

**Desarrollado con ❤️ usando React + Vite + TypeScript**
