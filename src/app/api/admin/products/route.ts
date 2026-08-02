import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

// Lấy danh sách sản phẩm (có thể truyền ?showDeleted=true để xem danh sách đã xóa mềm)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showDeleted = searchParams.get('showDeleted') === 'true';

    const whereClause = showDeleted
      ? 'WHERE p.deleted_at IS NOT NULL'
      : 'WHERE p.deleted_at IS NULL';

    const [rows] = await pool.execute(`
      SELECT p.*, p.thumbnail as image, p.short_description as description, c.name as category_name,
             (
               SELECT JSON_OBJECT(
                 'general', COALESCE(
                   (SELECT JSON_OBJECTAGG(o.name, o.value)
                    FROM options o
                    JOIN product_options po ON o.id = po.option_id
                    WHERE po.product_id = p.id AND o.spec_group = 'general'),
                   JSON_OBJECT()
                 ),
                 'detailed', COALESCE(
                   (SELECT JSON_OBJECTAGG(o.name, o.value)
                    FROM options o
                    JOIN product_options po ON o.id = po.option_id
                    WHERE po.product_id = p.id AND o.spec_group = 'detailed'),
                   JSON_OBJECT()
                 )
               )
             ) as specs
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ${whereClause}
      ORDER BY p.id DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Lỗi lấy dữ liệu từ MySQL' }, { status: 500 });
  }
}

// Hàm xóa dấu tiếng Việt để tạo slug chuẩn
function createSlug(str: string) {
  str = str.toLowerCase();
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[đĐ]/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  str = str.replace(/-+/g, '-');
  str = str.replace(/^-+|-+$/g, '');
  return str + '-' + Date.now();
}

// Helper function to save product specifications in relational tables
async function saveProductOptions(connection: any, productId: number, specs: any) {
  if (!specs) return;
  
  let parsedSpecs: any = {};
  try {
    parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
  } catch (e) {
    console.error("Error parsing specs in saveProductOptions:", e);
    return;
  }
  
  // First, delete existing product options for this product
  await connection.execute('DELETE FROM product_options WHERE product_id = ?', [productId]);
  
  const groups = ['general', 'detailed'];
  for (const group of groups) {
    const groupData = parsedSpecs[group];
    if (groupData && typeof groupData === 'object') {
      for (const [name, val] of Object.entries(groupData)) {
        const valStr = String(val).trim();
        const nameStr = name.trim();
        if (!nameStr || !valStr) continue;
        
        // 1. Insert or get option
        await connection.execute(
          `INSERT INTO options (spec_group, name, value) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
          [group, nameStr, valStr]
        );
        
        const [optRows]: any = await connection.execute(
          'SELECT LAST_INSERT_ID() as id'
        );
        let optionId = optRows[0]?.id;
        
        if (!optionId || optionId === 0) {
          // Fallback if LAST_INSERT_ID() didn't work as expected
          const [findRows]: any = await connection.execute(
            'SELECT id FROM options WHERE spec_group = ? AND name = ? AND value = ?',
            [group, nameStr, valStr]
          );
          optionId = findRows[0]?.id;
        }
        
        // 2. Associate with product
        if (optionId) {
          await connection.execute(
            'INSERT IGNORE INTO product_options (product_id, option_id) VALUES (?, ?)',
            [productId, optionId]
          );
        }
      }
    }
  }
  
  // Clean up orphan options (options not linked to any product)
  await connection.execute(
    'DELETE FROM options WHERE id NOT IN (SELECT DISTINCT option_id FROM product_options)'
  );
}

