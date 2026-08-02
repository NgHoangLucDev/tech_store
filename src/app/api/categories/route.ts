import { NextResponse } from 'next/server';
import { getCategoriesTree } from '@/lib/server/services/categoryService';

export async function GET() {
  try {
    const tree = await getCategoriesTree();
    return NextResponse.json(tree);
  } catch (error: any) {
    console.error('Lỗi lấy danh mục:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
