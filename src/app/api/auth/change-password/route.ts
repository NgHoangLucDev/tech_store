import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';
import { hashPassword, comparePassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, mode, oldPassword, newPassword, otp } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Thiếu thông tin yêu cầu' }, { status: 400 });
    }

    // 1. Kiểm tra độ bảo mật mật khẩu mới
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({ 
        error: 'Mật khẩu mới phải có tối thiểu 6 ký tự, bao gồm cả chữ cái và chữ số.' 
      }, { status: 400 });
    }

    // 2. Lấy thông tin user hiện tại
    const [rows] = await pool.query(
      'SELECT id, email, phone, password FROM users WHERE email = ?',
      [email]
    ) as [Record<string, unknown>[], unknown];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 });
    }

    const user = rows[0] as { id: number; email: string; phone: string; password?: string };

    if (mode === 'password') {
      if (!oldPassword) {
        return NextResponse.json({ error: 'Mật khẩu cũ là bắt buộc' }, { status: 400 });
      }

      // Kiểm tra mật khẩu cũ
      if (!user.password || !comparePassword(oldPassword, user.password)) {
        return NextResponse.json({ error: 'Mật khẩu cũ không chính xác' }, { status: 401 });
      }
    } else if (mode === 'otp') {
      if (!otp) {
        return NextResponse.json({ error: 'Mã OTP là bắt buộc' }, { status: 400 });
      }

      // Xác minh OTP (thử email trước, sau đó thử phone)
      const [otpRows] = await pool.query(
        'SELECT * FROM otp_codes WHERE (email_or_phone = ? OR email_or_phone = ?) AND code = ? AND expires_at > NOW()',
        [user.email, user.phone, otp]
      ) as [unknown[], unknown];

      if (otpRows.length === 0) {
        return NextResponse.json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' }, { status: 400 });
      }

      // Xóa OTP đã sử dụng
      await pool.execute(
        'DELETE FROM otp_codes WHERE email_or_phone = ? OR email_or_phone = ?',
        [user.email, user.phone]
      );
    } else {
      return NextResponse.json({ error: 'Chế độ không hợp lệ' }, { status: 400 });
    }

    // 3. Cập nhật mật khẩu mới
    const hashedPassword = hashPassword(newPassword);
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    return NextResponse.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
