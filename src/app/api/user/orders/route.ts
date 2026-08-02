import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Thiếu số điện thoại' }, { status: 400 });
    }

    // Lấy danh sách đơn hàng của khách theo SĐT
    const [orders]: any = await pool.query(
      `SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC`,
      [phone]
    );

    // Với mỗi đơn hàng, lấy thêm các sản phẩm trong đó
    const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
      const [items]: any = await pool.query(
        `SELECT oi.*, p.name as product_name, p.thumbnail as product_image, p.brand as product_brand
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items };
    }));

    return NextResponse.json(ordersWithItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
