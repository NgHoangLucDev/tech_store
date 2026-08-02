import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET() {
  try {
    console.log('Updating database schema v2...');
    
    // 1. Thêm bảng warranty_tickets
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS warranty_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        warranty_id INT,
        issue_description TEXT NOT NULL,
        receive_condition TEXT, -- Tình trạng ngoại quan, phụ kiện
        status ENUM('RECEIVED', 'SENT_TO_MANUFACTURER', 'REPAIRED_EXCHANGED', 'READY_FOR_PICKUP', 'CLOSED') DEFAULT 'RECEIVED',
        new_serial_number VARCHAR(100), -- Nếu được đổi máy mới
        staff_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (warranty_id) REFERENCES warranties(id) ON DELETE CASCADE
      )
    `);
    
    // 2. Cập nhật bảng warranties nếu cần (thêm index cho nhanh)
    await pool.execute('CREATE INDEX IF NOT EXISTS idx_warranty_id ON warranty_tickets(warranty_id)');

    return NextResponse.json({ 
      success: true, 
      message: 'Database Schema V2 updated successfully! warranty_tickets table created.' 
    });
  } catch (error: any) {
    console.error('Migration V2 Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
