import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

// 1. Kiểm tra OTP và lấy danh sách sản phẩm của khách
export async function POST(req: Request) {
  try {
    const { action, phone, otp, warranty_id, issue_description, receive_condition, delivery_method, customer_address, media_urls } = await req.json();

    // ACTION: VERIFY_AND_FETCH
    if (action === 'VERIFY_AND_FETCH') {
      const [rows]: any = await pool.execute(
        'SELECT * FROM otp_codes WHERE email_or_phone = ? AND code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [phone, otp]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Mã OTP không đúng hoặc đã hết hạn' }, { status: 400 });
      }

      // OTP đúng, lấy danh sách bảo hành
      const [warranties]: any = await pool.query(`
        SELECT w.*, p.name as product_name, p.brand as product_brand, p.thumbnail as product_image
        FROM warranties w
        JOIN products p ON w.product_id = p.id
        WHERE w.customer_phone = ?
        ORDER BY w.start_date DESC
      `, [phone]);

      return NextResponse.json({ success: true, warranties });
    }

    // ACTION: SUBMIT_TICKET (Khách tự tạo online)
    if (action === 'SUBMIT_TICKET') {
      const [result]: any = await pool.execute(
        `INSERT INTO warranty_tickets 
        (warranty_id, issue_description, receive_condition, type, status, delivery_method, customer_address, media_urls) 
        VALUES (?, ?, ?, 'ONLINE', 'PENDING_APPROVAL', ?, ?, ?)`,
        [
          warranty_id, 
          issue_description, 
          receive_condition || 'Khách hàng gửi online', 
          delivery_method || 'SHOWROOM', 
          customer_address || null,
          media_urls ? JSON.stringify(media_urls) : null
        ]
      );

      return NextResponse.json({ 
        success: true, 
        ticket_id: result.insertId,
        message: 'Yêu cầu bảo hành đã được gửi. Chúng tôi sẽ duyệt sớm nhất!' 
      });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Tra cứu trạng thái Ticket cho khách hoặc thông tin bảo hành thiết bị
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticket_id = searchParams.get('ticket_id');
    const phone = searchParams.get('phone');
    const serial_number = searchParams.get('serial_number');
    const queryVal = searchParams.get('query');

    // 2.1 Tra cứu theo Ticket ID
    if (ticket_id) {
      const [rows]: any = await pool.query(`
        SELECT t.*, p.name as product_name, w.serial_number
        FROM warranty_tickets t
        JOIN warranties w ON t.warranty_id = w.id
        JOIN products p ON w.product_id = p.id
        WHERE t.id = ?
      `, [ticket_id]);

      if (rows.length === 0) return NextResponse.json({ error: 'Không tìm thấy phiếu bảo hành' }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    // 2.2 Tra cứu thông tin bảo hành chung (Smart Query hoặc SĐT hoặc S/N)
    const searchKey = queryVal || phone || serial_number;
    if (searchKey) {
      const cleanKey = searchKey.trim();
      // Nhận diện là số điện thoại nếu chỉ chứa chữ số, dấu cộng, khoảng trắng, độ dài từ 9 đến 15 ký tự
      const isPhone = /^[0-9+() -]{9,15}$/.test(cleanKey);

      if (isPhone) {
        const [rows]: any = await pool.query(`
          SELECT w.*, p.name as product_name, p.brand as product_brand, p.thumbnail as product_image
          FROM warranties w
          JOIN products p ON w.product_id = p.id
          WHERE w.customer_phone = ?
          ORDER BY w.start_date DESC
        `, [cleanKey]);
        return NextResponse.json(rows);
      } else {
        // Tìm kiếm chính xác theo mã S/N sản phẩm
        const [rows]: any = await pool.query(`
          SELECT w.*, p.name as product_name, p.brand as product_brand, p.thumbnail as product_image
          FROM warranties w
          JOIN products p ON w.product_id = p.id
          WHERE w.serial_number = ?
        `, [cleanKey]);

        if (rows.length === 0) {
          return NextResponse.json(
            { error: 'Thiết bị với Số Sê-ri (S/N) này không phải sản phẩm được mua tại cửa hàng của chúng tôi.' }, 
            { status: 404 }
          );
        }
        return NextResponse.json(rows);
      }
    }

    return NextResponse.json({ error: 'Thiếu tham số tra cứu (ticket_id, phone, serial_number hoặc query)' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
