import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Smartphone } from 'lucide-react';

// Mock data con temática financiera
const salesData = [
  { name: 'Ene', transferencias: 4000, pagos: 2400 },
  { name: 'Feb', transferencias: 3000, pagos: 1398 },
  { name: 'Mar', transferencias: 2000, pagos: 9800 },
  { name: 'Abr', transferencias: 2780, pagos: 3908 },
  { name: 'May', transferencias: 1890, pagos: 4800 },
  { name: 'Jun', transferencias: 2390, pagos: 3800 },
];

const pieData = [
  { name: 'Transferencias', value: 400 },
  { name: 'Pagos de servicios', value: 300 },
  { name: 'Recargas', value: 300 },
  { name: 'Otros', value: 200 },
];

const NEQUI_COLORS = ['#E91E63', '#D81B60', '#AD1457', '#F8BBD9'];

const recentTransactions = [
  { id: 1, name: 'Juan Pérez', email: 'Transferencia recibida', amount: '+$1,230,000', status: 'completed' },
  { id: 2, name: 'María García', email: 'Pago de servicios', amount: '-$89,000', status: 'pending' },
  { id: 3, name: 'Carlos López', email: 'Transferencia enviada', amount: '-$2,150,000', status: 'completed' },
  { id: 4, name: 'Ana Martínez', email: 'Recarga telefónica', amount: '-$67,500', status: 'completed' },
];

const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  gradient: string;
}> = ({ title, value, change, changeType, icon, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="relative overflow-hidden border-0 shadow-nequi bg-white dark:bg-gradient-nequi-purple">
      <div className={`absolute inset-0 ${gradient} opacity-10`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-nequi-pink-light font-raleway">
          {title}
        </CardTitle>
        <div className={`${gradient} p-3 rounded-xl shadow-nequi animate-float`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-gray-900 dark:text-white font-raleway">
          {value}
        </div>
        <div className="flex items-center space-x-1 text-xs mt-2">
          {changeType === 'positive' ? (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={`font-raleway font-medium ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-gray-500 dark:text-nequi-pink-light font-raleway">desde el mes pasado</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gradient-nequi font-raleway">
          Dashboard Financiero
        </h1>
        <p className="text-gray-600 dark:text-nequi-pink-light mt-2 font-raleway">
          Tu dinero siempre disponible, seguro y bajo control
        </p>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Saldo Disponible"
          value="$2,345,678"
          change="+20.1%"
          changeType="positive"
          icon={<DollarSign className="h-5 w-5 text-white" />}
          gradient="bg-gradient-nequi"
        />
        <MetricCard
          title="Usuarios Activos"
          value="2,350"
          change="+15.3%"
          changeType="positive"
          icon={<Users className="h-5 w-5 text-white" />}
          gradient="bg-gradient-nequi-purple"
        />
        <MetricCard
          title="Transacciones"
          value="1,234"
          change="+12.5%"
          changeType="positive"
          icon={<Smartphone className="h-5 w-5 text-white" />}
          gradient="bg-gradient-nequi-accent"
        />
        <MetricCard
          title="Crecimiento"
          value="23.4%"
          change="-2.1%"
          changeType="negative"
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          gradient="bg-gradient-nequi"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-nequi bg-white dark:bg-gradient-nequi-purple border-0">
            <CardHeader>
              <CardTitle className="font-raleway text-gray-900 dark:text-white">Actividad Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E91E63" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#2D1B69',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="transferencias" fill="#E91E63" radius={4} />
                  <Bar dataKey="pagos" fill="#D81B60" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-nequi bg-white dark:bg-gradient-nequi-purple border-0">
            <CardHeader>
              <CardTitle className="font-raleway text-gray-900 dark:text-white">Distribución de Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={NEQUI_COLORS[index % NEQUI_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#2D1B69',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="shadow-nequi bg-white dark:bg-gradient-nequi-purple border-0">
          <CardHeader>
            <CardTitle className="font-raleway text-gray-900 dark:text-white">Últimas Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-nequi-purple/20">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-nequi-pink-light font-raleway">
                      Usuario
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-nequi-pink-light font-raleway">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-nequi-pink-light font-raleway">
                      Monto
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-nequi-pink-light font-raleway">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="border-b border-gray-100 dark:border-nequi-purple/10 hover:bg-gray-50 dark:hover:bg-nequi-purple/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white font-raleway">
                          {transaction.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-nequi-pink-light font-raleway">
                        {transaction.email}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white font-raleway">
                        <span className={transaction.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                          {transaction.amount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium font-raleway ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}
                        >
                          {transaction.status === 'completed' ? 'Completada' : 
                           transaction.status === 'pending' ? 'Pendiente' : 'Inactiva'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};