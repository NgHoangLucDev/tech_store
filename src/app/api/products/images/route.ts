import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Thiếu productId' }, { status: 400 });
    }

    const [rows]: any = await pool.execute(
      'SELECT id, url, is_main FROM product_images WHERE product_id = ? ORDER BY is_main DESC, id ASC',
      [parseInt(productId)]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch Images API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
