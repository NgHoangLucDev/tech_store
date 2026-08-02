import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET() {
  try {
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN has_vat BOOLEAN DEFAULT FALSE,
      ADD COLUMN vat_mst VARCHAR(20),
      ADD COLUMN vat_company_name VARCHAR(255),
      ADD COLUMN vat_company_address TEXT,
      ADD COLUMN vat_email VARCHAR(100),
      ADD COLUMN vat_contact_name VARCHAR(100),
      ADD COLUMN vat_contact_phone VARCHAR(20),
      ADD COLUMN vat_status ENUM('PENDING', 'ISSUED', 'CANCELLED') DEFAULT 'PENDING'
    `);

    return NextResponse.json({ success: true, message: 'Database updated for VAT support (V4)' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
