const fs = require('fs');
const path = require('path');

const xmlEscape = (str) => {
    return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

const diagrams = [
  {
    name: "Hình 3.10 Đăng ký",
    filename: "Hinh_3.10_Dang_ky_OTP.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database", "Email Service"],
    messages: [
      { from: 0, to: 1, text: "Nhập thông tin" },
      { from: 1, to: 1, text: "Validate" },
      { from: 1, to: 2, text: "Gửi yêu cầu" },
      { from: 2, to: 3, text: "Kiểm tra tồn tại" },
      { from: 3, to: 2, text: "Kết quả", dashed: true },
      { from: 2, to: 1, text: "[Đã tồn tại] Báo lỗi", dashed: true },
      { from: 1, to: 0, text: "Hiển thị lỗi", dashed: true },
      { from: 2, to: 3, text: "[Hợp lệ] Lưu tạm" },
      { from: 2, to: 2, text: "Tạo OTP" },
      { from: 2, to: 4, text: "Yêu cầu gửi OTP" },
      { from: 4, to: 0, text: "Gửi email chứa OTP", dashed: true },
      { from: 2, to: 1, text: "Yêu cầu nhập OTP", dashed: true },
      { from: 1, to: 0, text: "Hiển thị form", dashed: true },
      { from: 0, to: 1, text: "Nhập OTP" },
      { from: 1, to: 2, text: "Gửi xác thực" },
      { from: 2, to: 3, text: "Đối chiếu OTP" },
      { from: 3, to: 2, text: "Kết quả", dashed: true },
      { from: 2, to: 1, text: "[Sai] Báo lỗi", dashed: true },
      { from: 1, to: 0, text: "Hiển thị lỗi", dashed: true },
      { from: 2, to: 3, text: "[Đúng] Cập nhật TK" },
      { from: 2, to: 1, text: "Thành công", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true }
    ]
  },
  {
    name: "Hình 3.11 Đăng nhập",
    filename: "Hinh_3.11_Dang_nhap.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Nhập thông tin" },
      { from: 1, to: 2, text: "Gửi yêu cầu" },
      { from: 2, to: 3, text: "Lấy thông tin TK" },
      { from: 3, to: 2, text: "Dữ liệu (kèm hash)", dashed: true },
      { from: 2, to: 1, text: "[Không tìm thấy] Lỗi", dashed: true },
      { from: 1, to: 0, text: "Hiển thị lỗi", dashed: true },
      { from: 2, to: 2, text: "[Có TK] Hash PBKDF2" },
      { from: 2, to: 1, text: "[Sai mật khẩu] Lỗi", dashed: true },
      { from: 1, to: 0, text: "Hiển thị lỗi", dashed: true },
      { from: 2, to: 2, text: "[Đúng] Tạo Token" },
      { from: 2, to: 1, text: "Trả Token & User", dashed: true },
      { from: 1, to: 1, text: "Lưu Zustand" },
      { from: 1, to: 0, text: "Chuyển hướng", dashed: true }
    ]
  },
  {
    name: "Hình 3.12 Tra cứu SP",
    filename: "Hinh_3.12_Tra_cuu_SP.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Nhập từ khóa/bộ lọc" },
      { from: 1, to: 2, text: "Tìm kiếm" },
      { from: 2, to: 3, text: "Truy vấn SP" },
      { from: 3, to: 2, text: "Danh sách SP", dashed: true },
      { from: 2, to: 1, text: "Trả dữ liệu", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true }
    ]
  },
  {
    name: "Hình 3.13 Chi tiết SP",
    filename: "Hinh_3.13_Chi_tiet_SP.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Chọn SP" },
      { from: 1, to: 2, text: "Yêu cầu chi tiết" },
      { from: 2, to: 3, text: "Lấy thông tin" },
      { from: 3, to: 2, text: "Dữ liệu", dashed: true },
      { from: 2, to: 3, text: "Lấy đánh giá & liên quan" },
      { from: 3, to: 2, text: "Dữ liệu", dashed: true },
      { from: 2, to: 1, text: "Trả toàn bộ dữ liệu", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true }
    ]
  },
  {
    name: "Hình 3.14 Giỏ hàng",
    filename: "Hinh_3.14_Gio_hang.drawio",
    lifelines: ["Khách Hàng", "Frontend", "LocalStorage"],
    messages: [
      { from: 0, to: 1, text: "Thêm vào giỏ" },
      { from: 1, to: 1, text: "Kiểm tra SP" },
      { from: 1, to: 1, text: "[Đã có] Tăng SL" },
      { from: 1, to: 1, text: "[Chưa có] Thêm SP mới" },
      { from: 1, to: 2, text: "Cập nhật Storage" },
      { from: 1, to: 0, text: "Thông báo & cập nhật UI", dashed: true }
    ]
  },
  {
    name: "Hình 3.15 Đặt hàng",
    filename: "Hinh_3.15_Dat_hang.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database", "PaymentGateway"],
    messages: [
      { from: 0, to: 1, text: "Điền thông tin & thanh toán" },
      { from: 1, to: 2, text: "Đặt hàng" },
      { from: 2, to: 3, text: "Kiểm tra tồn kho" },
      { from: 3, to: 2, text: "Trạng thái", dashed: true },
      { from: 2, to: 1, text: "[Hết hàng] Báo lỗi", dashed: true },
      { from: 1, to: 0, text: "Hiển thị lỗi", dashed: true },
      { from: 2, to: 3, text: "[Còn] Lưu đơn hàng" },
      { from: 2, to: 3, text: "Trừ tạm tồn kho" },
      { from: 2, to: 4, text: "[Online] Tạo phiên TT" },
      { from: 4, to: 2, text: "Trả URL", dashed: true },
      { from: 2, to: 1, text: "Trả URL", dashed: true },
      { from: 1, to: 0, text: "Chuyển hướng TT", dashed: true },
      { from: 0, to: 4, text: "Thực hiện TT" },
      { from: 4, to: 2, text: "Webhook thành công" },
      { from: 2, to: 3, text: "Cập nhật Đã TT" },
      { from: 2, to: 1, text: "[COD] Trả kết quả", dashed: true },
      { from: 1, to: 0, text: "Hiển thị xác nhận", dashed: true }
    ]
  },
  {
    name: "Hình 3.16 Theo dõi ĐH",
    filename: "Hinh_3.16_Theo_doi_DH.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Vào lịch sử ĐH" },
      { from: 1, to: 2, text: "Yêu cầu danh sách" },
      { from: 2, to: 3, text: "Lấy danh sách" },
      { from: 3, to: 2, text: "Dữ liệu", dashed: true },
      { from: 2, to: 1, text: "Trả dữ liệu", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true },
      { from: 0, to: 1, text: "Xem timeline ĐH" },
      { from: 1, to: 2, text: "Yêu cầu timeline" },
      { from: 2, to: 3, text: "Lấy lịch sử trạng thái" },
      { from: 3, to: 2, text: "Dữ liệu", dashed: true },
      { from: 2, to: 1, text: "Trả dữ liệu", dashed: true },
      { from: 1, to: 0, text: "Hiển thị timeline", dashed: true }
    ]
  },
  {
    name: "Hình 3.17 Admin thêm SP",
    filename: "Hinh_3.17_Admin_Them_SP.drawio",
    lifelines: ["Admin", "Frontend", "Backend", "CloudStorage", "Database"],
    messages: [
      { from: 0, to: 1, text: "Điền SP & chọn ảnh" },
      { from: 1, to: 2, text: "Tải ảnh" },
      { from: 2, to: 3, text: "Upload ảnh" },
      { from: 3, to: 2, text: "URL ảnh", dashed: true },
      { from: 2, to: 1, text: "Xác nhận", dashed: true },
      { from: 1, to: 2, text: "Gửi thông tin SP" },
      { from: 2, to: 4, text: "Lưu SP" },
      { from: 4, to: 2, text: "Xác nhận", dashed: true },
      { from: 2, to: 1, text: "Trả kết quả", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true }
    ]
  },
  {
    name: "Hình 3.18 Admin sinh BH",
    filename: "Hinh_3.18_Admin_Sinh_BH.drawio",
    lifelines: ["Admin", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Cập nhật Hoàn thành" },
      { from: 1, to: 2, text: "Yêu cầu cập nhật" },
      { from: 2, to: 3, text: "Đổi TT Hoàn thành" },
      { from: 2, to: 3, text: "Lấy danh sách thiết bị" },
      { from: 3, to: 2, text: "Chi tiết thiết bị", dashed: true },
      { from: 2, to: 2, text: "Tính thời gian BH" },
      { from: 2, to: 3, text: "Sinh BH theo Serial" },
      { from: 3, to: 2, text: "Xác nhận", dashed: true },
      { from: 2, to: 1, text: "Thành công", dashed: true },
      { from: 1, to: 0, text: "Cập nhật UI", dashed: true }
    ]
  },
  {
    name: "Hình 3.19 Admin hủy đơn",
    filename: "Hinh_3.19_Admin_Huy_don.drawio",
    lifelines: ["Admin", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Hủy đơn hàng" },
      { from: 1, to: 2, text: "Yêu cầu hủy" },
      { from: 2, to: 3, text: "Lấy thông tin đơn" },
      { from: 3, to: 2, text: "Thông tin", dashed: true },
      { from: 2, to: 3, text: "Đổi TT Đã hủy" },
      { from: 2, to: 3, text: "Lấy số lượng SP" },
      { from: 3, to: 2, text: "Số lượng", dashed: true },
      { from: 2, to: 3, text: "Cộng lại vào kho" },
      { from: 3, to: 2, text: "Xác nhận", dashed: true },
      { from: 2, to: 1, text: "Thành công", dashed: true },
      { from: 1, to: 0, text: "Cập nhật UI", dashed: true }
    ]
  },
  {
    name: "Hình 3.20 Tra cứu BH",
    filename: "Hinh_3.20_Tra_cuu_BH.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Nhập SĐT/Serial" },
      { from: 1, to: 2, text: "Yêu cầu tra cứu" },
      { from: 2, to: 3, text: "Tìm kiếm" },
      { from: 3, to: 2, text: "Kết quả", dashed: true },
      { from: 2, to: 1, text: "[Không thấy] Lỗi", dashed: true },
      { from: 1, to: 0, text: "Hiển thị lỗi", dashed: true },
      { from: 2, to: 1, text: "[Tìm thấy] Trả dữ liệu", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true }
    ]
  },
  {
    name: "Hình 3.21 Tạo ticket",
    filename: "Hinh_3.21_Tao_ticket.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database"],
    messages: [
      { from: 0, to: 1, text: "Chọn TB & mô tả" },
      { from: 1, to: 2, text: "Yêu cầu bảo hành" },
      { from: 2, to: 3, text: "Kiểm tra hạn BH" },
      { from: 3, to: 2, text: "Hợp lệ", dashed: true },
      { from: 2, to: 3, text: "Tạo phiếu BH" },
      { from: 3, to: 2, text: "Xác nhận", dashed: true },
      { from: 2, to: 1, text: "Mã phiếu", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true }
    ]
  },
  {
    name: "Hình 3.22 Dùng thử",
    filename: "Hinh_3.22_Dung_thu.drawio",
    lifelines: ["Khách Hàng", "Frontend", "Backend", "Database", "PaymentGateway"],
    messages: [
      { from: 0, to: 1, text: "Chọn dùng thử" },
      { from: 1, to: 2, text: "Đăng ký" },
      { from: 2, to: 3, text: "Kiểm tra điều kiện" },
      { from: 3, to: 2, text: "Hợp lệ", dashed: true },
      { from: 2, to: 3, text: "Tạo hồ sơ" },
      { from: 2, to: 4, text: "Tạo phiên cọc" },
      { from: 4, to: 2, text: "URL TT", dashed: true },
      { from: 2, to: 1, text: "URL TT", dashed: true },
      { from: 1, to: 0, text: "Chuyển hướng", dashed: true },
      { from: 0, to: 4, text: "Thanh toán cọc" },
      { from: 4, to: 2, text: "Webhook cọc" },
      { from: 2, to: 3, text: "Cập nhật Đang dùng thử" },
      { from: 2, to: 1, text: "Thành công", dashed: true },
      { from: 1, to: 0, text: "Hiển thị", dashed: true }
    ]
  },
  {
    name: "Hình 3.23 Cron check",
    filename: "Hinh_3.23_Cron_check.drawio",
    lifelines: ["Cron Job", "Backend", "Database", "EmailService", "Khách Hàng"],
    messages: [
      { from: 0, to: 1, text: "Chạy quét hàng ngày" },
      { from: 1, to: 2, text: "Tìm gói hết hạn/sắp hết" },
      { from: 2, to: 1, text: "Danh sách", dashed: true },
      { from: 1, to: 3, text: "[Sắp hết hạn] Gửi mail nhắc" },
      { from: 3, to: 4, text: "Nhận mail", dashed: true },
      { from: 1, to: 2, text: "[Quá hạn] Đổi TT" },
      { from: 1, to: 3, text: "Gửi mail phạt" },
      { from: 3, to: 4, text: "Nhận mail", dashed: true },
      { from: 1, to: 0, text: "Xong", dashed: true }
    ]
  }
];

