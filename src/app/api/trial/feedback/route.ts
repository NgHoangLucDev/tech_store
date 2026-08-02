import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    const [orders]: any = await pool.query(
      `SELECT o.id, o.customer_name, o.customer_phone, o.total_price, o.is_trial, o.trial_status, o.trial_expired_at,
              o.deposit_amount, o.deposit_status
       FROM orders o 
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    const order = orders[0];

    const [items]: any = await pool.query(
      `SELECT oi.price, oi.quantity, p.name as product_name, p.thumbnail 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return NextResponse.json({
      order,
      items
    });
  } catch (error: any) {
    console.error('Lỗi lấy thông tin đơn hàng dùng thử:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { order_id, decision, payment_method, feedback } = await req.json();

    if (!order_id || !decision) {
      return NextResponse.json({ error: 'Thiếu thông tin yêu cầu' }, { status: 400 });
    }

    // 1. Kiểm tra đơn hàng có tồn tại và đang dùng thử không
    const [orders]: any = await pool.query(
      'SELECT status, customer_phone, customer_name, is_trial, trial_status, deposit_amount, deposit_status FROM orders WHERE id = ?',
      [order_id]
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
    }

    const order = orders[0];
    if (order.is_trial !== 1 || order.trial_status !== 'TRIALING') {
      return NextResponse.json({ error: 'Đơn hàng này không ở trong chế độ dùng thử' }, { status: 400 });
    }

    if (decision === 'APPROVED_PAID') {
      // 2A. KHÁCH ĐỒNG Ý MUA & THANH TOÁN
      const pMethodDesc = payment_method === 'online' ? 'Thanh toán trực tuyến (Đã thanh toán)' : 'Nhân viên qua thu tiền mặt tại nhà';
      const orderNewStatus = payment_method === 'online' ? 'COMPLETED' : 'SHIPPED';

      // Nếu khách mua luôn: cập nhật deposit_status = REFUNDED (trừ cọc vào hóa đơn mua)
      const depositUpdate = order.deposit_amount > 0
        ? `, deposit_status = 'REFUNDED'` : '';

      await pool.execute(
        `UPDATE orders SET 
          trial_status = 'APPROVED_PAID', 
          status = ?
          ${depositUpdate}
         WHERE id = ?`,
        [orderNewStatus, order_id]
      );

      // Ghi timeline log
      const depositNote = order.deposit_amount > 0
        ? ` Tiền cọc ${Number(order.deposit_amount).toLocaleString('vi-VN')}₫ được trừ thẳng vào giá trị đơn hàng.`
        : '';
      await pool.execute(
        `INSERT INTO order_timeline_logs 
        (order_id, status, actor_name, note) 
        VALUES (?, ?, ?, ?)`,
        [
          order_id,
          orderNewStatus,
          'Khách hàng (Tự duyệt)',
          `Khách hàng ưng ý sản phẩm, duyệt giữ lại máy. Hình thức: ${pMethodDesc}.${depositNote}`
        ]
      );

      // Kích hoạt bảo hành nếu trạng thái là COMPLETED
      if (orderNewStatus === 'COMPLETED') {
        const [items]: any = await pool.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [order_id]
        );

        for (const item of items) {
          const [existing]: any = await pool.query(
            'SELECT id FROM warranties WHERE order_id = ? AND product_id = ?',
            [order_id, item.product_id]
          );

          if (existing.length === 0) {
            const serialNumber = `SN-${order_id}-${item.product_id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(startDate.getFullYear() + 2); // Bảo hành 2 năm

            await pool.execute(
              'INSERT INTO warranties (order_id, product_id, customer_phone, serial_number, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [order_id, item.product_id, order.customer_phone, serialNumber, startDate, endDate, 'ACTIVE']
            );
          }
        }
      }

      return NextResponse.json({ message: 'Xác nhận mua thành công! Cảm ơn bạn đã tin tưởng G-Store.' });

    } else if (decision === 'REJECTED_RETURN') {
      // 2B. KHÁCH YÊU CẦU TRẢ HÀNG
      // Nếu có tiền cọc: đặt trạng thái cọc thành CHờ HOÀN CỌc để nhân viên xử lý
      const depositRefundClause = order.deposit_amount > 0
        ? `, deposit_status = 'REFUNDED'` : '';

      await pool.execute(
        `UPDATE orders SET 
          trial_status = 'REJECTED_RETURN', 
          status = 'CANCELLED',
          trial_feedback = ?
          ${depositRefundClause}
         WHERE id = ?`,
        [feedback || 'Khách hàng không ưng ý sản phẩm dùng thử', order_id]
      );

      // Hoàn trả lại số lượng sản phẩm vào kho hàng cũ/Likenew (stock_refurbished)
      const [items]: any = await pool.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [order_id]
      );
      for (const item of items) {
        await pool.execute(
          'UPDATE products SET stock_refurbished = stock_refurbished + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Hủy mọi bảo hành liên quan (nếu có)
      await pool.execute(
        "UPDATE warranties SET status = 'EXPIRED' WHERE order_id = ?",
        [order_id]
      );

      // Ghi timeline log
      const depositInfo = order.deposit_amount > 0
        ? ` Tiền cọc ${Number(order.deposit_amount).toLocaleString('vi-VN')}₫ đang chờ nhân viên xác nhận hoàn lại cho khách.`
        : '';
      await pool.execute(
        `INSERT INTO order_timeline_logs 
        (order_id, status, actor_name, note) 
        VALUES (?, ?, ?, ?)`,
        [
          order_id,
          'CANCELLED',
          'Khách hàng (Tự duyệt)',
          `Khách hàng từ chối mua sản phẩm và yêu cầu trả hàng. Lý do: ${feedback || 'Không có lý do chi tiết'}.${depositInfo}`
        ]
      );

      return NextResponse.json({ 
        message: 'Yêu cầu trả hàng của bạn đã được ghi nhận. Nhân viên thu hồi sẽ liên hệ sớm.',
        deposit_pending_refund: order.deposit_amount > 0
      });
    }

    return NextResponse.json({ error: 'Quyết định không hợp lệ' }, { status: 400 });

  } catch (error: any) {
    console.error('Lỗi phản hồi dùng thử:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi gửi phản hồi' }, { status: 500 });
  }
}
