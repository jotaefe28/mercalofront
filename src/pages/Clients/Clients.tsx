import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const Clients: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Clientes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestiona tu base de clientes
        </p>
      </div>

      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Aquí podrás gestionar todos tus clientes.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};