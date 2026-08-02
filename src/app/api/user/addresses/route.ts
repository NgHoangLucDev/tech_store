import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

// Lấy danh sách địa chỉ của người dùng
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId là bắt buộc' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [userId]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Thêm địa chỉ mới
export async function POST(req: Request) {
  let conn;
  try {
    const body = await req.json();
    const { userId, label, receiverName, receiverPhone, province, district, ward, detail, isDefault } = body;

    if (!userId || !receiverName || !receiverPhone || !province || !district || !ward || !detail) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Kiểm tra xem đây có phải địa chỉ duy nhất của user không
    const [existing]: any = await conn.query(
      'SELECT id FROM user_addresses WHERE user_id = ?',
      [userId]
    );
    
    // Nếu chưa có địa chỉ nào, địa chỉ này bắt buộc phải là mặc định
    const shouldBeDefault = existing.length === 0 ? 1 : (isDefault ? 1 : 0);

    // Nếu địa chỉ mới là mặc định, reset các địa chỉ cũ
    if (shouldBeDefault === 1) {
      await conn.execute(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }

    const [result]: any = await conn.execute(
      `INSERT INTO user_addresses (
        user_id, label, receiver_name, receiver_phone, province, district, ward, detail, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, label || 'Nhà riêng', receiverName, receiverPhone, province, district, ward, detail, shouldBeDefault]
    );

    await conn.commit();
    return NextResponse.json({ message: 'Thêm địa chỉ thành công', id: result.insertId }, { status: 201 });
  } catch (error: any) {
    if (conn) await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}

// Chỉnh sửa địa chỉ
export async function PUT(req: Request) {
  let conn;
  try {
    const body = await req.json();
    const { id, userId, label, receiverName, receiverPhone, province, district, ward, detail, isDefault } = body;

    if (!id || !userId || !receiverName || !receiverPhone || !province || !district || !ward || !detail) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const isDefaultValue = isDefault ? 1 : 0;

    // Nếu đặt địa chỉ này làm mặc định
    if (isDefaultValue === 1) {
      await conn.execute(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    } else {
      // Nếu muốn bỏ mặc định, kiểm tra xem có địa chỉ nào khác có thể làm mặc định không.
      // Tuy nhiên thông thường một user nên luôn có ít nhất 1 địa chỉ mặc định nếu họ có địa chỉ.
      // Kiểm tra xem địa chỉ này có đang là mặc định không
      const [current]: any = await conn.query(
        'SELECT is_default FROM user_addresses WHERE id = ?',
        [id]
      );
      if (current.length > 0 && current[0].is_default === 1) {
        // Nếu địa chỉ này đang là mặc định và người dùng cố bỏ mặc định, kiểm tra xem có địa chỉ khác không
        const [others]: any = await conn.query(
          'SELECT id FROM user_addresses WHERE user_id = ? AND id != ? LIMIT 1',
          [userId, id]
        );
        if (others.length > 0) {
          // Gán địa chỉ khác làm mặc định
          await conn.execute(
            'UPDATE user_addresses SET is_default = 1 WHERE id = ?',
            [others[0].id]
          );
        } else {
          // Nếu không còn địa chỉ nào khác, bắt buộc địa chỉ này phải là mặc định
          // Không cho phép bỏ mặc định
          // (giữ nguyên is_default = 1)
        }
      }
    }

    await conn.execute(
      `UPDATE user_addresses 
       SET label = ?, receiver_name = ?, receiver_phone = ?, province = ?, district = ?, ward = ?, detail = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [label || 'Nhà riêng', receiverName, receiverPhone, province, district, ward, detail, isDefaultValue, id, userId]
    );

    await conn.commit();
    return NextResponse.json({ message: 'Cập nhật địa chỉ thành công' });
  } catch (error: any) {
    if (conn) await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}

// Xóa địa chỉ
export async function DELETE(req: Request) {
  let conn;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'id và userId là bắt buộc' }, { status: 400 });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Kiểm tra xem địa chỉ sắp xóa có phải là mặc định không
    const [target]: any = await conn.query(
      'SELECT is_default FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (target.length === 0) {
      return NextResponse.json({ error: 'Địa chỉ không tồn tại' }, { status: 404 });
    }

    const isDefault = target[0].is_default;

    // Tiến hành xóa
    await conn.execute(
      'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    // Nếu địa chỉ bị xóa là mặc định, gán địa chỉ còn lại làm mặc định
    if (isDefault === 1) {
      const [remaining]: any = await conn.query(
        'SELECT id FROM user_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [userId]
      );
      if (remaining.length > 0) {
        await conn.execute(
          'UPDATE user_addresses SET is_default = 1 WHERE id = ?',
          [remaining[0].id]
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error: any) {
    if (conn) await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
