import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

// Lấy danh sách flat tất cả danh mục để Admin chọn danh mục cha
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, parent_id, name, slug, icon FROM categories ORDER BY name ASC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Thêm mới danh mục
export async function POST(req: Request) {
  try {
    const { name, slug, icon, parent_id } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Thiếu tên hoặc slug danh mục' }, { status: 400 });
    }

    const [result]: any = await pool.execute(
      'INSERT INTO categories (name, slug, icon, parent_id) VALUES (?, ?, ?, ?)',
      [name, slug, icon || null, parent_id || null]
    );

    return NextResponse.json({ message: 'Thêm danh mục thành công', id: result.insertId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Cập nhật danh mục
export async function PATCH(req: Request) {
  try {
    const { id, name, slug, icon, parent_id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID danh mục' }, { status: 400 });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
    if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
    if (parent_id !== undefined) { updates.push('parent_id = ?'); params.push(parent_id || null); }

    if (updates.length > 0) {
      params.push(id);
      await pool.execute(
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    return NextResponse.json({ message: 'Cập nhật danh mục thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Xóa danh mục
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID danh mục' }, { status: 400 });
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Xóa danh mục thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
