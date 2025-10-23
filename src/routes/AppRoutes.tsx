import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Reports } from '@/pages/Reports/Reports';
import { Clients } from '@/pages/Clients/Clients';
import { Calendar } from '@/pages/Calendar/Calendar';
import { Settings } from '@/pages/Settings/Settings';

export const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Router>
  );
};