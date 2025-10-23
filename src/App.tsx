import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts';
import { AppRoutes } from './routes/AppRoutes';
import { SessionWarningModal } from './components/ui/SessionWarningModal';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <SessionWarningModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2D1B69',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(233, 30, 99, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#E91E63',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
