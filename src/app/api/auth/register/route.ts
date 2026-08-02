import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, otp } = await req.json();

    // 1. Kiểm tra OTP nếu người dùng nhập Email (Xác thực Gmail thật)
    if (email && email.includes('@')) {
      if (!otp) {
        return NextResponse.json({ error: 'Cần mã OTP để xác nhận Email' }, { status: 400 });
      }
      const [rows]: any = await pool.query(
        'SELECT * FROM otp_codes WHERE email_or_phone = ? AND code = ? AND expires_at > NOW()',
        [email, otp]
      );
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' }, { status: 400 });
      }
    }

    // 2. Kiểm tra độ bảo mật mật khẩu (Trung bình: min 6 ký tự, có ít nhất 1 chữ và 1 số)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ 
        error: 'Mật khẩu phải có tối thiểu 6 ký tự, bao gồm cả chữ cái và chữ số.' 
      }, { status: 400 });
    }

    // 3. Kiểm tra xem Phone/Email đã tồn tại chưa
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE phone = ? OR email = ?',
      [phone, email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Số điện thoại hoặc Email đã được sử dụng' }, { status: 400 });
    }

    // 4. Tạo User mới với mật khẩu đã băm
    const hashedPassword = hashPassword(password);
    await pool.execute(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email || `user_${phone}@techstore.com`, phone, hashedPassword, 'USER']
    );

    return NextResponse.json({ message: 'Đăng ký tài khoản thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
