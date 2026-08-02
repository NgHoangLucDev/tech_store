const mysql = require('mysql2/promise');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function createTestData() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tech_store',
  });

  try {
    const phone = '0986046133';
    
    // 1. Kiểm tra/Tạo User
    const [users] = await pool.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    let userId;
    
    if (users.length === 0) {
      const hashedPassword = hashPassword('123');
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['Khách Hàng Test', 'test@example.com', hashedPassword, phone, 'USER']
      );
      userId = result.insertId;
      console.log('Created user with ID:', userId);
    } else {
      userId = users[0].id;
      console.log('User already exists with ID:', userId);
    }

    // Lấy 2 sản phẩm thực tế từ cơ sở dữ liệu để tạo chi tiết đơn hàng mẫu
    const [products] = await pool.execute('SELECT id, price FROM products LIMIT 2');
    if (products.length < 2) {
      console.log('⚠ Not enough products in DB to seed order items. Skipping order seeding.');
      process.exit(0);
    }
    
    const product1 = products[0];
    const product2 = products[1];
    const totalPrice = Number(product1.price) + Number(product2.price);

    // 2. Tạo Order PENDING
    // Cột trong bảng orders là shipping_address, không phải address
    const [orderResult] = await pool.execute(
      'INSERT INTO orders (user_id, total_price, status, delivery_method, shipping_address) VALUES (?, ?, ?, ?, ?)',
      [userId, totalPrice, 'PENDING', 'shipping', '123 Đường Test, TP.HCM']
    );
    const orderId = orderResult.insertId;
    console.log('Created order with ID:', orderId);

    // 3. Thêm Order Items dựa trên sản phẩm thực tế
    await pool.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      [
        orderId, product1.id, 1, product1.price,
        orderId, product2.id, 1, product2.price
      ]
    );
    console.log(`Added order items for order ID ${orderId} (Product IDs: ${product1.id}, ${product2.id}).`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createTestData();
