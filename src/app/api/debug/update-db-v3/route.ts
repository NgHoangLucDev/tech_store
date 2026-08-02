import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET() {
  try {
    console.log('Updating database schema v3 for Online Warranty...');
    
    // 1. Thêm các cột cho tính năng Online
    await pool.execute(`
      ALTER TABLE warranty_tickets 
      ADD COLUMN IF NOT EXISTS type ENUM('OFFLINE', 'ONLINE') DEFAULT 'OFFLINE',
      ADD COLUMN IF NOT EXISTS customer_address TEXT,
      ADD COLUMN IF NOT EXISTS media_urls JSON,
      ADD COLUMN IF NOT EXISTS shipping_code VARCHAR(100),
      ADD COLUMN IF NOT EXISTS delivery_method ENUM('SHOWROOM', 'SHIPPER') DEFAULT 'SHOWROOM'
    `);
    
    // 2. Thêm trạng thái REJECTED cho ticket (nếu chưa có trong ENUM)
    // Lưu ý: MySQL ALTER TABLE MODIFY ENUM có thể hơi phức tạp, 
    // chúng ta sẽ thử cập nhật danh sách ENUM đầy đủ.
    await pool.execute(`
      ALTER TABLE warranty_tickets 
      MODIFY COLUMN status ENUM('RECEIVED', 'SENT_TO_MANUFACTURER', 'REPAIRED_EXCHANGED', 'READY_FOR_PICKUP', 'CLOSED', 'PENDING_APPROVAL', 'REJECTED') 
      DEFAULT 'RECEIVED'
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Database Schema V3 updated! Online warranty fields added.' 
    });
  } catch (error: any) {
    console.error('Migration V3 Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
