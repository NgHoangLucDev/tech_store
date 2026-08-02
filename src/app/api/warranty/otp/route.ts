import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Thiếu số điện thoại' }, { status: 400 });
    }

    // Tạo mã OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

    // Lưu OTP vào bảng otp_codes (sử dụng phone thay cho email trong trường hợp này hoặc dùng chung bảng)
    // Để đơn giản, ta dùng bảng otp_codes hiện có, lưu phone vào cột email
    await pool.execute(
      'INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [phone, otp, expiresAt]
    );

    // Ở môi trường thực tế, ta sẽ gửi SMS/Zalo. Ở đây ta log ra console để debug.
    console.log(`[WARRANTY OTP] Mã xác thực cho ${phone} là: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Mã OTP đã được gửi!',
      // Chỉ trả về OTP ở bản demo để tiện test, thực tế KHÔNG trả về đây
      debug_otp: otp 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
