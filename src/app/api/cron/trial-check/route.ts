import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    // 1. Quét các đơn hàng đang dùng thử và đã hết hạn
    const [orders]: any = await pool.query(
      `SELECT o.id, o.customer_phone, o.customer_name, o.trial_expired_at 
       FROM orders o
       WHERE o.is_trial = 1 
         AND o.trial_status = 'TRIALING' 
         AND o.trial_expired_at <= NOW()`
    );

    const results = [];

    for (const order of orders) {
      // Kiểm tra xem tin nhắn đã được gửi chưa để tránh gửi lặp
      const [notifs]: any = await pool.query(
        'SELECT id FROM trial_notifications WHERE order_id = ?',
        [order.id]
      );

      if (notifs.length === 0) {
        const messageText = `Xin chào ${order.customer_name}, thiết bị dùng thử tại G-Store của quý khách đã hết hạn dùng thử. Vui lòng bấm vào liên kết sau để xác nhận thanh toán giữ sản phẩm hoặc gửi góp ý để chúng tôi thu hồi máy: http://localhost:3000/trial/feedback?order_id=${order.id}`;
        
        // Ghi nhận gửi tin nhắn
        await pool.execute(
          'INSERT INTO trial_notifications (order_id, phone, message, status) VALUES (?, ?, ?, ?)',
          [order.id, order.customer_phone, messageText, 'SENT']
        );

        // Ghi nhận vết hành động vào timeline đơn hàng
        await pool.execute(
          `INSERT INTO order_timeline_logs 
          (order_id, status, actor_name, note) 
          VALUES (?, ?, ?, ?)`,
          [
            order.id,
            'SHIPPED',
            'Hệ thống (Cron)',
            'Tự động gửi SMS thông báo hết hạn dùng thử tới khách hàng.'
          ]
        );

        results.push({ orderId: order.id, customer: order.customer_name, phone: order.customer_phone, status: 'SENT' });
      }
    }

    return NextResponse.json({
      message: `Quét dùng thử hoàn tất. Đã gửi ${results.length} thông báo hết hạn.`,
      processed: results
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi quét hạn dùng thử:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi quét hạn dùng thử' }, { status: 500 });
  }
}
