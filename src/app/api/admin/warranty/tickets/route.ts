import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

// Lấy danh sách phiếu bảo hành của một sản phẩm hoặc tất cả
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const warranty_id = searchParams.get('warranty_id');

    let query = `
      SELECT t.*, w.serial_number as old_serial_number, p.name as product_name
      FROM warranty_tickets t
      JOIN warranties w ON t.warranty_id = w.id
      JOIN products p ON w.product_id = p.id
    `;
    const params = [];

    if (warranty_id) {
      query += ' WHERE t.warranty_id = ?';
      params.push(warranty_id);
    }
    
    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Tạo phiếu bảo hành mới (Bước 3)
export async function POST(req: Request) {
  try {
    const { warranty_id, issue_description, receive_condition } = await req.json();

    const [result]: any = await pool.execute(
      'INSERT INTO warranty_tickets (warranty_id, issue_description, receive_condition, status) VALUES (?, ?, ?, ?)',
      [warranty_id, issue_description, receive_condition, 'RECEIVED']
    );

    return NextResponse.json({ id: result.insertId, message: 'Tạo phiếu bảo hành thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Cập nhật trạng thái phiếu bảo hành (Bước 4 & 5)
export async function PATCH(req: Request) {
  try {
    const { id, status, new_serial_number, staff_notes } = await req.json();

    // 1. Cập nhật phiếu bảo hành
    await pool.execute(
      'UPDATE warranty_tickets SET status = ?, new_serial_number = ?, staff_notes = ? WHERE id = ?',
      [status, new_serial_number || null, staff_notes || null, id]
    );

    // 2. Nếu trạng thái là REPAIRED_EXCHANGED và có S/N mới, cập nhật bảng warranties gốc (Bước 5)
    if (status === 'REPAIRED_EXCHANGED' && new_serial_number) {
      const [ticket]: any = await pool.query('SELECT warranty_id FROM warranty_tickets WHERE id = ?', [id]);
      if (ticket.length > 0) {
        await pool.execute(
          'UPDATE warranties SET serial_number = ? WHERE id = ?',
          [new_serial_number, ticket[0].warranty_id]
        );
      }
    }

    return NextResponse.json({ message: 'Cập nhật phiếu thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
