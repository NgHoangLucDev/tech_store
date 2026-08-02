import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/server/services/orderService';

export async function POST(req: Request) {
  try {
    const { userId, items, totalPrice, shippingInfo, vatInfo, isTrial, depositAmount } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });
    }

    const orderId = await createOrder({
      userId,
      items,
      totalPrice,
      shippingInfo,
      vatInfo,
      isTrial,
      depositAmount
    });

    return NextResponse.json({ message: 'Đặt hàng thành công', orderId }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi đặt hàng:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi đặt hàng' }, { status: 500 });
  }
}
