import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { ProductCatalog, ShoppingCart, UserMenu, AddClientModal, SalesSummaryModal } from '@/components/pos';
import { Header } from '@/components/layout/Header';
import { NotificationContainer } from '@/components/ui/Notification';
import { useNotifications } from '@/hooks';
import type { Product, CartItem } from '@/types';

// Mock data que simula los productos de la imagen
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Aceite',
    price: 4500,
    stock: 108,
    sku: 'SKU1003',
    category: 'Aceites',
  },
  {
    id: '2',
    name: 'Aceite girasol',
    price: 7600,
    stock: 76,
    sku: 'AC0807',
    category: 'Aceites',
  },
  {
    id: '3',
    name: 'Acondicionador',
    price: 20,
    stock: 16,
    sku: 'AC09381',
    category: 'Cuidado Personal',
  },
  {
    id: '4',
    name: 'Acondicionador',
    price: 1500,
    stock: 10,
    sku: 'AC08831',
    category: 'Cuidado Personal',
  },
  {
    id: '5',
    name: 'Acondicionador',
    price: 24,
    stock: 39,
    sku: 'AC05531',
    category: 'Cuidado Personal',
  },
  {
    id: '6',
    name: 'Acondicionador',
    price: 6,
    stock: 85,
    sku: 'AC06329',
    category: 'Cuidado Personal',
  },
  {
    id: '7',
    name: 'Acondicionador',
    price: 7500,
    stock: 37,
    sku: 'AC07274',
    category: 'Cuidado Personal',
  },
  {
    id: '8',
    name: 'Acondicionador',
    price: 13,
    stock: 42,
    sku: 'AC07451',
    category: 'Cuidado Personal',
  },
];

export const POSPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isSalesSummaryOpen, setIsSalesSummaryOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [clientSearch, setClientSearch] = useState('');
  
  const { notifications, removeNotification, success, error, warning, info } = useNotifications();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mercalo_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mercalo_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    
    // Auto-open cart on mobile when item is added
    if (window.innerWidth < 1280) {
      setIsCartOpen(true);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      setCartItems([]);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      error('Carrito vacío', 'Agrega productos antes de procesar la venta');
      return;
    }

    // Create sale data
    const saleData = {
      items: cartItems,
      total: totalAmount,
      client: clientSearch ? { name: clientSearch, phone: '+57 300 123 4567' } : undefined,
      deliveryMethod: 'store' as const,
      paymentMethod: 'Tarjeta',
      saleNumber: `VTA-${Date.now().toString().slice(-6)}`
    };

    setCurrentSale(saleData);
    setIsSalesSummaryOpen(true);
    
    // Clear cart after successful sale
    setCartItems([]);
    setClientSearch('');
    
    success('¡Venta exitosa!', `Venta ${saleData.saleNumber} procesada correctamente`);
  };

  const handleAddClient = () => {
    setIsAddClientModalOpen(true);
  };

  const handleClientAdded = (client: any) => {
    setClientSearch(client.name);
    success('Cliente agregado', `${client.name} agregado y seleccionado para la venta`);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative"
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 xl:mr-[420px] relative z-10">


        {/* Product Catalog */}
        <div className="flex-1 overflow-hidden">
          <ProductCatalog
            products={mockProducts}
            onAddToCart={handleAddToCart}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClient={handleAddClient}
          />
        </div>
      </div>

      {/* Shopping Cart Sidebar - Desktop grande */}
      <div className="fixed top-0 right-0 h-full z-20 w-[420px] hidden xl:block">
        <ShoppingCart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          isOpen={isCartOpen}
          onToggle={toggleCart}
        />
      </div>

      {/* Shopping Cart Mobile y Tablet */}
      <div className="xl:hidden">
        <ShoppingCart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          isOpen={isCartOpen}
          onToggle={toggleCart}
        />
      </div>

      {/* Modales */}
      <AddClientModal 
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />

      <SalesSummaryModal 
        isOpen={isSalesSummaryOpen}
        onClose={() => setIsSalesSummaryOpen(false)}
        saleData={currentSale}
      />

      {/* Sistema de notificaciones */}
      <NotificationContainer 
        notifications={notifications}
        onClose={removeNotification}
      />
    </motion.div>
  );
};