import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return NextResponse.json({ error: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM order_timeline_logs WHERE order_id = ? ORDER BY created_at ASC',
      [order_id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
