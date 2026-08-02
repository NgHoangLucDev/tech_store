import { NextResponse } from 'next/server';
import { 
  getProductRelations, 
  addProductRelation, 
  deleteProductRelation 
} from '@/lib/server/services/productService';

// Lấy danh sách sản phẩm liên kết
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productIdStr = searchParams.get('productId');
    const type = searchParams.get('type'); // optional filter: 'bought_together', 'cross_sell', 'related'

    if (!productIdStr) {
      return NextResponse.json({ error: 'Thiếu productId' }, { status: 400 });
    }

    const productIds = productIdStr.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (productIds.length === 0) {
      return NextResponse.json([]);
    }

    const rows = await getProductRelations(productIds, type);

    // Format kết quả trả về
    // Nếu chỉ truy vấn 1 sản phẩm và không lọc theo type, ta gom nhóm cho tiện sử dụng ở giao diện chi tiết
    if (productIds.length === 1 && !type) {
      const grouped = {
        bought_together: [] as any[],
        cross_sell: [] as any[],
        related: [] as any[]
      };
      
      rows.forEach((row: any) => {
        const typeKey = row.relation_type as keyof typeof grouped;
        if (grouped[typeKey]) {
          grouped[typeKey].push({
            id: row.id.toString(), // product id
            name: row.name,
            price: parseFloat(row.price),
            originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
            brand: row.brand,
            image: row.image || '/laptop.png',
            category: row.category_name?.toLowerCase() || '',
            specs: row.specs,
            stock: row.stock,
            description: row.description
          });
        }
      });
      return NextResponse.json(grouped);
    }

    // Ngược lại trả về danh sách phẳng đã format
    const formatted = rows.map((row: any) => ({
      relation_id: row.relation_id,
      source_product_id: row.source_product_id,
      relation_type: row.relation_type,
      id: row.id.toString(),
      name: row.name,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      brand: row.brand,
      image: row.image || '/laptop.png',
      category: row.category_name?.toLowerCase() || '',
      specs: row.specs,
      stock: row.stock,
      description: row.description
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Relations API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Thêm liên kết sản phẩm (Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, relatedProductId, relationType } = body;

    if (!productId || !relatedProductId || !relationType) {
      return NextResponse.json({ error: 'Thiếu thông tin yêu cầu' }, { status: 400 });
    }

    const pId = parseInt(productId);
    const rId = parseInt(relatedProductId);

    if (pId === rId) {
      return NextResponse.json({ error: 'Không thể liên kết sản phẩm với chính nó' }, { status: 400 });
    }

    const insertId = await addProductRelation(pId, rId, relationType);

    return NextResponse.json({ 
      id: insertId, 
      message: 'Thiết lập liên kết sản phẩm thành công!' 
    });
  } catch (error: any) {
    console.error('Relations POST Error:', error);
    return NextResponse.json({ error: 'Lỗi: ' + error.message }, { status: 500 });
  }
}

// Xóa liên kết sản phẩm (Admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const relatedProductId = searchParams.get('relatedProductId');
    const relationType = searchParams.get('relationType');
    
    // Hoặc nhận qua body
    let pId = productId ? parseInt(productId) : null;
    let rId = relatedProductId ? parseInt(relatedProductId) : null;
    let type = relationType;

    if (!pId || !rId || !type) {
      const body = await request.json().catch(() => ({}));
      pId = body.productId ? parseInt(body.productId) : pId;
      rId = body.relatedProductId ? parseInt(body.relatedProductId) : rId;
      type = body.relationType ? body.relationType : type;
    }

    if (!pId || !rId || !type) {
      return NextResponse.json({ error: 'Thiếu thông tin để xóa liên kết' }, { status: 400 });
    }

    const success = await deleteProductRelation(pId, rId, type);

    if (!success) {
      return NextResponse.json({ error: 'Liên kết không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Đã xóa liên kết thành công!' });
  } catch (error: any) {
    console.error('Relations DELETE Error:', error);
    return NextResponse.json({ error: 'Lỗi: ' + error.message }, { status: 500 });
  }
}
