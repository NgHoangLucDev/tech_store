import 'server-only';
import mysql from 'mysql2/promise';

// Kiểm tra xem ứng dụng đang chạy ở môi trường production (hosting) hay local (development)
const isProduction = process.env.NODE_ENV === 'production';

const pool = mysql.createPool(
  isProduction 
    ? {
        // Cấu hình cho hosting (Aiven) khi chạy trên server thật
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 22199,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
          rejectUnauthorized: false, // Bắt buộc với Aiven
        },
      }
    : {
        // Cấu hình cho localhost (XAMPP/phpMyAdmin) khi chạy trên máy tính
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tech_store',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      }
);

export default pool;