// Product and Cart Types
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  image?: string;
  description?: string;
  barcode?: string;
  cost?: number;
  supplier?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  image?: string;
  description?: string;
  barcode?: string;
  cost?: number;
  supplier?: string;
  min_stock?: number;
  max_stock?: number;
  reorder_point?: number;
  location?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductFilters {
  search?: string;
  category?: string;
  supplier?: string;
  low_stock?: boolean;
  out_of_stock?: boolean;
  min_price?: number;
  max_price?: number;
}

export interface ProductStats {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  categories_count: number;
  avg_price: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  points: number;
  totalPurchases: number;
  lastPurchase?: Date;
}

export interface Sale {
  id: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  cashier: string;
  pointsEarned: number;
  pointsUsed: number;
}

export const PaymentMethod = {
  CASH: 'cash',
  CARD: 'card',
  DIGITAL: 'digital',
  POINTS: 'points',
  MIXED: 'mixed'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface InventoryItem extends Product {
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location?: string;
  lastRestocked?: Date;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: Array<{
    product: Product;
    quantitySold: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Record<PaymentMethod, number>;
  salesByHour: Array<{
    hour: number;
    sales: number;
    revenue: number;
  }>;
}