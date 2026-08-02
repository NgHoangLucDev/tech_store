import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    console.log('Updating users table schema...');
    // Thêm STAFF vào ENUM role
    await pool.execute("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'STAFF', 'USER') DEFAULT 'USER'");
    
    // Thêm tài khoản nhân viên mẫu nếu chưa có
    const hashedPwd = hashPassword('123');
    await pool.execute(
      "INSERT INTO users (name, email, password, phone, role) VALUES ('Nhân viên bán hàng', 'staff', ?, '2222222222', 'STAFF') ON DUPLICATE KEY UPDATE email=email",
      [hashedPwd]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database updated successfully! STAFF role is now available.' 
    });
  } catch (error: any) {
    console.error('Migration Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
