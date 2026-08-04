# Mã Mermaid cho các Sơ đồ Tuần tự (Sequence Diagrams)

Do cấu trúc tệp `.drawio` thuần túy sử dụng hệ tọa độ rất phức tạp (khó có thể tự sinh code XML chuẩn xác về mặt giao diện, dễ dẫn đến các đường thẳng và hộp bị đè lên nhau), mình đã chuẩn bị một file `.drawio` với đầy đủ các trang trắng (tab) tương ứng. 

Để vẽ các sơ đồ này lên file `.drawio` một cách nhanh, đẹp và chuẩn xác nhất, bạn hãy dùng tính năng sinh sơ đồ tự động của Draw.io theo hướng dẫn sau:
1. Mở trang tương ứng trong file `sequence_diagrams.drawio` (ví dụ: Hình 3.10 Đăng ký)
2. Trên thanh menu, chọn **Arrange (Sắp xếp)** -> **Insert (Chèn)** -> **Advanced (Nâng cao)** -> **Mermaid...**
3. Copy đoạn mã tương ứng bên dưới và dán vào hộp thoại, sau đó nhấn **Insert**. Draw.io sẽ tự động căn chỉnh và vẽ ra sơ đồ tuần tự tuyệt đẹp cho bạn.

*Lưu ý theo yêu cầu của bạn: Các sơ đồ dưới đây được viết hoàn toàn bằng ngôn ngữ mô tả luồng nghiệp vụ tự nhiên, KHÔNG chứa code (như gọi hàm, if/else lập trình, truy vấn SQL...).*

---

### Hình 3.10: Sơ đồ tuần tự: Đăng ký tài khoản + OTP email
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database
    participant Email Service

    Khách Hàng->>Frontend: Nhập thông tin đăng ký
    Frontend->>Frontend: Kiểm tra tính hợp lệ
    Frontend->>Backend: Gửi yêu cầu đăng ký
    Backend->>Database: Kiểm tra số điện thoại/email tồn tại
    Database-->>Backend: Kết quả kiểm tra
    alt Đã tồn tại
        Backend-->>Frontend: Báo lỗi tài khoản đã tồn tại
        Frontend-->>Khách Hàng: Hiển thị thông báo lỗi
    else Hợp lệ
        Backend->>Database: Lưu thông tin tạm thời (Chưa xác thực)
        Backend->>Backend: Tạo mã OTP
        Backend->>Email Service: Yêu cầu gửi OTP
        Email Service-->>Khách Hàng: Gửi email chứa mã OTP
        Backend-->>Frontend: Yêu cầu nhập mã OTP
        Frontend-->>Khách Hàng: Hiển thị form nhập mã OTP
        
        Khách Hàng->>Frontend: Nhập mã OTP
        Frontend->>Backend: Gửi mã OTP để xác thực
        Backend->>Database: Đối chiếu mã OTP
        Database-->>Backend: Kết quả đối chiếu
        alt OTP không hợp lệ hoặc hết hạn
            Backend-->>Frontend: Báo lỗi mã OTP
            Frontend-->>Khách Hàng: Hiển thị thông báo lỗi
        else OTP hợp lệ
            Backend->>Database: Cập nhật trạng thái tài khoản (Đã xác thực)
            Backend-->>Frontend: Trả về thông báo thành công
            Frontend-->>Khách Hàng: Hiển thị đăng ký thành công
        end
    end
```

---

### Hình 3.11: Sơ đồ tuần tự: Đăng nhập (PBKDF2 + Zustand)
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend (Zustand)
    participant Backend
    participant Database

    Khách Hàng->>Frontend (Zustand): Nhập email và mật khẩu
    Frontend (Zustand)->>Backend: Gửi thông tin đăng nhập
    Backend->>Database: Lấy thông tin tài khoản theo email
    Database-->>Backend: Trả về thông tin (kèm mật khẩu băm PBKDF2)
    alt Không tìm thấy tài khoản
        Backend-->>Frontend (Zustand): Thông báo sai thông tin
        Frontend (Zustand)-->>Khách Hàng: Hiển thị lỗi
    else Tìm thấy tài khoản
        Backend->>Backend: Dùng thuật toán PBKDF2 kiểm tra mật khẩu
        alt Mật khẩu sai
            Backend-->>Frontend (Zustand): Thông báo sai thông tin
            Frontend (Zustand)-->>Khách Hàng: Hiển thị lỗi
        else Mật khẩu đúng
            Backend->>Backend: Tạo mã phiên đăng nhập (Token)
            Backend-->>Frontend (Zustand): Trả về Token & thông tin người dùng
            Frontend (Zustand)->>Frontend (Zustand): Lưu Token và User vào trạng thái (Zustand)
            Frontend (Zustand)-->>Khách Hàng: Chuyển hướng về trang chủ
        end
    end
```

