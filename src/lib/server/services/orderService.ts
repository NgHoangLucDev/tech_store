import 'server-only';
import pool from '@/lib/server/db';
import { Order, OrderItem } from '@/types';

export interface CreateOrderParams {
  userId: number | null;
  items: any[];
  totalPrice: number;
  shippingInfo: {
    address: string;
    phone: string;
    name: string;
    note?: string;
  };
  vatInfo?: {
    mst: string;
    companyName: string;
    companyAddress: string;
    email: string;
    contactName?: string;
    contactPhone?: string;
  } | null;
  isTrial?: boolean;
  depositAmount?: number;
}

/**
 * Create a new order with transaction handling
 */
export async function createOrder(params: CreateOrderParams): Promise<number> {
  const { userId, items, totalPrice, shippingInfo, vatInfo, isTrial, depositAmount } = params;
  const hasVat = !!vatInfo;
  
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Tạo order mới
    const [orderResult]: any = await conn.execute(
      `INSERT INTO orders (
        user_id, total_price, status, shipping_address, customer_phone, customer_name, note,
        is_trial, trial_status, trial_expired_at, deposit_amount, deposit_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null, 
        totalPrice, 
        'PENDING', 
        shippingInfo.address || '', 
        shippingInfo.phone || '', 
        shippingInfo.name || '',
        shippingInfo.note || '',
        isTrial ? 1 : 0,
        isTrial ? 'TRIALING' : null,
        isTrial ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null, // 3-day trial
        isTrial ? (depositAmount ?? 0.00) : 0.00,
        isTrial ? 'PENDING_DEPOSIT' : null
      ]
    );
    const orderId = orderResult.insertId;

    // 2. Lưu hóa đơn VAT nếu khách yêu cầu
    if (hasVat && vatInfo) {
      await conn.execute(
        `INSERT INTO order_vat_invoices (
          order_id, mst, company_name, company_address, email, contact_name, contact_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          vatInfo.mst || '',
          vatInfo.companyName || '',
          vatInfo.companyAddress || '',
          vatInfo.email || '',
          vatInfo.contactName || '',
          vatInfo.contactPhone || ''
        ]
      );
    }

    // 3. Lưu chi tiết order_items và cập nhật tồn kho
    for (const item of items) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
      
      await conn.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await conn.commit();
    return orderId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Get detailed order information including items and VAT invoice
 */
export async function getOrderDetails(orderId: number): Promise<any | null> {
  const [orders]: any = await pool.query(
    `SELECT o.*, 
            vi.mst AS vat_mst, 
            vi.company_name AS vat_company_name, 
            vi.company_address AS vat_company_address, 
            vi.email AS vat_email, 
            vi.contact_name AS vat_contact_name, 
            vi.contact_phone AS vat_contact_phone, 
            vi.status AS vat_status,
            CASE WHEN vi.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_vat
     FROM orders o
     LEFT JOIN order_vat_invoices vi ON o.id = vi.order_id
     WHERE o.id = ?`,
    [orderId]
  );

  if (orders.length === 0) {
    return null;
  }

  const order = orders[0];

  const [items]: any = await pool.query(
    `SELECT oi.*, p.name as product_name, p.image as product_image, p.brand as product_brand
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { ...order, items };
}
