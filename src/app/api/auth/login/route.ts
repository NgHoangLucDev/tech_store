import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';
import { comparePassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    // Tìm user theo Phone hoặc Email
    const [rows]: any = await pool.query(
      'SELECT id, name, email, phone, role, password FROM users WHERE phone = ? OR email = ?',
      [loginId, loginId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 401 });
    }

    const user = rows[0];

    // Kiểm tra mật khẩu (Sử dụng so sánh bảo mật có tương thích ngược)
    if (!comparePassword(password, user.password)) {
      return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
    }

    // Trả về thông tin user (loại bỏ password)
    const { password: _, ...userInfo } = user;
    return NextResponse.json(userInfo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
