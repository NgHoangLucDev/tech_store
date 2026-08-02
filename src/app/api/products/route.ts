import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/server/services/productService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const limitVal = limit ? parseInt(limit) : null;

    const products = await getProducts({ category, limit: limitVal });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Public API Error:', error);
    const errorMessage = error instanceof AggregateError 
      ? error.errors.map((e: any) => e.message).join(', ') 
      : error.message || 'Unknown server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
