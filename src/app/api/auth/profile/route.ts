import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function PATCH(req: Request) {
  try {
    const { currentEmail, email, phone, name, address, otp } = await req.json();

    if (!currentEmail) {
      return NextResponse.json({ error: 'Email hiện tại là bắt buộc' }, { status: 400 });
    }

    // Nếu thay đổi Email, yêu cầu OTP
    if (email && email !== currentEmail) {
      if (!otp) {
        return NextResponse.json({ error: 'Cần mã OTP để thay đổi Email' }, { status: 400 });
      }
      const [rows]: any = await pool.query(
        'SELECT * FROM otp_codes WHERE email = ? AND code = ? AND expires_at > NOW()',
        [email, otp]
      );
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' }, { status: 400 });
      }
    }

    // Kiểm tra SĐT đã tồn tại chưa (nếu có đổi SĐT)
    if (phone) {
      const [existing]: any = await pool.query(
        'SELECT id FROM users WHERE phone = ? AND email != ?',
        [phone, currentEmail]
      );
      if (existing.length > 0) {
        return NextResponse.json({ error: 'Số điện thoại này đã được sử dụng bởi tài khoản khác' }, { status: 400 });
      }
    }

    // Cập nhật thông tin
    await pool.execute(
      'UPDATE users SET phone = ?, name = ?, email = ?, address = ? WHERE email = ?',
      [phone, name, email || currentEmail, address, currentEmail]
    );

    return NextResponse.json({ message: 'Cập nhật thông tin thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
