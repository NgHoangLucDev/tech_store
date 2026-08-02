import { NextResponse } from 'next/server';
import { getOrderDetails } from '@/lib/server/services/orderService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'ID đơn hàng không hợp lệ' }, { status: 400 });
    }

    const order = await getOrderDetails(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
