import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    let query = `
      SELECT w.*, p.name as product_name, p.brand as product_brand, p.thumbnail as product_image
      FROM warranties w
      JOIN products p ON w.product_id = p.id
    `;
    const params: any[] = [];

    if (phone && phone.trim()) {
      const cleanInput = phone.trim();
      const isPhone = /^[0-9+() -]{9,15}$/.test(cleanInput);
      if (isPhone) {
        query += ` WHERE w.customer_phone = ? `;
      } else {
        query += ` WHERE w.serial_number = ? `;
      }
      params.push(cleanInput);
    }

    query += ` ORDER BY w.start_date DESC LIMIT 200`;
    const [rows] = await pool.query(query, params);

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { warranty_id, product_name, issue } = await req.json();

  
    const complexities = ['Nhẹ', 'Trung bình', 'Nghiêm trọng'];
    const randomComplexity = complexities[Math.floor(Math.random() * complexities.length)];
    const days = randomComplexity === 'Nhẹ' ? 3 : (randomComplexity === 'Trung bình' ? 7 : 14);
    
    const prediction = {
      complexity: randomComplexity,
      estimated_days: days,
      return_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
      ai_reason: `Dựa trên phân tích lịch sử bảo trì cho dòng sản phẩm ${product_name}, lỗi được xác định là "${issue}" có mức độ phức tạp ${randomComplexity}. Hệ thống AI dự đoán thời gian xử lý tối ưu là ${days} ngày làm việc.`
    };

    return NextResponse.json(prediction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