---

### Hình 3.12: Sơ đồ tuần tự: Tra cứu / danh sách sản phẩm
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database

    Khách Hàng->>Frontend: Nhập từ khóa hoặc chọn bộ lọc
    Frontend->>Backend: Gửi yêu cầu tìm kiếm (kèm tham số lọc)
    Backend->>Database: Truy vấn danh sách sản phẩm phù hợp
    Database-->>Backend: Trả về danh sách sản phẩm
    Backend-->>Frontend: Trả dữ liệu sản phẩm & thông tin phân trang
    Frontend-->>Khách Hàng: Hiển thị danh sách sản phẩm
```

---

### Hình 3.13: Sơ đồ tuần tự xem chi tiết sản phẩm
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database

    Khách Hàng->>Frontend: Chọn xem chi tiết một sản phẩm
    Frontend->>Backend: Yêu cầu thông tin chi tiết sản phẩm
    Backend->>Database: Lấy thông tin cơ bản của sản phẩm
    Database-->>Backend: Trả về dữ liệu chi tiết
    Backend->>Database: Lấy danh sách đánh giá & sản phẩm liên quan
    Database-->>Backend: Trả về đánh giá & sản phẩm liên quan
    Backend-->>Frontend: Tổng hợp & trả về toàn bộ dữ liệu sản phẩm
    Frontend-->>Khách Hàng: Hiển thị trang chi tiết sản phẩm
```

---

### Hình 3.14: Sơ đồ tuần tự giỏ hàng (Zustand)
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend (Zustand)
    participant Local Storage

    Khách Hàng->>Frontend (Zustand): Bấm chọn "Thêm vào giỏ hàng"
    Frontend (Zustand)->>Frontend (Zustand): Kiểm tra sản phẩm đã có trong giỏ chưa
    alt Đã có
        Frontend (Zustand)->>Frontend (Zustand): Tăng số lượng sản phẩm
    else Chưa có
        Frontend (Zustand)->>Frontend (Zustand): Thêm sản phẩm mới vào giỏ hàng
    end
    Frontend (Zustand)->>Local Storage: Lưu thông tin giỏ hàng vào trình duyệt
    Frontend (Zustand)-->>Khách Hàng: Hiển thị thông báo thêm thành công & Cập nhật số lượng
```

---

### Hình 3.15: Sơ đồ tuần tự: Đặt hàng / Checkout (createOrder)
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database
    participant Payment Gateway

    Khách Hàng->>Frontend: Điền thông tin giao hàng & chọn phương thức thanh toán
    Frontend->>Backend: Gửi yêu cầu đặt hàng
    Backend->>Database: Kiểm tra số lượng tồn kho sản phẩm
    Database-->>Backend: Trả về trạng thái tồn kho
    alt Hết hàng
        Backend-->>Frontend: Báo lỗi hết hàng
        Frontend-->>Khách Hàng: Hiển thị thông báo lỗi
    else Còn hàng
        Backend->>Database: Lưu thông tin đơn hàng (Chờ thanh toán)
        Backend->>Database: Trừ tạm thời số lượng tồn kho
        alt Thanh toán Online (VNPAY/Momo...)
            Backend->>Payment Gateway: Yêu cầu tạo đường dẫn thanh toán
            Payment Gateway-->>Backend: Trả về đường dẫn thanh toán
            Backend-->>Frontend: Trả về đường dẫn thanh toán
            Frontend-->>Khách Hàng: Chuyển hướng đến cổng thanh toán
            Khách Hàng->>Payment Gateway: Thực hiện thanh toán
            Payment Gateway->>Backend: Thông báo thanh toán thành công (Webhook)
            Backend->>Database: Cập nhật trạng thái đơn hàng (Đã thanh toán)
        else Thanh toán khi nhận hàng (COD)
            Backend-->>Frontend: Trả về kết quả đặt hàng thành công
            Frontend-->>Khách Hàng: Hiển thị trang xác nhận đơn hàng
        end
    end
```

