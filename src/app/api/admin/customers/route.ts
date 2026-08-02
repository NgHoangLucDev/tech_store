import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

// Lấy danh sách khách hàng (chỉ dành cho ADMIN)
export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Lỗi lấy dữ liệu người dùng: ' + error.message }, { status: 500 });
  }
}

// Cập nhật vai trò người dùng
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: 'Thiếu ID hoặc vai trò' }, { status: 400 });
    }

    if (!['ADMIN', 'STAFF', 'USER'].includes(role)) {
      return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 });
    }

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    return NextResponse.json({ message: 'Cập nhật vai trò thành công' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật vai trò: ' + error.message }, { status: 500 });
  }
}
