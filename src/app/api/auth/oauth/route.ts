import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, name, provider } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Không nhận được thông tin email từ dịch vụ liên kết' }, { status: 400 });
    }

    // 1. Kiểm tra xem người dùng đã tồn tại trong DB theo email hay chưa
    const [rows]: any = await pool.query(
      'SELECT id, name, email, phone, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      // Người dùng đã tồn tại -> Đăng nhập thành công và trả về thông tin
      const user = rows[0];
      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      });
    }

    // 2. Người dùng chưa tồn tại -> Đăng ký tài khoản tự động
    // Tạo mật khẩu ngẫu nhiên an toàn (đáp ứng regex: ít nhất 6 ký tự, gồm cả chữ và số)
    const randomPassword = crypto.randomBytes(16).toString('hex') + 'A1';
    const hashedPassword = hashPassword(randomPassword);
    
    // Tạo tên hiển thị mặc định nếu không có tên từ dịch vụ liên kết
    const displayName = name || `User_${email.split('@')[0]}`;

    // Tạo phone placeholder duy nhất vì phone có UNIQUE constraint và NOT NULL
    let phonePlaceholder = '';
    let phoneExists = true;
    while (phoneExists) {
      // 20 ký tự tối đa: 'oauth_' (6) + random hex (14)
      phonePlaceholder = 'oauth_' + crypto.randomBytes(7).toString('hex');
      const [existingPhone]: any = await pool.query(
        'SELECT id FROM users WHERE phone = ?',
        [phonePlaceholder]
      );
      if (existingPhone.length === 0) {
        phoneExists = false;
      }
    }

    const [result]: any = await pool.execute(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [displayName, email, phonePlaceholder, hashedPassword, 'USER']
    );

    const newUserId = result.insertId;

    // Trả về thông tin tài khoản mới tạo để đăng nhập
    return NextResponse.json({
      id: newUserId,
      name: displayName,
      email,
      phone: '',
      role: 'USER'
    });

  } catch (error: any) {
    console.error("Lỗi OAuth API:", error);
    return NextResponse.json({ error: error.message || 'Lỗi hệ thống trong quá trình đăng nhập' }, { status: 500 });
  }
}

