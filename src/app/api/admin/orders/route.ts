import { NextResponse } from 'next/server';
import pool from '@/lib/server/db';

export async function GET() {
  try {
    const [orders]: any = await pool.query(`
      SELECT o.*, 
             o.shipping_address as address, 
             o.customer_name, 
             o.customer_phone,
             vi.mst AS vat_mst, 
             vi.company_name AS vat_company_name, 
             vi.company_address AS vat_company_address, 
             vi.email AS vat_email, 
             vi.contact_name AS vat_contact_name, 
             vi.contact_phone AS vat_contact_phone, 
             vi.status AS vat_status,
             CASE WHEN vi.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_vat
      FROM orders o
      LEFT JOIN order_vat_invoices vi ON o.id = vi.order_id
      ORDER BY o.created_at DESC
    `);

    if (orders.length === 0) {
      return NextResponse.json([]);
    }

    const orderIds = orders.map((o: any) => o.id);

    // Lấy chi tiết sản phẩm cho tất cả các đơn hàng này
    const [items]: any = await pool.query(`
      SELECT oi.*, p.name as product_name, p.thumbnail as product_image, p.brand as product_brand
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
    `, orderIds);

    // Group items theo order_id
    const itemsMap: { [key: number]: any[] } = {};
    items.forEach((item: any) => {
      if (!itemsMap[item.order_id]) {
        itemsMap[item.order_id] = [];
      }
      itemsMap[item.order_id].push({
        id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.product_name,
        image: item.product_image,
        brand: item.product_brand
      });
    });

    // Gán items vào từng order tương ứng
    const ordersWithItems = orders.map((o: any) => ({
      ...o,
      items: itemsMap[o.id] || []
    }));

    return NextResponse.json(ordersWithItems);
  } catch (error: any) {
    console.error('Lỗi lấy danh sách đơn hàng:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Cập nhật trạng thái và thông tin đơn hàng
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { 
      id, status, address, total_price, vatStatus, packer_name, shipper_name, shipper_phone, actor_name, note,
      is_trial, trial_expired_at, trial_status, trial_feedback,
      deposit_amount, deposit_status, deposit_note
    } = body;
    
    // 0. Lấy thông tin trạng thái cũ trước khi cập nhật
    const [existingOrderRows]: any = await pool.query(
      'SELECT status FROM orders WHERE id = ?',
      [id]
    );
    const previousStatus = existingOrderRows[0]?.status;

    // 1. Cập nhật thông tin đơn hàng
    const updates = [];
    const params = [];
    
    if (status) { updates.push('status = ?'); params.push(status); }
    if (address !== undefined) { updates.push('shipping_address = ?'); params.push(address); }
    if (total_price !== undefined) { updates.push('total_price = ?'); params.push(total_price); }
    // Chỉ ghi packer_name khi chưa có (người đầu tiên thay đổi trạng thái mới là người đóng gói)
    if (packer_name !== undefined) {
      updates.push('packer_name = COALESCE(NULLIF(packer_name, \'\'), ?)');
      params.push(packer_name);
    }
    if (shipper_name !== undefined) { updates.push('shipper_name = ?'); params.push(shipper_name); }
    if (shipper_phone !== undefined) { updates.push('shipper_phone = ?'); params.push(shipper_phone); }
    if (is_trial !== undefined) { updates.push('is_trial = ?'); params.push(is_trial); }
    if (trial_expired_at !== undefined) { updates.push('trial_expired_at = ?'); params.push(trial_expired_at || null); }
    if (trial_status !== undefined) { updates.push('trial_status = ?'); params.push(trial_status || null); }
    if (trial_feedback !== undefined) { updates.push('trial_feedback = ?'); params.push(trial_feedback || null); }
    if (deposit_amount !== undefined) { updates.push('deposit_amount = ?'); params.push(deposit_amount); }
    if (deposit_status !== undefined) { updates.push('deposit_status = ?'); params.push(deposit_status || null); }
    
    if (updates.length > 0) {
      params.push(id);
      await pool.execute(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // 1.05 Xử lý hoàn kho và bảo hành khi hủy đơn hàng hoặc khôi phục đơn
    if (status && previousStatus !== status) {
      const [orderInfo]: any = await pool.query(
        'SELECT is_trial FROM orders WHERE id = ?',
        [id]
      );
      const isTrial = orderInfo[0]?.is_trial === 1;

      // Nếu trạng thái đổi sang HỦY ĐƠN: Hoàn lại tồn kho cho sản phẩm và tắt bảo hành
      if (status === 'CANCELLED') {
        const [items]: any = await pool.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [id]
        );
        for (const item of items) {
          if (isTrial) {
            await pool.execute(
              'UPDATE products SET stock_refurbished = stock_refurbished + ? WHERE id = ?',
              [item.quantity, item.product_id]
            );
          } else {
            await pool.execute(
              'UPDATE products SET stock = stock + ? WHERE id = ?',
              [item.quantity, item.product_id]
            );
          }
        }
        await pool.execute(
          "UPDATE warranties SET status = 'EXPIRED' WHERE order_id = ?",
          [id]
        );
      }
      // Nếu khôi phục đơn hàng từ trạng thái HỦY ĐƠN: Trừ lại tồn kho của sản phẩm
      else if (previousStatus === 'CANCELLED') {
        const [items]: any = await pool.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [id]
        );
        for (const item of items) {
          if (isTrial) {
            await pool.execute(
              'UPDATE products SET stock_refurbished = stock_refurbished - ? WHERE id = ?',
              [item.quantity, item.product_id]
            );
          } else {
            await pool.execute(
              'UPDATE products SET stock = stock - ? WHERE id = ?',
              [item.quantity, item.product_id]
            );
          }
        }
      }
    }

    // 1.1 Cập nhật trạng thái hóa đơn VAT (nếu được gửi lên)
    if (vatStatus !== undefined) {
      await pool.execute(
        'UPDATE order_vat_invoices SET status = ? WHERE order_id = ?',
        [vatStatus, id]
      );
    }

    // 1.2 Ghi log vào timeline
    if (status || packer_name || shipper_name || note || is_trial !== undefined || trial_status !== undefined) {
      // Lấy thông tin hiện tại của đơn hàng để ghi log chính xác
      const [orderRows]: any = await pool.query(
        'SELECT status, packer_name, shipper_name, shipper_phone, is_trial, trial_status, trial_expired_at FROM orders WHERE id = ?',
        [id]
      );
      
      if (orderRows.length > 0) {
        const currentOrder = orderRows[0];
        const finalStatus = status || currentOrder.status;
        const finalPacker = packer_name !== undefined ? packer_name : currentOrder.packer_name;
        const finalShipper = shipper_name !== undefined ? shipper_name : currentOrder.shipper_name;
        const finalShipperPhone = shipper_phone !== undefined ? shipper_phone : currentOrder.shipper_phone;

        // Tạo nội dung mô tả hành động mặc định nếu không có note
        let actionDesc = `Cập nhật đơn hàng: Trạng thái ${finalStatus}.`;
        if (status === 'PENDING') {
          actionDesc = `Đơn hàng được tiếp nhận và chờ xử lý.`;
        }
        if (packer_name) {
          actionDesc = `Nhân viên đóng gói được chỉ định là: ${packer_name}.`;
        }
        if (shipper_name) {
          actionDesc = `Đã chỉ định Shipper: ${shipper_name} (${finalShipperPhone || 'N/A'}).`;
        }
        if (status === 'SHIPPED') {
          actionDesc = `Đơn hàng đã được bàn giao cho Shipper ${finalShipper || 'N/A'} và bắt đầu đi giao hàng.`;
        }
        if (status === 'COMPLETED') {
          actionDesc = `Đơn hàng đã được giao thành công bởi Shipper ${finalShipper || 'N/A'}.`;
        }
        if (status === 'CANCELLED') {
          actionDesc = `Đơn hàng bị hủy. Lý do: ${note || 'Không có lý do'}.`;
        }
        
        // Ghi nhận nghiệp vụ dùng thử
        if (is_trial !== undefined) {
          const expDateStr = trial_expired_at ? new Date(trial_expired_at).toLocaleDateString('vi-VN') : 'N/A';
          actionDesc = is_trial ? `Đã kích hoạt chế độ DÙNG THỬ (Hạn dùng thử: ${expDateStr}).` : `Đã hủy chế độ Dùng thử đơn hàng.`;
        }
        if (trial_status !== undefined) {
          if (trial_status === 'APPROVED_PAID') {
            actionDesc = `Khách hàng ưng ý thiết bị, đã duyệt thanh toán đơn dùng thử thành công.`;
          }
          if (trial_status === 'REJECTED_RETURN') {
             actionDesc = `Khách hàng không ưng ý, yêu cầu trả hàng dùng thử. Lý do: ${trial_feedback || note || 'Không được cung cấp'}.`;
          }
          if (trial_status === 'COLLECTED') {
            actionDesc = `Nhân viên cửa hàng đã đến thu hồi thiết bị dùng thử về kho thành công.`;
          }
        }
        // Ghi nhận nghiệp vụ đặt cọc
        if (deposit_status !== undefined) {
          const amountStr = deposit_amount ? Number(deposit_amount).toLocaleString('vi-VN') + '₫' : 'N/A';
          if (deposit_status === 'PENDING_DEPOSIT') {
            actionDesc = `Yêu cầu đặt cọc dùng thử: ${amountStr}. ${deposit_note || ''}`;
          } else if (deposit_status === 'DEPOSITED') {
            actionDesc = `Đã nhận đặt cọc: ${amountStr}. ${deposit_note || 'Khách hàng đã nộp cọc, thiết bị được bàn giao.'}`;
          } else if (deposit_status === 'REFUNDED') {
            actionDesc = `Đã hoàn cọc: ${amountStr}. ${deposit_note || 'Thiết bị thu hồi nguyên vẹn, tiền cọc hoàn trả khách.'}`;
          } else if (deposit_status === 'FORFEITED') {
            actionDesc = `Cọc bị tịch thu: ${amountStr}. ${deposit_note || 'Thiết bị bị hư hỏng hoặc mất mát, cửa hàng giữ tiền cọc.'}`;
          }
        }

        await pool.execute(
          `INSERT INTO order_timeline_logs 
          (order_id, status, actor_name, packer_name, shipper_name, shipper_phone, note) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            finalStatus,
            actor_name || 'Hệ thống',
            finalPacker || null,
            finalShipper || null,
            finalShipperPhone || null,
            note || actionDesc
          ]
        );
      }
    }

    // 2. Nếu đơn hàng hoàn thành, kích hoạt bảo hành điện tử (giữ logic cũ)
    if (status === 'COMPLETED') {
      const [items]: any = await pool.query(`
        SELECT u.phone as customer_phone, oi.product_id
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
      `, [id]);

      for (const item of items) {
        const [existing]: any = await pool.query(
          'SELECT id FROM warranties WHERE order_id = ? AND product_id = ?',
          [id, item.product_id]
        );

        if (existing.length === 0) {
          const serialNumber = `SN-${id}-${item.product_id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const startDate = new Date();
          const endDate = new Date();
          endDate.setFullYear(startDate.getFullYear() + 2);

          await pool.execute(
            'INSERT INTO warranties (order_id, product_id, customer_phone, serial_number, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, item.product_id, item.customer_phone, serialNumber, startDate, endDate, 'ACTIVE']
          );
        }
      }
    }
    
    return NextResponse.json({ message: 'Cập nhật thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Xóa đơn hàng
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    
    // Xóa đơn hàng
    await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Đã xóa đơn hàng thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