---

### Hình 3.16: Sơ đồ tuần tự: Theo dõi đơn hàng & timeline
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database

    Khách Hàng->>Frontend: Truy cập trang "Lịch sử đơn hàng"
    Frontend->>Backend: Yêu cầu danh sách đơn hàng
    Backend->>Database: Lấy danh sách đơn hàng của người dùng
    Database-->>Backend: Trả về danh sách
    Backend-->>Frontend: Trả dữ liệu danh sách đơn hàng
    Frontend-->>Khách Hàng: Hiển thị danh sách
    Khách Hàng->>Frontend: Bấm xem chi tiết tiến trình một đơn hàng
    Frontend->>Backend: Yêu cầu chi tiết & lịch sử thay đổi trạng thái
    Backend->>Database: Lấy lịch sử (timeline) trạng thái đơn hàng
    Database-->>Backend: Trả về dữ liệu timeline
    Backend-->>Frontend: Trả dữ liệu tiến trình đơn hàng
    Frontend-->>Khách Hàng: Hiển thị tiến trình (Chờ xác nhận -> Đang giao -> Hoàn thành)
```

---

### Hình 3.17: Sơ đồ tuần tự: Admin thêm sản phẩm + upload ảnh
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Frontend
    participant Backend
    participant Cloud Storage (S3/Cloudinary)
    participant Database

    Admin->>Frontend: Điền thông tin sản phẩm & chọn file ảnh
    Frontend->>Backend: Gửi yêu cầu tải file ảnh lên
    Backend->>Cloud Storage (S3/Cloudinary): Đẩy file ảnh lên lưu trữ đám mây
    Cloud Storage (S3/Cloudinary)-->>Backend: Trả về đường dẫn tĩnh của ảnh
    Backend-->>Frontend: Xác nhận tải ảnh thành công
    Frontend->>Backend: Gửi thông tin sản phẩm (kèm đường dẫn ảnh)
    Backend->>Database: Lưu thông tin sản phẩm mới
    Database-->>Backend: Xác nhận lưu thành công
    Backend-->>Frontend: Trả về kết quả thành công
    Frontend-->>Admin: Hiển thị thông báo thêm sản phẩm thành công
```

---

### Hình 3.18: Sơ đồ tuần tự: Admin COMPLETED → sinh bảo hành
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Frontend
    participant Backend
    participant Database

    Admin->>Frontend: Cập nhật đơn hàng thành "Hoàn thành"
    Frontend->>Backend: Yêu cầu cập nhật trạng thái đơn hàng
    Backend->>Database: Đổi trạng thái đơn hàng sang Hoàn thành
    Backend->>Database: Lấy danh sách thiết bị trong đơn hàng
    Database-->>Backend: Chi tiết các thiết bị
    Backend->>Backend: Tính toán thời gian bảo hành cho từng thiết bị
    Backend->>Database: Sinh dữ liệu bảo hành gắn với số Serial/SĐT
    Database-->>Backend: Xác nhận tạo bảo hành thành công
    Backend-->>Frontend: Trả về thông báo thành công
    Frontend-->>Admin: Cập nhật giao diện quản lý đơn hàng
```

---

### Hình 3.19: Sơ đồ tuần tự: Admin hủy đơn CANCELLED + hoàn kho
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Frontend
    participant Backend
    participant Database

    Admin->>Frontend: Chọn hủy đơn hàng
    Frontend->>Backend: Yêu cầu hủy đơn hàng
    Backend->>Database: Lấy thông tin đơn hàng hiện tại
    Database-->>Backend: Trả về thông tin
    Backend->>Database: Đổi trạng thái đơn hàng thành Đã hủy
    Backend->>Database: Lấy chi tiết số lượng sản phẩm trong đơn đã hủy
    Database-->>Backend: Danh sách số lượng sản phẩm
    Backend->>Database: Cộng lại số lượng sản phẩm vào kho (Hoàn kho)
    Database-->>Backend: Xác nhận hoàn kho thành công
    Backend-->>Frontend: Trả về kết quả hủy thành công
    Frontend-->>Admin: Cập nhật giao diện quản lý
```

---

