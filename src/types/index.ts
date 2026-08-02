export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface Product {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  brand?: string | null;
  price: number | string;
  original_price?: number | string | null;
  stock: number;
  stock_refurbished?: number;
  thumbnail?: string | null;
  short_description?: string | null;
  specs?: any; // JSON or parsed object
  is_flash_sale?: number | boolean;
  deleted_at?: string | null;
  category_name?: string;
  category_slug?: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  total_price: number | string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  note?: string | null;
  delivery_method?: 'pickup' | 'shipping';
  discount_applied?: number | string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number | string;
  product_name?: string;
  product_thumbnail?: string | null;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

export interface WarrantyTicket {
  id: number;
  order_item_id: number;
  serial_number: string;
  issue_description: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  created_at: string;
  updated_at?: string;
}
