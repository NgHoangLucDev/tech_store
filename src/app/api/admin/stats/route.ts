import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET() {
  try {
    // 1. Tổng doanh thu (chỉ tính đơn hàng COMPLETED hoặc PAID)
    const [revenueRows]: any = await pool.execute(
      'SELECT SUM(total_price) as total FROM orders WHERE status IN ("PAID", "COMPLETED")'
    );
    const totalRevenue = Number(revenueRows[0]?.total || 0);

    // 2. Tổng số đơn hàng và phân loại trạng thái
    const [statusRows]: any = await pool.execute(
      'SELECT status, COUNT(*) as count, SUM(total_price) as total FROM orders GROUP BY status'
    );
    
    let totalOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let shippedOrders = 0;
    let paidOrders = 0;
    let completedAndPaidCount = 0;

    statusRows.forEach((row: any) => {
      const count = Number(row.count);
      totalOrders += count;
      if (row.status === 'PENDING') pendingOrders = count;
      if (row.status === 'COMPLETED') {
        completedOrders = count;
        completedAndPaidCount += count;
      }
      if (row.status === 'CANCELLED') cancelledOrders = count;
      if (row.status === 'SHIPPED') shippedOrders = count;
      if (row.status === 'PAID') {
        paidOrders = count;
        completedAndPaidCount += count;
      }
    });

    // 3. Tổng số sản phẩm
    const [productRows]: any = await pool.execute('SELECT COUNT(*) as count FROM products');
    const totalProducts = Number(productRows[0]?.count || 0);

    // 4. Tổng số khách hàng
    const [userRows]: any = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "USER"');
    const totalUsers = Number(userRows[0]?.count || 0);

    // 5. Số sản phẩm tồn kho thấp (stock <= 5)
    const [lowStockCountRows]: any = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock <= 5');
    const lowStockCount = Number(lowStockCountRows[0]?.count || 0);

    // 6. Tính toán AOV (Average Order Value)
    const aov = completedAndPaidCount > 0 ? Math.round(totalRevenue / completedAndPaidCount) : 0;

    // 7. Lấy dữ liệu biểu đồ doanh thu & đơn hàng 30 ngày gần đây
    const [revenueChartRows]: any = await pool.execute(`
      SELECT DATE(created_at) as date, 
             SUM(total_price) as revenue, 
             COUNT(*) as orders 
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND status IN ("PAID", "COMPLETED")
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Điền đầy đủ dữ liệu 30 ngày (kể cả những ngày không có đơn hàng)
    const chartDataMap = new Map();
    revenueChartRows.forEach((row: any) => {
      // row.date có thể là kiểu Date hoặc chuỗi YYYY-MM-DD
      const dateStr = row.date instanceof Date 
        ? row.date.toISOString().split('T')[0] 
        : String(row.date).split(' ')[0]; // cắt phần giờ nếu có
      chartDataMap.set(dateStr, {
        revenue: Number(row.revenue || 0),
        orders: Number(row.orders || 0)
      });
    });

    const revenueChart: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayData = chartDataMap.get(dateStr) || { revenue: 0, orders: 0 };
      
      // Định dạng ngày hiển thị ngắn gọn (ví dụ: "DD/MM")
      const displayDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      revenueChart.push({
        date: displayDate,
        fullDate: dateStr,
        revenue: dayData.revenue,
        orders: dayData.orders
      });
    }

    // 8. Thống kê doanh thu theo danh mục sản phẩm (Category sales)
    const [categorySalesRows]: any = await pool.execute(`
      SELECT c.name as category, 
             SUM(oi.quantity * oi.price) as revenue, 
             SUM(oi.quantity) as count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.status IN ("PAID", "COMPLETED")
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `);

    const categoryStats = categorySalesRows.map((row: any) => ({
      category: row.category,
      revenue: Number(row.revenue || 0),
      count: Number(row.count || 0)
    }));

    // 9. Danh sách Top 5 sản phẩm bán chạy nhất
    const [topProductsRows]: any = await pool.execute(`
      SELECT p.id, 
             p.name, 
             p.thumbnail as image, 
             p.brand,
             SUM(oi.quantity) as quantity, 
             SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status IN ("PAID", "COMPLETED")
      GROUP BY p.id, p.name, p.thumbnail, p.brand
      ORDER BY quantity DESC
      LIMIT 5
    `);

    const topProducts = topProductsRows.map((row: any) => ({
      id: row.id,
      name: row.name,
      image: row.image,
      brand: row.brand,
      quantity: Number(row.quantity || 0),
      revenue: Number(row.revenue || 0)
    }));

    // 10. Cảnh báo sản phẩm sắp hết hàng (tồn kho <= 5)
    const [lowStockRows]: any = await pool.execute(`
      SELECT id, name, brand, stock, price, thumbnail as image
      FROM products 
      WHERE stock <= 5 
      ORDER BY stock ASC 
      LIMIT 5
    `);

    const lowStockProducts = lowStockRows.map((row: any) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      stock: Number(row.stock || 0),
      price: Number(row.price || 0),
      image: row.image
    }));

    return NextResponse.json({
      summary: {
        revenue: totalRevenue,
        orders: totalOrders,
        products: totalProducts,
        users: totalUsers,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        shippedOrders,
        paidOrders,
        aov,
        lowStockCount
      },
      revenueChart,
      categoryStats,
      topProducts,
      lowStockProducts
    });
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