// Thêm sản phẩm mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, category_id, price, original_price, 
      brand, stock, stock_refurbished, image, description, specs, images, is_flash_sale 
    } = body;

    if (!name) return NextResponse.json({ error: 'Tên sản phẩm là bắt buộc' }, { status: 400 });

    const slug = createSlug(name);

    // Chuẩn hóa dữ liệu số
    const finalPrice = parseFloat(price.toString().replace(/,/g, '')) || 0;
    const finalOriginalPrice = original_price ? parseFloat(original_price.toString().replace(/,/g, '')) : null;
    const finalStock = parseInt(stock?.toString()) || 0;
    const finalStockRefurbished = parseInt(stock_refurbished?.toString()) || 0;

    const [result]: any = await pool.execute(
      `INSERT INTO products 
       (name, slug, category_id, price, original_price, brand, stock, stock_refurbished, thumbnail, short_description, is_flash_sale) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        category_id ? parseInt(category_id) : null, 
        finalPrice, 
        finalOriginalPrice,
        brand || 'Unknown', 
        finalStock, 
        finalStockRefurbished,
        image || '/laptop.png',
        description || null,
        is_flash_sale ? 1 : 0
      ]
    );

    const productId = result.insertId;
    
    // Save relational specs
    if (specs) {
      await saveProductOptions(pool, productId, specs);
    }

    // Lưu ảnh chính vào product_images
    if (image || '/laptop.png') {
      await pool.execute(
        'INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)',
        [productId, image || '/laptop.png', 1]
      );
    }

    // Lưu ảnh phụ vào product_images
    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        if (imgUrl) {
          await pool.execute(
            'INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)',
            [productId, imgUrl, 0]
          );
        }
      }
    }

    return NextResponse.json({ id: productId, message: 'Thêm sản phẩm thành công' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Lỗi MySQL: ' + error.message }, { status: 500 });
  }
}

// XÓA MỀM SẢN PHẨM (Soft Delete) - chỉ đặt deleted_at, không xóa vật lý
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    // Kiểm tra xem sản phẩm có tồn tại trong đơn hàng nào không
    const [orderCheck]: any = await pool.execute(
      'SELECT COUNT(*) as cnt FROM order_items WHERE product_id = ?',
      [id]
    );
    const hasOrders = orderCheck[0]?.cnt > 0;

    // Thực hiện Soft Delete bằng cách cập nhật cột deleted_at thay vì xóa vật lý
    const [result]: any = await pool.execute(
      'UPDATE products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Sản phẩm không tồn tại hoặc đã bị xóa' }, { status: 404 });
    }

    const message = hasOrders
      ? 'Đã ẩn sản phẩm khỏi cửa hàng (sản phẩm có lịch sử đơn hàng, dữ liệu được giữ nguyên để bảo toàn lịch sử)'
      : 'Đã xóa sản phẩm thành công';

    return NextResponse.json({ message, hasOrders });
  } catch (error: any) {
    console.error('MySQL Soft Delete Error:', error);
    return NextResponse.json({ error: 'Lỗi MySQL: ' + error.message }, { status: 500 });
  }
}

// Cập nhật sản phẩm
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, name, category_id, price, original_price, 
      brand, stock, stock_refurbished, image, description, specs, images, is_flash_sale 
    } = body;

    await pool.execute(
      `UPDATE products SET 
       name = ?, category_id = ?, price = ?, original_price = ?, 
       brand = ?, stock = ?, stock_refurbished = ?, thumbnail = ?, short_description = ?, is_flash_sale = ? 
       WHERE id = ?`,
      [
        name, 
        category_id || null, 
        parseFloat(price), 
        original_price ? parseFloat(original_price) : null,
        brand, 
        parseInt(stock), 
        parseInt(stock_refurbished) || 0,
        image, 
        description, 
        is_flash_sale ? 1 : 0,
        id
      ]
    );

    // Save relational specs
    await saveProductOptions(pool, id, specs);

    // Đồng bộ ảnh trong product_images
    await pool.execute('DELETE FROM product_images WHERE product_id = ?', [id]);

    if (image) {
      await pool.execute(
        'INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)',
        [id, image, 1]
      );
    }

    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        if (imgUrl) {
          await pool.execute(
            'INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)',
            [id, imgUrl, 0]
          );
        }
      }
    }

    return NextResponse.json({ message: 'Cập nhật thành công' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật: ' + error.message }, { status: 500 });
  }
}

// Cập nhật nhanh thuộc tính sản phẩm (bật/tắt is_flash_sale, khôi phục sản phẩm đã xóa mềm)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_flash_sale, restore } = body;

    if (id === undefined) {
      return NextResponse.json({ error: 'Thiếu tham số id' }, { status: 400 });
    }

    // Khôi phục sản phẩm đã xóa mềm (Restore)
    if (restore === true) {
      const [result]: any = await pool.execute(
        'UPDATE products SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Sản phẩm không tồn tại trong thùng rác' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Đã khôi phục sản phẩm thành công' });
    }

    // Cập nhật Flash Sale
    if (is_flash_sale !== undefined) {
      const [result]: any = await pool.execute(
        'UPDATE products SET is_flash_sale = ? WHERE id = ? AND deleted_at IS NULL',
        [is_flash_sale ? 1 : 0, id]
      );
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Cập nhật trạng thái Flash Sale thành công' });
    }

    return NextResponse.json({ error: 'Không có thao tác hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('API PATCH Error:', error);
    return NextResponse.json({ error: 'Lỗi MySQL: ' + error.message }, { status: 500 });
  }
}