### Hình 3.20: Sơ đồ tuần tự: Tra cứu bảo hành theo SĐT/Serial
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database

    Khách Hàng->>Frontend: Nhập Số điện thoại hoặc Số Serial thiết bị
    Frontend->>Backend: Gửi yêu cầu tra cứu bảo hành
    Backend->>Database: Tìm kiếm thông tin bảo hành tương ứng
    Database-->>Backend: Trả về kết quả tìm kiếm
    alt Không tìm thấy
        Backend-->>Frontend: Thông báo không tìm thấy thiết bị
        Frontend-->>Khách Hàng: Hiển thị lỗi không tìm thấy
    else Tìm thấy
        Backend-->>Frontend: Trả về thông tin (Thời hạn, lịch sử bảo hành)
        Frontend-->>Khách Hàng: Hiển thị chi tiết thông tin bảo hành
    end
```

---

### Hình 3.21: Sơ đồ tuần tự: Tạo yêu cầu bảo hành (ticket)
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database

    Khách Hàng->>Frontend: Chọn thiết bị đang bảo hành & mô tả tình trạng lỗi
    Frontend->>Backend: Gửi yêu cầu tạo phiếu bảo hành
    Backend->>Database: Kiểm tra thời hạn bảo hành của thiết bị
    Database-->>Backend: Trạng thái hợp lệ (còn hạn)
    Backend->>Database: Tạo phiếu yêu cầu bảo hành mới (Chờ tiếp nhận)
    Database-->>Backend: Xác nhận tạo thành công
    Backend-->>Frontend: Trả về mã phiếu bảo hành & kết quả thành công
    Frontend-->>Khách Hàng: Hiển thị thông báo thành công và mã theo dõi
```

---

### Hình 3.22: Sơ đồ tuần tự: Dùng thử sản phẩm + đặt cọc
```mermaid
sequenceDiagram
    autonumber
    actor Khách Hàng
    participant Frontend
    participant Backend
    participant Database
    participant Payment Gateway

    Khách Hàng->>Frontend: Chọn tham gia dùng thử thiết bị
    Frontend->>Backend: Gửi yêu cầu đăng ký dùng thử
    Backend->>Database: Kiểm tra điều kiện dùng thử
    Database-->>Backend: Kết quả đủ điều kiện
    Backend->>Database: Tạo hồ sơ dùng thử (Chờ đặt cọc)
    Backend->>Payment Gateway: Yêu cầu tạo phiên thanh toán tiền cọc
    Payment Gateway-->>Backend: Trả về đường dẫn thanh toán cọc
    Backend-->>Frontend: Trả về đường dẫn thanh toán
    Frontend-->>Khách Hàng: Chuyển người dùng đến trang thanh toán
    Khách Hàng->>Payment Gateway: Thực hiện thanh toán cọc
    Payment Gateway->>Backend: Gửi thông báo đặt cọc thành công
    Backend->>Database: Cập nhật trạng thái thành Đang dùng thử & ghi ngày hết hạn
    Backend-->>Frontend: Gửi thông báo thành công
    Frontend-->>Khách Hàng: Hiển thị xác nhận bắt đầu chu kỳ dùng thử
```

---

### Hình 3.23: Sơ đồ tuần tự: Cron trial-check hết hạn dùng thử
```mermaid
sequenceDiagram
    autonumber
    actor Hệ Thống (Cron Job)
    participant Backend
    participant Database
    participant Email Service

    Hệ Thống (Cron Job)->>Backend: Kích hoạt tiến trình quét hàng ngày
    Backend->>Database: Tìm kiếm các gói dùng thử sắp hết hạn hoặc đã quá hạn
    Database-->>Backend: Trả về danh sách gói dùng thử
    loop Quét qua từng gói dùng thử
        alt Sắp hết hạn (còn 1-2 ngày)
            Backend->>Email Service: Yêu cầu gửi email nhắc nhở sắp hết hạn
            Email Service-->>Khách Hàng: Nhận email nhắc nhở trả thiết bị
        else Đã quá hạn
            Backend->>Database: Đổi trạng thái gói dùng thử thành "Quá hạn"
            Backend->>Database: (Tùy chọn) Ghi nhận khấu trừ tiền cọc
            Backend->>Email Service: Yêu cầu gửi email thông báo quá hạn
            Email Service-->>Khách Hàng: Nhận email thông báo vi phạm/trừ cọc
        end
    end
    Backend-->>Hệ Thống (Cron Job): Kết thúc tiến trình quét
```