for (const diag of diagrams) {
    let xml = '<mxfile host="Electron" modified="2023-11-01T00:00:00.000Z" agent="Mozilla/5.0" version="22.0.4" type="device">\n';
    
    const pageId = "page1";
    const pageName = xmlEscape(diag.name);
    
    xml += '  <diagram id="' + pageId + '" name="' + pageName + '">\n';
    xml += '    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">\n';
    xml += '      <root>\n';
    xml += '        <mxCell id="0" />\n';
    xml += '        <mxCell id="1" parent="0" />\n';

    const startX = 50;
    const spacingX = 180;
    const startY = 100;
    const stepY = 50;
    const lifelinesYOffset = 40;
    
    const height = startY + diag.messages.length * stepY + 100;

    for (let i = 0; i < diag.lifelines.length; i++) {
        const lfName = xmlEscape(diag.lifelines[i]);
        const x = startX + i * spacingX;
        const width = 110;
        const currentId = pageId + "-lf-" + i;

        xml += '        <mxCell id="' + currentId + '" value="' + lfName + '" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;newEdgeStyle={&quot;edgeStyle&quot;:&quot;elbowEdgeStyle&quot;,&quot;elbow&quot;:&quot;vertical&quot;,&quot;curved&quot;:0,&quot;rounded&quot;:0};size=40;" vertex="1" parent="1">\n';
        xml += '          <mxGeometry x="' + x + '" y="' + lifelinesYOffset + '" width="' + width + '" height="' + height + '" as="geometry" />\n';
        xml += '        </mxCell>\n';
    }

    let currentY = startY;
    for (let i = 0; i < diag.messages.length; i++) {
        const msg = diag.messages[i];
        const text = xmlEscape(msg.text);
        const sourceId = pageId + "-lf-" + msg.from;
        const targetId = pageId + "-lf-" + msg.to;
        const msgId = pageId + "-msg-" + i;

        let style = "html=1;verticalAlign=bottom;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=vertical;curved=0;rounded=0;";
        if (msg.dashed) {
            style += "dashed=1;";
        }

        if (msg.from === msg.to) {
            const sx = startX + msg.from * spacingX + 55;
            xml += '        <mxCell id="' + msgId + '" value="' + text + '" style="' + style + '" edge="1" parent="1" source="' + sourceId + '" target="' + targetId + '">\n';
            xml += '          <mxGeometry relative="1" as="geometry">\n';
            xml += '            <mxPoint x="' + sx + '" y="' + currentY + '" as="sourcePoint" />\n';
            xml += '            <mxPoint x="' + sx + '" y="' + (currentY + 20) + '" as="targetPoint" />\n';
            xml += '            <Array as="points">\n';
            xml += '              <mxPoint x="' + (sx + 40) + '" y="' + currentY + '" />\n';
            xml += '              <mxPoint x="' + (sx + 40) + '" y="' + (currentY + 20) + '" />\n';
            xml += '            </Array>\n';
            xml += '          </mxGeometry>\n';
            xml += '        </mxCell>\n';
            currentY += stepY + 15; 
        } else {
            const sx1 = startX + msg.from * spacingX + 55;
            const sx2 = startX + msg.to * spacingX + 55;
            xml += '        <mxCell id="' + msgId + '" value="' + text + '" style="' + style + '" edge="1" parent="1" source="' + sourceId + '" target="' + targetId + '">\n';
            xml += '          <mxGeometry relative="1" as="geometry">\n';
            xml += '            <mxPoint x="' + sx1 + '" y="' + currentY + '" as="sourcePoint" />\n';
            xml += '            <mxPoint x="' + sx2 + '" y="' + currentY + '" as="targetPoint" />\n';
            xml += '            <Array as="points">\n';
            xml += '              <mxPoint x="' + (sx1 + sx2)/2 + '" y="' + currentY + '" />\n';
            xml += '            </Array>\n';
            xml += '          </mxGeometry>\n';
            xml += '        </mxCell>\n';
            currentY += stepY;
        }
    }

    xml += '      </root>\n';
    xml += '    </mxGraphModel>\n';
    xml += '  </diagram>\n';
    xml += '</mxfile>';

    const outputPath = path.join(__dirname, diag.filename);
    fs.writeFileSync(outputPath, xml, 'utf8');
}
