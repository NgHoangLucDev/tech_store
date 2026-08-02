import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');
  const phone   = searchParams.get('phone');   // xác minh chủ đơn hàng

  if (!orderId || !phone) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
  }

  try {
    // Kiểm tra đơn hàng thuộc về số điện thoại này
    const [orders]: any = await pool.query(
      `SELECT o.id, o.status, o.customer_name, o.customer_phone,
              o.shipping_address, o.packer_name, o.shipper_name, o.shipper_phone,
              o.is_trial, o.trial_status, o.trial_expired_at,
              o.deposit_amount, o.deposit_status,
              o.created_at, o.total_price, o.delivery_method
       FROM orders o
       WHERE o.id = ? AND o.customer_phone = ?`,
      [orderId, phone]
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Lấy timeline logs
    const [logs]: any = await pool.query(
      `SELECT id, status, actor_name, packer_name, shipper_name, shipper_phone, note, created_at
       FROM order_timeline_logs
       WHERE order_id = ?
       ORDER BY created_at ASC`,
      [orderId]
    );

    return NextResponse.json({
      order: orders[0],
      logs,
    });
  } catch (error: any) {
    console.error('Lỗi lấy timeline đơn hàng:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
