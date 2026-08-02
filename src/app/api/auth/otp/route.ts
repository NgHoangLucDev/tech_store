import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
    }

    // 1. Tạo mã OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

    // 2. Lưu vào Database
    await pool.execute(
      'DELETE FROM otp_codes WHERE email_or_phone = ?',
      [email]
    );
    await pool.execute(
      'INSERT INTO otp_codes (email_or_phone, code, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // 3. Gửi Email (Sử dụng cấu hình từ .env hoặc mock nếu thiếu)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_USER.includes('your-email')) {
        await transporter.sendMail({
          from: '"TechStore Premium" <no-reply@techstore.com>',
          to: email,
          subject: `Mã xác thực OTP của bạn: ${otp}`,
          text: `Mã OTP của bạn là ${otp}. Mã này có hiệu lực trong 5 phút.`,
          html: `<b>Mã OTP của bạn là <span style="font-size: 24px; color: #3b82f6;">${otp}</span></b><p>Mã này có hiệu lực trong 5 phút.</p>`,
        });
      } else {
        console.log('\x1b[33m%s\x1b[0m', '--- MOCK OTP SENT (No SMTP Configured) ---');
        console.log('\x1b[32m%s\x1b[0m', `To: ${email}`);
        console.log('\x1b[31m%s\x1b[0m', `Code: ${otp}`);
        console.log('\x1b[33m%s\x1b[0m', '-------------------------------------------');
      }
    } catch (mailError) {
      console.error('Lỗi gửi mail (Kiểm tra SMTP_PASS):', mailError);
      console.log('\x1b[31m%s\x1b[0m', `--- FALLBACK OTP (Mã để bạn test): ${otp} ---`);
    }

    return NextResponse.json({ message: 'Đã gửi mã OTP thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
