-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th6 29, 2026 lúc 01:06 PM
-- Phiên bản máy phục vụ: 9.1.0
-- Phiên bản PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `tech_store`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `icon`) VALUES
(20, 'Laptop', 'laptop', 'Laptop'),
(21, 'Laptop Gaming', 'laptop-gaming', 'Laptop'),
(22, 'PC GVN', 'pc-gvn', 'Monitor'),
(23, 'Main, CPU, VGA', 'main-cpu-vga', 'Cpu'),
(24, 'Case, Nguồn, Tản', 'case-nguon-tan', 'Wind'),
(25, 'Ổ cứng, RAM, Thẻ nhớ', 'o-cung-ram-the-nho', 'Database'),
(26, 'Loa, Micro, Webcam', 'loa-micro-webcam', 'Volume2'),
(27, 'Màn hình', 'man-hinh', 'Monitor'),
(28, 'Bàn phím', 'ban-phim', 'Keyboard'),
(29, 'Chuột + Lót chuột', 'chuot-lot-chuot', 'MousePointer'),
(30, 'Tai Nghe', 'tai-nghe', 'Headphones'),
(31, 'Ghế - Bàn', 'ghe-ban', 'Armchair'),
(32, 'Phần mềm, mạng', 'phan-mem-mang', 'Network'),
(33, 'Handheld, Console', 'handheld-console', 'Gamepad'),
(34, 'Phụ kiện (Hub, sạc, cáp..)', 'phu-kien-hub-sac-cap', 'Usb'),
(35, 'Dịch vụ và thông tin khác', 'dich-vu-thong-tin-khac', 'HelpCircle');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `status` enum('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `note` text COLLATE utf8mb4_unicode_ci,
  `delivery_method` enum('pickup','shipping') COLLATE utf8mb4_unicode_ci DEFAULT 'shipping',
  `discount_applied` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `created_at`, `customer_name`, `customer_phone`, `shipping_address`, `note`, `delivery_method`, `discount_applied`) VALUES
(6, 1, 490000.00, 'COMPLETED', '2026-06-28 06:26:24', 'Admin G-Store', '0986046133', 'a, a, a, a', '', 'shipping', 0.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(5, 6, 154, 1, 490000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_vat_invoices`
--

DROP TABLE IF EXISTS `order_vat_invoices`;
CREATE TABLE IF NOT EXISTS `order_vat_invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `mst` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','ISSUED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `otp_codes`
--

DROP TABLE IF EXISTS `otp_codes`;
CREATE TABLE IF NOT EXISTS `otp_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email_or_phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `original_price` decimal(15,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `stock_refurbished` int DEFAULT '0',
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `specs` json DEFAULT NULL,
  `is_flash_sale` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `brand`, `price`, `original_price`, `stock`, `thumbnail`, `short_description`, `specs`, `is_flash_sale`) VALUES
(84, 20, 'MacBook Air 13-inch M3 8GB 256GB', 'macbook-air-13-inch-m3-8gb-256gb-p2ei', 'Apple', 27490000.00, 32990000.00, 50, NULL, 'Mỏng nhẹ đỉnh cao, hiệu năng chip M3 thế hệ mới sản xuất trên tiến trình 3nm.', '{\"general\": {\"Nhu cầu\": \"Văn phòng / Học tập / Đồ họa nhẹ\", \"Màu sắc\": \"Xám không gian (Space Gray)\", \"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"Apple\"}, \"detailed\": {\"Màn hình\": \"13.6 inch Liquid Retina (2560 x 1664), độ sáng 500 nits, dải màu rộng P3\", \"Bộ nhớ RAM\": \"8GB RAM Unified Memory (Hỗ trợ băng thông 100GB/s)\", \"Trọng lượng\": \"1.24 kg\", \"Dung lượng Pin\": \"Pin lithium-polymer 52.6 watt-giờ, thời lượng sử dụng lên đến 18 giờ\", \"Cổng giao tiếp\": \"2 x Thunderbolt / USB 4, Jack tai nghe 3.5mm, Cổng sạc MagSafe 3\", \"Hệ điều hành\": \"macOS Sequoia\", \"Ổ cứng lưu trữ\": \"256GB SSD PCIe tốc độ cao\", \"Bộ vi xử lý (CPU)\": \"Apple M3 chip với 8-core CPU (4 hiệu năng cao và 4 tiết kiệm điện)\", \"Card đồ họa (VGA)\": \"10-core GPU, Hỗ trợ Ray Tracing phần cứng\", \"Kết nối không dây\": \"Wi-Fi 6E (802.11ax), Bluetooth 5.3\", \"Bàn phím & Bảo mật\": \"Bàn phím Magic Keyboard có đèn nền, cảm biến vân tay Touch ID\"}}', 0),
(85, 20, 'Dell XPS 13 9340 Intel Core Ultra 7', 'dell-xps-13-9340-intel-core-ultra-7-bplp', 'Dell', 49990000.00, 54990000.00, 20, NULL, 'Đẳng cấp doanh nhân, viền màn hình vô cực InfinityEdge, phím bấm tràn viền.', '{\"general\": {\"Nhu cầu\": \"Doanh nhân / Sang trọng / Lập trình\", \"Màu sắc\": \"Bạc Platinum\", \"Bảo hành\": \"24 tháng ProSupport chính hãng\", \"Thương hiệu\": \"Dell\"}, \"detailed\": {\"Màn hình\": \"13.4 inch FHD+ (1920 x 1200) IPS, 500 nits, Chống chói, 100% sRGB, 120Hz\", \"Bộ nhớ RAM\": \"16GB LPDDR5X Dual Channel Bus 7467MHz (onboard)\", \"Trọng lượng\": \"1.19 kg\", \"Dung lượng Pin\": \"Pin 3-cell, 55 Wh Li-ion, củ sạc Type-C 60W sạc nhanh\", \"Cổng giao tiếp\": \"2 x Thunderbolt 4 (hỗ trợ DisplayPort và Power Delivery)\", \"Hệ điều hành\": \"Windows 11 Home SL + Office Home & Student 2021 bản quyền\", \"Ổ cứng lưu trữ\": \"512GB SSD M.2 PCIe Gen 4 NVMe\", \"Bộ vi xử lý (CPU)\": \"Intel Core Ultra 7 155H (16 nhân, 22 luồng, xung nhịp lên đến 4.8GHz, bộ nhớ đệm 24MB)\", \"Card đồ họa (VGA)\": \"Intel Arc Graphics tích hợp (Hỗ trợ tối ưu xử lý AI)\", \"Kết nối không dây\": \"Intel Killer Wi-Fi 7, Bluetooth 5.4\", \"Bàn phím & Bảo mật\": \"Bàn phím Zero-lattice có LED, Thanh điều khiển cảm ứng Touch Bar, Cảm biến vân tay & Camera nhận diện khuôn mặt Windows Hello\"}}', 0),
(86, 20, 'Asus Zenbook 14 OLED UX3405 Intel Ultra 5', 'asus-zenbook-14-oled-ux3405-intel-ultra-5-ymau', 'Asus', 24990000.00, 28990000.00, 35, NULL, 'Màn hình Lumina OLED 120Hz rực rỡ sắc nét, thời lượng pin bền bỉ ấn tượng.', '{\"general\": {\"Nhu cầu\": \"Văn phòng / Đồ họa hình ảnh / Giải trí phim ảnh\", \"Màu sắc\": \"Xanh lam (Ponder Blue)\", \"Bảo hành\": \"24 tháng chính hãng Asus Việt Nam\", \"Thương hiệu\": \"Asus\"}, \"detailed\": {\"Màn hình\": \"14.0 inch 3K (2880 x 1800) OLED 16:10, 120Hz, 600 nits HDR peak, 100% DCI-P3\", \"Bảo mật\": \"Camera IR FHD nhận diện khuôn mặt kết hợp màn che vật lý, bàn di chuột tích hợp phím số ảo ASUS NumberPad 2.0\", \"Bộ nhớ RAM\": \"16GB LPDDR5X 7467MHz onboard\", \"Trọng lượng\": \"1.20 kg\", \"Dung lượng Pin\": \"75 Whs Lithium-polymer, hỗ trợ sạc nhanh USB-C Easy Charge\", \"Cổng giao tiếp\": \"1 x USB 3.2 Gen 1 Type-A, 2 x Thunderbolt 4, 1 x HDMI 2.1 TMDS, 1 x Jack 3.5mm\", \"Hệ điều hành\": \"Windows 11 Home bản quyền\", \"Ổ cứng lưu trữ\": \"512GB SSD PCIe Gen 4.0 x4 NVMe M.2\", \"Bộ vi xử lý (CPU)\": \"Intel Core Ultra 5 125H (14 nhân, 18 luồng, lên đến 4.5GHz, 18MB Cache)\", \"Card đồ họa (VGA)\": \"Intel Arc Graphics chuyên dụng\", \"Kết nối không dây\": \"Wi-Fi 6E (802.11ax), Bluetooth 5.3\"}}', 0),
(87, 20, 'HP Envy x360 14-fa0013AU AMD Ryzen 5', 'hp-envy-x360-14-fa0013au-amd-ryzen-5-t4w1', 'HP', 20490000.00, 22990000.00, 25, NULL, 'Màn hình cảm ứng xoay gập 360 độ linh hoạt kèm bút cảm ứng cao cấp.', '{\"general\": {\"Nhu cầu\": \"Học tập / Sáng tạo nội dung / Trình chiếu\", \"Màu sắc\": \"Bạc ánh kim\", \"Bảo hành\": \"12 tháng chính hãng tận nơi\", \"Thương hiệu\": \"HP\"}, \"detailed\": {\"Màn hình\": \"14 inch WUXGA (1920 x 1200) IPS cảm ứng đa điểm, xoay gập 360 độ, kính Gorilla Glass\", \"Bộ nhớ RAM\": \"16GB LPDDR5 6400MHz (onboard)\", \"Trọng lượng\": \"1.39 kg\", \"Dung lượng Pin\": \"Pin 3-cell, 59 Wh Li-ion polymer\", \"Cổng giao tiếp\": \"2 x USB-C (hỗ trợ sạc và xuất hình), 2 x USB-A 3.2, 1 x HDMI 2.1, 1 x Audio Jack\", \"Hệ điều hành\": \"Windows 11 Home\", \"Ổ cứng lưu trữ\": \"512GB SSD PCIe NVMe M.2\", \"Bộ vi xử lý (CPU)\": \"AMD Ryzen 5 8640HS (6 nhân, 12 luồng, xung nhịp 3.5GHz - 4.9GHz, 16MB L3 Cache)\", \"Card đồ họa (VGA)\": \"AMD Radeon 760M Graphics tích hợp mạnh mẽ\", \"Kết nối không dây\": \"Wi-Fi 6 (2x2), Bluetooth 5.3\", \"Bàn phím & Phụ kiện\": \"Bàn phím có LED nền, Tặng kèm bút cảm ứng HP Stylus Pen\"}}', 0),
(88, 20, 'Lenovo ThinkPad X1 Carbon Gen 11', 'lenovo-thinkpad-x1-carbon-gen-11-lwu0', 'Lenovo', 52990000.00, 59990000.00, 15, NULL, 'Khung sợi carbon cao cấp, đạt độ bền quân đội MIL-SPEC 810H.', '{\"general\": {\"Nhu cầu\": \"Doanh nghiệp / Độ bền cao / Đi công tác\", \"Màu sắc\": \"Đen truyền thống dệt vân Carbon\", \"Bảo hành\": \"36 tháng chính hãng Premier Support\", \"Thương hiệu\": \"Lenovo\"}, \"detailed\": {\"Màn hình\": \"14.0 inch WUXGA (1920 x 1200) IPS, chống chói, độ sáng 400 nits, 100% sRGB, lọc ánh sáng xanh\", \"Bộ nhớ RAM\": \"32GB LPDDR5 6000MHz (onboard)\", \"Trọng lượng\": \"1.12 kg\", \"Dung lượng Pin\": \"57 Whr hỗ trợ sạc nhanh Rapid Charge (80% trong 60 phút)\", \"Cổng giao tiếp\": \"2 x Thunderbolt 4, 2 x USB-A 3.2 Gen 1, 1 x HDMI 2.1, 1 x Jack 3.5mm Combo\", \"Hệ điều hành\": \"Windows 11 Pro 64-bit bản quyền\", \"Ổ cứng lưu trữ\": \"1TB SSD PCIe Gen 4 NVMe Performance M.2\", \"Bộ vi xử lý (CPU)\": \"Intel Core i7-1355U (10 nhân, 12 luồng, xung nhịp lên đến 5.0GHz, 12MB Cache)\", \"Card đồ họa (VGA)\": \"Intel Iris Xe Graphics\", \"Kết nối không dây\": \"Wi-Fi 6E, Bluetooth 5.1\", \"Bàn phím & Bảo mật\": \"Bàn phím ThinkPad huyền thoại có chống tràn nước, nút đỏ TrackPoint, Camera IR nhận diện khuôn mặt, Cảm biến vân tay tích hợp nút nguồn\"}}', 0),
(89, 21, 'Laptop Gaming Acer Predator Helios 16 PH16-71-90EE', 'laptop-gaming-acer-predator-helios-16-ph16-71-90ee-ab71', 'Acer', 45990000.00, 52990000.00, 10, NULL, 'Chiến thần gaming thế hệ mới, tản nhiệt kim loại lỏng Liquid Metal độc quyền.', '{\"general\": {\"Nhu cầu\": \"Gaming chuyên nghiệp / Thiết kế đồ họa nặng\", \"Màu sắc\": \"Đen (Abyssal Black)\", \"Bảo hành\": \"24 tháng 3S1 (bảo hành nhanh trong 3 ngày kể cả thứ 7, chủ nhật)\", \"Thương hiệu\": \"Acer\"}, \"detailed\": {\"Bàn phím\": \"Bàn phím RGB từng phím (Per-key RGB) tùy chỉnh màu sắc qua phần mềm PredatorSense\", \"Màn hình\": \"16.0 inch WQXGA (2560 x 1600) IPS 240Hz, 100% DCI-P3, độ sáng 500 nits, G-Sync\", \"Bộ nhớ RAM\": \"16GB DDR5 Bus 5600MHz (2x8GB, hỗ trợ nâng cấp tối đa 32GB)\", \"Trọng lượng\": \"2.60 kg\", \"Dung lượng Pin\": \"Pin 4-cell Li-ion, 90 Wh\", \"Cổng giao tiếp\": \"2 x Thunderbolt 4, 3 x USB-A 3.2, 1 x HDMI 2.1, 1 x RJ45 mạng LAN, 1 x Khe đọc thẻ SD, Jack 3.5mm\", \"Hệ điều hành\": \"Windows 11 Home\", \"Ổ cứng lưu trữ\": \"1TB SSD PCIe Gen 4 NVMe M.2 (còn trống 1 khe nâng cấp)\", \"Bộ vi xử lý (CPU)\": \"Intel Core i9-13900HX (24 nhân, 32 luồng, xung nhịp tối đa 5.4GHz, 36MB Cache)\", \"Card đồ họa (VGA)\": \"NVIDIA GeForce RTX 4070 8GB GDDR6 (TGP tối đa lên tới 140W)\", \"Kết nối không dây\": \"Killer Wi-Fi 6E AX1675i, Bluetooth 5.1\"}}', 0),
(90, 21, 'Asus ROG Strix G16 G614JV Intel i7', 'asus-rog-strix-g16-g614jv-intel-i7-f3it', 'Asus', 35990000.00, 39990000.00, 15, NULL, 'Đèn LED Aura Sync rực rỡ bao quanh viền máy, tản nhiệt 3 quạt ROG Intelligent Cooling.', '{\"general\": {\"Nhu cầu\": \"Gaming eSports / Đồ họa 3D\", \"Màu sắc\": \"Xám giả lập (Eclipse Gray)\", \"Bảo hành\": \"24 tháng chính hãng Asus\", \"Thương hiệu\": \"Asus\"}, \"detailed\": {\"Màn hình\": \"16.0 inch FHD+ (1920 x 1200) IPS 165Hz, 100% sRGB, G-Sync, viền mỏng\", \"Bộ nhớ RAM\": \"16GB DDR5 4800MHz (2 khe cắm nâng cấp tối đa 32GB)\", \"Trọng lượng\": \"2.50 kg\", \"Dung lượng Pin\": \"90 Wh, củ sạc 280W sạc siêu tốc\", \"Cổng giao tiếp\": \"1 x RJ45, 1 x Thunderbolt 4, 1 x USB 3.2 Gen 2 Type-C, 2 x USB 3.2 Gen 2 Type-A, 1 x HDMI 2.1 FRL, 1 x Jack combo\", \"Hệ điều hành\": \"Windows 11 Home\", \"Ổ cứng lưu trữ\": \"512GB SSD M.2 NVMe PCIe 4.0\", \"Bộ vi xử lý (CPU)\": \"Intel Core i7-13650HX (14 nhân, 20 luồng, xung nhịp lên đến 4.9GHz, 24MB Cache)\", \"Card đồ họa (VGA)\": \"NVIDIA GeForce RTX 4060 8GB GDDR6 (TGP 140W)\", \"Kết nối không dây\": \"Wi-Fi 6E (802.11ax), Bluetooth 5.3\", \"Bàn phím & Tản nhiệt\": \"Bàn phím RGB 4 vùng cá tính, Keo tản nhiệt kim loại lỏng Thermal Grizzly Conductonaut Extreme trên CPU\"}}', 0),
(91, 21, 'Lenovo Legion 5 Pro 16ARH7 AMD Ryzen 7', 'lenovo-legion-5-pro-16arh7-amd-ryzen-7-vxtt', 'Lenovo', 32990000.00, 36990000.00, 12, NULL, 'Màn hình tỷ lệ vàng 16:10 2K 165Hz, tản nhiệt Coldfront 4.0 cực kỳ mát mẻ.', '{\"general\": {\"Nhu cầu\": \"Gaming / Lập trình / Thiết kế đa nhiệm\", \"Màu sắc\": \"Xám bão (Storm Grey)\", \"Bảo hành\": \"36 tháng Premium Care chính hãng\", \"Thương hiệu\": \"Lenovo\"}, \"detailed\": {\"Bàn phím\": \"Bàn phím Legion TrueStrike có LED RGB 4 vùng hành trình phím sâu\", \"Màn hình\": \"16.0 inch WQXGA (2560 x 1600) IPS 165Hz, 500 nits, 100% sRGB, Dolby Vision, FreeSync, G-Sync\", \"Bộ nhớ RAM\": \"16GB DDR5 4800MHz (2x8GB)\", \"Trọng lượng\": \"2.49 kg\", \"Dung lượng Pin\": \"Pin 4-cell, 80 Wh Li-polymer\", \"Cổng giao tiếp\": \"3 x USB-A 3.2, 3 x USB-C (hỗ trợ DisplayPort, sạc PD), 1 x HDMI, 1 x RJ45 mạng LAN, 1 x Jack combo\", \"Hệ điều hành\": \"Windows 11 Home\", \"Ổ cứng lưu trữ\": \"512GB SSD M.2 PCIe Gen 4 NVMe\", \"Bộ vi xử lý (CPU)\": \"AMD Ryzen 7 6800H (8 nhân, 16 luồng, xung nhịp 3.2GHz - 4.7GHz, 16MB Cache)\", \"Card đồ họa (VGA)\": \"NVIDIA GeForce RTX 3060 6GB GDDR6 (TGP 140W)\", \"Kết nối không dây\": \"Wi-Fi 6E (802.11ax), Bluetooth 5.1\"}}', 1),
(92, 21, 'MSI Katana 15 B13VGK Intel i7', 'msi-katana-15-b13vgk-intel-i7-kzve', 'MSI', 29990000.00, 34990000.00, 20, NULL, 'Thanh kiếm chiến đấu sắc lẹm của game thủ, card RTX 4070 mạnh nhất phân khúc.', '{\"general\": {\"Nhu cầu\": \"Chiến game nặng / Render video\", \"Màu sắc\": \"Đen nhám (Core Black)\", \"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"MSI\"}, \"detailed\": {\"Bàn phím\": \"Bàn phím có LED RGB 4 vùng chuyên biệt, làm nổi bật cụm phím WASD\", \"Màn hình\": \"15.6 inch FHD (1920 x 1080) IPS, 144Hz, viền mỏng\", \"Bộ nhớ RAM\": \"16GB DDR5 4800MHz (2x8GB)\", \"Trọng lượng\": \"2.25 kg\", \"Dung lượng Pin\": \"Pin 3-cell, 53.5 Wh\", \"Cổng giao tiếp\": \"1 x USB 3.2 Gen1 Type-C, 2 x USB 3.2 Gen1 Type-A, 1 x USB 2.0 Type-A, 1 x HDMI 2.1 (8K@60Hz), 1 x RJ45, 1 x Audio Combo\", \"Hệ điều hành\": \"Windows 11 Home\", \"Ổ cứng lưu trữ\": \"1TB SSD M.2 PCIe Gen 4 NVMe\", \"Bộ vi xử lý (CPU)\": \"Intel Core i7-13620H (10 nhân, 16 luồng, lên đến 4.9GHz, 24MB Cache)\", \"Card đồ họa (VGA)\": \"NVIDIA GeForce RTX 4070 8GB GDDR6\", \"Kết nối không dây\": \"Wi-Fi 6, Bluetooth 5.2\"}}', 0),
(93, 21, 'Gigabyte G5 KF5 Intel i5 RTX 4060', 'gigabyte-g5-kf5-intel-i5-rtx-4060-le9g', 'Gigabyte', 21990000.00, 24990000.00, 30, NULL, 'Laptop gaming phân khúc phổ thông được săn đón nhiều nhất.', '{\"general\": {\"Nhu cầu\": \"Gaming cơ bản / Học tập công nghệ\", \"Màu sắc\": \"Đen\", \"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Gigabyte\"}, \"detailed\": {\"Màn hình\": \"15.6 inch FHD (1920 x 1080) IPS 144Hz, dải màu sRGB 65%\", \"Bộ nhớ RAM\": \"8GB DDR4 Bus 3200MHz (trống 1 khe nâng cấp tối đa 64GB)\", \"Trọng lượng\": \"2.08 kg\", \"Dung lượng Pin\": \"Pin Lithium-Ion 54Wh\", \"Cổng giao tiếp\": \"1 x USB 2.0, 1 x USB 3.2 Gen1, 2 x USB 3.2 Gen2 Type-C, 1 x Mini DP, 1 x HDMI 2.1, 1 x Jack Audio, 1 x Jack Mic, 1 x RJ45, 1 x Đầu đọc thẻ SD\", \"Hệ điều hành\": \"Windows 11 Home\", \"Ổ cứng lưu trữ\": \"512GB M.2 PCIe Gen 4 SSD (Hỗ trợ 2 khe cắm M.2)\", \"Bàn phím & Âm thanh\": \"Bàn phím LED 15 màu tùy chỉnh, Hệ thống âm thanh DTS:X Ultra sống động\", \"Bộ vi xử lý (CPU)\": \"Intel Core i5-12500H (12 nhân, 16 luồng, xung nhịp lên đến 4.5GHz, 18MB Cache)\", \"Card đồ họa (VGA)\": \"NVIDIA GeForce RTX 4060 8GB GDDR6 (hỗ trợ MUX Switch)\", \"Kết nối không dây\": \"Intel Wi-Fi 6E, Bluetooth 5.2\"}}', 0),
(94, 22, 'PC GVN Viper i3050', 'pc-gvn-viper-i3050-1nic', 'GVN', 11990000.00, 13990000.00, 15, NULL, 'Cấu hình tối ưu ngân sách cho học sinh, sinh viên chiến game online cực mượt.', '{\"general\": {\"Nhu cầu\": \"Gaming eSports / Làm việc văn phòng\", \"Bảo hành\": \"36 tháng chính hãng linh kiện\", \"Thương hiệu\": \"GVN (GearVN)\"}, \"detailed\": {\"Bộ nhớ RAM\": \"Kingston FURY Beast 8GB DDR4 3200MHz\", \"Ổ cứng SSD\": \"SSD Kingston NV2 250GB M.2 PCIe NVMe Gen 4\", \"Vỏ máy (Case)\": \"Vỏ case Xigmatek với 3 quạt LED RGB đi kèm\", \"Tản nhiệt CPU\": \"Tản nhiệt khí mặc định của Intel\", \"Bộ nguồn (PSU)\": \"Deepcool PF550 550W chuẩn 80 Plus\", \"Bộ vi xử lý (CPU)\": \"Intel Core i3-12100F (4 nhân, 8 luồng, 3.3GHz - 4.3GHz, 12MB Cache)\", \"Card đồ họa (VGA)\": \"NVIDIA GeForce RTX 3060 8GB GDDR6 (hoặc RTX 3050 tùy lô hàng)\", \"Bo mạch chủ (Mainboard)\": \"ASUS Prime H610M-K DDR4\"}}', 0),
(95, 22, 'PC GVN Phantom i4060', 'pc-gvn-phantom-i4060-zo6a', 'GVN', 18990000.00, 21990000.00, 8, NULL, 'PC Gaming tầm trung cấu hình cao cấp với thế hệ VGA RTX 4060 Ada Lovelace.', '{\"general\": {\"Nhu cầu\": \"Chiến game Max Setting FHD / Stream game\", \"Bảo hành\": \"36 tháng bảo hành linh kiện tận nơi\", \"Thương hiệu\": \"GVN\"}, \"detailed\": {\"Bộ nhớ RAM\": \"Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz\", \"Ổ cứng SSD\": \"SSD Crucial P3 Plus 500GB M.2 Gen 4\", \"Vỏ máy (Case)\": \"Case Montech SKY TWO Black kính cường lực sang trọng\", \"Tản nhiệt CPU\": \"Tản nhiệt khí Deepcool AG400 ARGB mát mẻ\", \"Bộ nguồn (PSU)\": \"Cooler Master MWE Bronze V2 650W chuẩn 80 Plus Bronze\", \"Bộ vi xử lý (CPU)\": \"Intel Core i5-13400F (10 nhân, 16 luồng, up to 4.6GHz, 20MB Cache)\", \"Card đồ họa (VGA)\": \"ASUS Dual GeForce RTX 4060 EVO 8GB\", \"Bo mạch chủ (Mainboard)\": \"MSI PRO B760M-A WIFI DDR4\"}}', 0),
(96, 22, 'PC GVN Titan i4070', 'pc-gvn-titan-i4070-phsb', 'GVN', 29990000.00, 33990000.00, 5, NULL, 'Cấu hình siêu mạnh chiến game mượt mà ở độ phân giải 2K sắc nét.', '{\"general\": {\"Nhu cầu\": \"Chiến game AAA 2K / Làm phim chuyên nghiệp\", \"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"GVN\"}, \"detailed\": {\"Bộ nhớ RAM\": \"Corsair Vengeance RGB 32GB (2x16GB) DDR5 5600MHz\", \"Ổ cứng SSD\": \"SSD Samsung 990 Pro 500GB M.2 Gen4 NVMe\", \"Vỏ máy (Case)\": \"Lian Li LANCOOL 216 Black\", \"Tản nhiệt CPU\": \"Tản nhiệt nước AIO Deepcool LT720 360mm\", \"Bộ nguồn (PSU)\": \"Corsair RM750e 750W chuẩn 80 Plus Gold Full Modular\", \"Bộ vi xử lý (CPU)\": \"Intel Core i5-14600KF (14 nhân, 20 luồng, up to 5.3GHz, 24MB Cache)\", \"Card đồ họa (VGA)\": \"GIGABYTE GeForce RTX 4070 WINDFORCE OC 12G\", \"Bo mạch chủ (Mainboard)\": \"GIGABYTE B760 AORUS ELITE DDR5\"}}', 1),
(97, 22, 'PC GVN Ultimate i4090', 'pc-gvn-ultimate-i4090-7u5u', 'GVN', 89990000.00, 99990000.00, 2, NULL, 'Quái vật phần cứng, PC Gaming đỉnh cấp vũ trụ của Tech-Store.', '{\"general\": {\"Nhu cầu\": \"Chiến game 4K Ray Tracing / Xử lý dữ liệu AI / Deep Learning\", \"Bảo hành\": \"36 tháng tận nhà siêu tốc\", \"Thương hiệu\": \"GVN\"}, \"detailed\": {\"Bộ nhớ RAM\": \"G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz\", \"Ổ cứng SSD\": \"SSD Samsung 990 PRO 2TB M.2 PCIe Gen 4\", \"Vỏ máy (Case)\": \"Vỏ case ROG Strix Helios GX601 cực hầm hố\", \"Bộ nguồn (PSU)\": \"MSI MEG Ai1300P PCIe 5.0 1300W chuẩn Platinum\", \"Bộ vi xử lý (CPU)\": \"Intel Core i9-14900KS (24 nhân, 32 luồng, xung nhịp kỷ lục lên đến 6.2GHz)\", \"Card đồ họa (VGA)\": \"ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X\", \"Tản nhiệt nước CPU\": \"Tản nhiệt nước AIO ASUS ROG RYUJIN III 360 ARGB\", \"Bo mạch chủ (Mainboard)\": \"ASUS ROG MAXIMUS Z790 HERO WIFI DDR5\"}}', 0),
(98, 22, 'PC GVN G-Studio Intel i7', 'pc-gvn-g-studio-intel-i7-0rhb', 'GVN', 34990000.00, 38990000.00, 6, NULL, 'PC chuyên dụng cho các studio thiết kế, kiến trúc sư render hình ảnh.', '{\"general\": {\"Nhu cầu\": \"Render 3D Lumion / Revit / dựng phim Adobe Premiere\", \"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"GVN\"}, \"detailed\": {\"Bộ nhớ RAM\": \"Kingston FURY Beast 32GB (2x16GB) DDR5 5600MHz\", \"Ổ cứng SSD\": \"SSD Kingston KC3000 1TB M.2 PCIe 4.0 NVMe\", \"Vỏ máy (Case)\": \"Fractal Design North Charcoal Oak sang trọng\", \"Tản nhiệt CPU\": \"Tản nhiệt nước AIO Thermalright Frozen Prism 360 Black\", \"Bộ nguồn (PSU)\": \"Antec NeoECO 750W chuẩn Gold\", \"Bộ vi xử lý (CPU)\": \"Intel Core i7-14700K (20 nhân, 28 luồng, up to 5.6GHz, 33MB Cache)\", \"Card đồ họa (VGA)\": \"MSI GeForce RTX 4060 Ti VENTUS 3X OC 16G (Bộ nhớ lớn 16GB cực lợi render)\", \"Bo mạch chủ (Mainboard)\": \"ASUS TUF GAMING Z790-PLUS WIFI DDR5\"}}', 0),
(99, 23, 'CPU Intel Core i9-14900K', 'cpu-intel-core-i9-14900k-ocl3', 'Intel', 15490000.00, 16990000.00, 40, NULL, 'Bộ vi xử lý cao cấp thế hệ 14 Raptor Lake Refresh cho hiệu năng xử lý đa tác vụ đỉnh cao.', '{\"general\": {\"Socket\": \"LGA1700\", \"Dòng CPU\": \"Intel Core i9\", \"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"Intel\"}, \"detailed\": {\"Số nhân\": \"24 nhân (8 nhân P-core hiệu năng cao + 16 nhân E-core hiệu quả năng lượng)\", \"Số luồng\": \"32 luồng xử lý\", \"Tần số cơ bản\": \"P-core: 3.2 GHz, E-core: 2.4 GHz\", \"Hỗ trợ bộ nhớ\": \"DDR5 lên tới 5600 MT/s, DDR4 lên tới 3200 MT/s, Kênh đôi tối đa 192GB\", \"Đồ họa tích hợp\": \"Intel UHD Graphics 770\", \"Tần số Turbo tối đa\": \"Intel Thermal Velocity Boost: Lên đến 6.0 GHz\", \"Điện năng tiêu thụ (TDP)\": \"Công suất cơ bản: 125W, Công suất Turbo tối đa: 253W\", \"Bộ nhớ đệm (Intel Smart Cache)\": \"36 MB\"}}', 0),
(100, 23, 'VGA ASUS ROG Strix GeForce RTX 4080 Super OC', 'vga-asus-rog-strix-geforce-rtx-4080-super-oc-ite9', 'ASUS', 33990000.00, 36990000.00, 15, NULL, 'Card đồ họa cao cấp nhất dòng 4080 Super của ASUS, thiết kế hầm hố có LED RGB.', '{\"general\": {\"Dòng GPU\": \"NVIDIA GeForce RTX 4080 SUPER\", \"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"ASUS\"}, \"detailed\": {\"Nhân CUDA\": \"10240 nhân CUDA\", \"Kích thước\": \"357.6 x 149.3 x 70.1 mm (Dày 3.5 khe PCIe)\", \"Cổng kết nối\": \"2 x HDMI 2.1a, 3 x DisplayPort 1.4a (Hỗ trợ tối đa 4 màn hình)\", \"Xung nhịp OC Mode\": \"2670 MHz (Tăng tốc)\", \"Khuyên dùng nguồn\": \"Từ 750W trở lên (Đầu nguồn cắm: 1 x 16-pin)\", \"Băng thông bộ nhớ\": \"256-bit\", \"Dung lượng bộ nhớ\": \"16GB GDDR6X\", \"Hệ thống tản nhiệt\": \"3 quạt Axial-tech xoay ngược chiều tăng lượng gió, Khung kim loại đúc nguyên khối chống cong vênh\"}}', 1),
(101, 23, 'Mainboard MSI MAG B760M MORTAR WIFI', 'mainboard-msi-mag-b760m-mortar-wifi-158q', 'MSI', 4590000.00, 4990000.00, 25, NULL, 'Bo mạch chủ tầm trung thiết kế bọc thép chắc chắn, tích hợp Wifi 6E tốc độ cao.', '{\"general\": {\"Bảo hành\": \"36 tháng chính hãng\", \"Hỗ trợ CPU\": \"Intel Core thế hệ 12, 13, 14\", \"Kích cỡ Main\": \"Micro-ATX (M-ATX)\", \"Thương hiệu\": \"MSI\"}, \"detailed\": {\"Chipset\": \"Intel B760\", \"Khe cắm RAM\": \"4 khe cắm DDR5, hỗ trợ dung lượng tối đa 192GB, Bus tối đa 7000+(OC) MHz\", \"Kết nối mạng\": \"Cổng LAN Realtek 2.5Gbps, Tích hợp sẵn Wi-Fi 6E & Bluetooth 5.3\", \"Cổng I/O phía sau\": \"1 x USB 3.2 Gen 2x2 Type-C (20Gbps), 3 x USB 3.2 Gen 2, 4 x USB 2.0, 1 x HDMI 2.1, 1 x DisplayPort 1.4\", \"Khe cắm lưu trữ\": \"2 x khe cắm M.2 PCIe Gen 4.0 x4 tốc độ cao, 4 x cổng SATA 6G\", \"Khe cắm mở rộng\": \"1 x PCIe 5.0 x16 (Bọc thép), 1 x PCIe 4.0 x16, 1 x PCIe 3.0 x1\", \"Hệ thống cấp điện (VRM)\": \"Hệ thống nguồn 12+1+1 Duet Rail thiết kế tản nhiệt nhôm lớn đảm bảo ổn định CPU i7/i9\"}}', 0),
(102, 23, 'CPU AMD Ryzen 7 7800X3D', 'cpu-amd-ryzen-7-7800x3d-bt8n', 'AMD', 10490000.00, 11990000.00, 30, NULL, 'Vua chơi game của thời đại mới với công nghệ bộ nhớ đệm xếp chồng 3D V-Cache.', '{\"general\": {\"Socket\": \"AM5\", \"Dòng CPU\": \"AMD Ryzen 7\", \"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"AMD\"}, \"detailed\": {\"Hỗ trợ RAM\": \"DDR5 5200 MT/s, Kênh đôi\", \"Xung nhịp cơ bản\": \"4.2 GHz\", \"Số nhân/Số luồng\": \"8 nhân / 16 luồng\", \"Tiến trình sản xuất\": \"TSMC 5nm FinFET\", \"Tổng bộ nhớ đệm L3\": \"96 MB (Với công nghệ 3D V-Cache nâng tổng dung lượng đệm cực cao giúp game FPS tăng khung hình vượt trội)\", \"Xung nhịp tăng tốc (Boost)\": \"Up to 5.0 GHz\", \"Điện năng tiêu thụ (TDP)\": \"120W, Nhiệt độ hoạt động tối đa: 89°C\"}}', 0),
(103, 23, 'VGA Gigabyte GeForce RTX 4060 Ti Gaming OC 8G', 'vga-gigabyte-geforce-rtx-4060-ti-gaming-oc-8g-69ab', 'Gigabyte', 11490000.00, 12490000.00, 22, NULL, 'Card đồ họa tầm trung hệ thống tản nhiệt 3 quạt Windforce mát mẻ.', '{\"general\": {\"Dòng GPU\": \"NVIDIA GeForce RTX 4060 Ti\", \"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"Gigabyte\"}, \"detailed\": {\"Nhân CUDA\": \"4352\", \"Kích thước\": \"281 x 117 x 53 mm (Dày 2.5 khe cắm)\", \"Cổng kết nối\": \"2 x DisplayPort 1.4a, 2 x HDMI 2.1a\", \"Hệ thống làm mát\": \"Hệ thống WINDFORCE với 3 quạt 80mm quay xen kẽ, 3 ống dẫn nhiệt bằng đồng tiếp xúc trực tiếp GPU\", \"Băng thông bộ nhớ\": \"128-bit\", \"Dung lượng bộ nhớ\": \"8GB GDDR6\", \"Xung nhịp nhân đồ họa\": \"2580 MHz (Card hãng xung nhịp cao hơn bản Founder Edition 2535 MHz)\"}}', 1),
(104, 24, 'Nguồn Corsair RM850e 850W PCIe 5.0', 'nguon-corsair-rm850e-850w-pcie-50-8p6i', 'Corsair', 3190000.00, 3590000.00, 30, NULL, 'Nguồn máy tính đạt chuẩn 80 Plus Gold, hỗ trợ sẵn cáp nguồn 12VHPWR cấp điện trực tiếp VGA dòng RTX 4000.', '{\"general\": {\"Bảo hành\": \"7 năm chính hãng\", \"Công suất\": \"850W\", \"Chuẩn nguồn\": \"ATX 3.0 / PCIe 5.0\", \"Thương hiệu\": \"Corsair\"}, \"detailed\": {\"Dây cáp cấp điện\": \"Full Modular (Dây cáp tháo rời hoàn toàn)\", \"Đầu cắm linh kiện\": \"1 x 24-pin ATX, 2 x 8-pin EPS, 1 x 12+4-pin (12VHPWR), 3 x 8-pin PCIe, 7 x SATA\", \"Chứng nhận hiệu suất\": \"80 Plus Gold (Lên tới 90% hiệu suất thực tế)\", \"Kích thước quạt làm mát\": \"Quạt 120mm công nghệ Rifle Bearing chống ồn, tự động dừng quay khi tải nhẹ (Zero RPM Mode)\"}}', 0),
(105, 24, 'Tản nhiệt nước ASUS ROG RYUJIN III 360 ARGB', 'tan-nhiet-nuoc-asus-rog-ryujin-iii-360-argb-5zw3', 'ASUS', 9490000.00, 9990000.00, 12, NULL, 'Tản nhiệt nước AIO cao cấp màn hình LCD lớn 3.5 inch tùy biến ảnh động GIF.', '{\"general\": {\"Bảo hành\": \"72 tháng (6 năm) chính hãng\", \"Thương hiệu\": \"ASUS ROG\", \"Loại tản nhiệt\": \"Tản nhiệt nước AIO All-in-One\"}, \"detailed\": {\"Bơm\": \"Bơm Asetek thế hệ thứ 8 (Xung nhịp 800 - 3600 RPM)\", \"Màn hình LCD\": \"3.5 inch Full Color LCD hiển thị thông số hệ thống, hoạt ảnh GIF tùy biến, bộ nhớ trong 32MB\", \"Quạt làm mát\": \"3 x Quạt ROG Magnetic Daisy-chainable ARGB (120mm, tốc độ 600 - 2200 RPM, kết nối từ tính không dây nhợ)\", \"Tích hợp quạt phụ\": \"1 quạt ẩn trong lốc bơm làm mát trực tiếp dàn VRM bo mạch chủ xung quanh socket CPU\", \"Vật liệu két nước\": \"Nhôm cao cấp, Ống dẫn nước bọc dù dài 400mm\", \"Kích thước két nước (Radiator)\": \"399.5 x 120 x 30 mm\"}}', 0),
(106, 24, 'Case NZXT H9 Flow White', 'case-nzxt-h9-flow-white-uhat', 'NZXT', 4390000.00, 4790000.00, 18, NULL, 'Vỏ máy tính thiết kế bể cá sang trọng, tối ưu lưu thông gió.', '{\"general\": {\"Màu sắc\": \"Trắng tinh khôi (White)\", \"Bảo hành\": \"24 tháng\", \"Loại case\": \"Mid-Tower\", \"Thương hiệu\": \"NZXT\"}, \"detailed\": {\"Vật liệu vỏ\": \"Thép SGCC, 2 mặt kính cường lực phía trước và bên hông\", \"Quạt lắp sẵn\": \"Tặng kèm 4 quạt F120Q 120mm hiệu năng cao lắp sẵn\", \"Hỗ trợ mainboard\": \"Mini-ITX, Micro-ATX, ATX\", \"Hỗ trợ lắp quạt\": \"Bên hông: 3 x 120mm, Trên nóc: 3 x 120mm / 2 x 140mm, Dưới đáy: 3 x 120mm / 2 x 140mm, Đằng sau: 1 x 120mm\", \"Kích thước vỏ case\": \"466 x 290 x 495 mm\", \"Cổng kết nối phía trước\": \"2 x USB 3.2 Gen 1 Type-A, 1 x USB 3.2 Gen 2 Type-C, 1 x Headset Audio Jack\", \"Chiều cao tản khí CPU hỗ trợ\": \"Tối đa 165 mm\", \"Chiều dài card đồ họa hỗ trợ\": \"Tối đa 435 mm\"}}', 0),
(107, 24, 'Tản nhiệt khí Deepcool AK620 Digital', 'tan-nhiet-khi-deepcool-ak620-digital-r8p4', 'Deepcool', 1790000.00, 1990000.00, 28, NULL, 'Tản nhiệt tháp đôi trang bị mặt hiển thị số nhiệt độ CPU thời gian thực.', '{\"general\": {\"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"Deepcool\", \"Loại tản nhiệt\": \"Tản nhiệt khí dạng tháp\"}, \"detailed\": {\"Cấu tạo\": \"Tháp tản nhiệt đôi bằng nhôm dạng lưới ma trận, 6 ống dẫn nhiệt bằng đồng đường kính 6mm\", \"Quạt đi kèm\": \"2 x quạt 120mm PWM cánh quạt Fluid Dynamic Bearing (Tốc độ 500 - 1850 RPM, độ ồn tối đa 28 dBA)\", \"Độ cao tháp\": \"162 mm\", \"Hỗ trợ Socket\": \"Intel LGA 2066/2011-v3/2011/1700/1200/1151/1150/1155, AMD AM4/AM5\", \"Mặt hiển thị LED\": \"Hiển thị nhiệt độ CPU hoặc phần trăm sử dụng CPU theo thời gian thực (kết nối qua đầu cắm USB 2.0 trên mainboard)\", \"Kích thước tháp tản\": \"129 x 138 x 162 mm\", \"Khả năng tản nhiệt (TDP)\": \"Hỗ trợ CPU lên đến 260W TDP\"}}', 0),
(108, 24, 'Nguồn MSI MAG A650BN 650W', 'nguon-msi-mag-a650bn-650w-s7lh', 'MSI', 1290000.00, 1490000.00, 50, NULL, 'Bộ nguồn máy tính phân khúc phổ thông đạt chứng chỉ hiệu suất Bronze.', '{\"general\": {\"Bảo hành\": \"60 tháng (5 năm) chính hãng\", \"Công suất\": \"650W\", \"Chứng chỉ\": \"80 Plus Bronze\", \"Thương hiệu\": \"MSI\"}, \"detailed\": {\"Kiểu cáp\": \"Cáp liền bọc lưới đen thẩm mỹ\", \"Kích thước quạt\": \"Quạt 120mm độ ồn thấp điều khiển thông minh theo nhiệt độ\", \"Tính năng bảo vệ\": \"OVP (Quá áp), OCP (Quá dòng), OPP (Quá công suất), OTP (Quá nhiệt), SCP (Ngắn mạch)\", \"Thiết kế đường nguồn\": \"Single Rail 12V tối ưu dòng điện cho VGA gaming\"}}', 0),
(109, 25, 'SSD Samsung 990 Pro 1TB PCIe NVMe Gen 4', 'ssd-samsung-990-pro-1tb-pcie-nvme-gen-4-qwxy', 'Samsung', 2890000.00, 3290000.00, 45, NULL, 'Ổ cứng SSD tốc độ đọc ghi Gen 4 nhanh nhất hành tinh.', '{\"general\": {\"Bảo hành\": \"60 tháng (5 năm) chính hãng\", \"Dung lượng\": \"1TB (1000GB)\", \"Thương hiệu\": \"Samsung\", \"Chuẩn kết nối\": \"M.2 2280 NVMe Gen 4.0 x4\"}, \"detailed\": {\"Bộ nhớ đệm (Cache)\": \"1GB LPDDR4\", \"Đặc tính công nghệ\": \"Hỗ trợ mã hóa AES 256-bit bảo mật dữ liệu, tích hợp tản nhiệt mỏng mạ niken trên chip điều khiển\", \"Tốc độ ghi tuần tự\": \"Lên đến 6900 MB/s\", \"Tốc độ đọc tuần tự\": \"Lên đến 7450 MB/s\", \"Bộ điều khiển (Controller)\": \"Samsung Pascal Controller tự phát triển sản xuất\", \"Độ bền ghi dữ liệu (TBW)\": \"600 TBW\"}}', 0),
(110, 25, 'RAM Corsair Vengeance RGB DDR5 32GB (2x16GB) 5600MHz', 'ram-corsair-vengeance-rgb-ddr5-32gb-2x16gb-5600mhz-m1pj', 'Corsair', 3290000.00, 3690000.00, 35, NULL, 'Bộ nhớ RAM chuẩn DDR5 thế hệ mới hiệu năng băng thông rộng, LED RGB cá nhân hóa.', '{\"general\": {\"Loại RAM\": \"DDR5 cho PC để bàn\", \"Bảo hành\": \"36 tháng chính hãng\", \"Thương hiệu\": \"Corsair\"}, \"detailed\": {\"Dung lượng\": \"32GB (Gồm 2 thanh RAM 16GB chạy Dual Channel)\", \"Hỗ trợ tối ưu\": \"Intel XMP 3.0 (Kích hoạt một cú click trong BIOS), Tích hợp IC quản lý nguồn (PMIC) ngay trên bảng mạch RAM giúp cấp điện ổn định hơn\", \"Độ trễ (Latency)\": \"CL40 (40-40-40-77)\", \"Điện áp hoạt động\": \"1.25V\", \"Xung nhịp bộ nhớ (Bus)\": \"5600 MHz\"}}', 0),
(111, 25, 'Thẻ nhớ MicroSD SanDisk Extreme Pro 128GB', 'the-nho-microsd-sandisk-extreme-pro-128gb-9q4x', 'SanDisk', 490000.00, 590000.00, 80, NULL, 'Thẻ nhớ tốc độ cực cao, tương thích tốt nhất cho flycam, action camera.', '{\"general\": {\"Bảo hành\": \"60 tháng (5 năm) chính hãng\", \"Loại thẻ\": \"MicroSD (TF Card) tặng kèm adapter thẻ SD lớn\", \"Dung lượng\": \"128GB\", \"Thương hiệu\": \"SanDisk\"}, \"detailed\": {\"Chuẩn tốc độ\": \"Class 10, UHS Speed Class 3 (U3), Video Speed Class 30 (V30) hỗ trợ ghi video 4K UHD không giật cục\", \"Tính năng bảo vệ\": \"Chống nước, chống sốc, chịu nhiệt độ khắc nghiệt, chống tia X\", \"Tốc độ ghi tối đa\": \"Lên đến 90 MB/s\", \"Tốc độ đọc tối đa\": \"Lên đến 200 MB/s\", \"Chuẩn hiệu năng ứng dụng\": \"A2 (Giúp cài đặt và mở ứng dụng di động cực nhanh)\"}}', 0),
(112, 25, 'SSD Kingston NV2 2TB M.2 PCIe Gen 4', 'ssd-kingston-nv2-2tb-m2-pcie-gen-4-xms7', 'Kingston', 2990000.00, 3390000.00, 40, NULL, 'Ổ cứng SSD dung lượng cực lớn 2TB giá siêu hời phù hợp lưu trữ game nặng.', '{\"general\": {\"Bảo hành\": \"36 tháng chính hãng\", \"Dung lượng\": \"2TB (2000GB)\", \"Thương hiệu\": \"Kingston\", \"Chuẩn kích thước\": \"M.2 NVMe 2280 PCIe 4.0 x4\"}, \"detailed\": {\"Tốc độ ghi\": \"2800 MB/s\", \"Kiểu chip nhớ\": \"3D NAND Flash\", \"Tốc độ đọc\": \"3500 MB/s\", \"Độ bền ghi dữ liệu\": \"640 TBW\", \"Điện năng tiêu thụ tối đa\": \"3.4W\"}}', 0),
(113, 25, 'RAM Kingston Fury Beast RGB 16GB (1x16GB) DDR4 3200MHz', 'ram-kingston-fury-beast-rgb-16gb-1x16gb-ddr4-3200mhz-kfiq', 'Kingston', 1190000.00, 1390000.00, 60, NULL, 'Thanh RAM lẻ DDR4 dung lượng lớn 16GB, tích hợp LED RGB tự động đồng bộ.', '{\"general\": {\"Loại RAM\": \"DDR4 cho máy tính để bàn\", \"Bảo hành\": \"36 tháng chính hãng\", \"Dung lượng\": \"16GB (1 thanh lẻ)\", \"Thương hiệu\": \"Kingston\"}, \"detailed\": {\"Điện áp\": \"1.35V\", \"Độ trễ CAS\": \"CL16\", \"Tần số (Bus)\": \"3200 MHz\", \"Hỗ trợ ép xung\": \"Intel XMP-Ready & tương thích AMD Ryzen\", \"Công nghệ đèn LED\": \"Đồng bộ hóa hồng ngoại Kingston FURY Infrared Sync độc quyền tự căn đều nhịp đèn giữa các thanh RAM\"}}', 0),
(114, 26, 'Hệ thống Loa Logitech Z906 5.1 1000W', 'he-thong-loa-logitech-z906-51-1000w-93k5', 'Logitech', 8490000.00, 9490000.00, 15, NULL, 'Hệ thống loa vòm xem phim nghe nhạc cao cấp công suất rạp hát.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Logitech\", \"Hệ thống loa\": \"5.1 kênh (gồm 1 loa siêu trầm, 1 loa trung tâm, 4 loa vệ tinh)\"}, \"detailed\": {\"Bộ điều khiển\": \"Đi kèm bảng điều khiển trung tâm độc lập và điều khiển từ xa (Remote)\", \"Hỗ trợ giải mã\": \"Dolby Digital và DTS Digital Surround\", \"Chứng chỉ âm thanh\": \"THX Certified (Đạt tiêu chuẩn âm thanh rạp chiếu phim chất lượng cao)\", \"Loa siêu trầm (Subwoofer)\": \"Củ loa bass hướng đất 165W mạnh mẽ\", \"Cổng kết nối đầu vào\": \"2 x Cổng quang Optical, 1 x Coaxial, 1 x 6 kênh trực tiếp (3.5mm), 1 x RCA, 1 x 3.5mm phụ\", \"Tổng công suất định mức\": \"500 W RMS, Công suất đỉnh tối đa: 1000 W\"}}', 0),
(115, 26, 'Webcam Razer Kiyo Pro Ultra 4K', 'webcam-razer-kiyo-pro-ultra-4k-jo6j', 'Razer', 7990000.00, 8490000.00, 10, NULL, 'Webcam livestream sở hữu cảm biến lớn nhất lịch sử webcam mang lại chất lượng như máy ảnh DSLR.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"Razer\", \"Độ phân giải tối đa\": \"4K UHD (3840 x 2160)\"}, \"detailed\": {\"Lấy nét\": \"Auto Focus tự động theo khuôn mặt nhờ trí tuệ nhân tạo AI\", \"Bảo mật\": \"Tích hợp màn chắn vật lý đóng ống kính nhanh chóng\", \"Tốc độ khung hình\": \"4K @ 30fps / 1080p @ 60fps (Hỗ trợ nén video RAW không làm giảm chất lượng)\", \"Khẩu độ ống kính\": \"F/1.7 siêu rộng xóa phông tự nhiên\", \"Kích thước cảm biến\": \"Sony 1/1.2” STARVIS 2 (Bắt sáng cực đỉnh trong bóng tối)\", \"Độ rộng góc nhìn (FOV)\": \"Tùy chỉnh từ 72 đến 90 độ\"}}', 0),
(116, 26, 'Micro Razer Seiren Mini Black', 'micro-razer-seiren-mini-black-euyo', 'Razer', 1190000.00, 1390000.00, 40, NULL, 'Microphone condenser cổng USB nhỏ gọn âm thanh chuyên nghiệp cho họp hành và streamer.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Kết nối\": \"Cổng USB cắm là chạy (Plug and Play)\", \"Loại Micro\": \"Condenser (Micro thu âm điện dung)\", \"Thương hiệu\": \"Razer\"}, \"detailed\": {\"Tần số đáp ứng\": \"20Hz - 20kHz\", \"Bộ sản phẩm gồm\": \"Microphone, chân đế đứng, cáp sạc USB Micro-to-USB\", \"Đế đứng giảm chấn\": \"Đế kim loại chống rung nghiêng góc linh hoạt\", \"Độ phân giải âm thanh\": \"16-bit / 48kHz\", \"Bản mẫu định hướng thu âm\": \"Supercardioid (Tập trung thu âm trực diện phía trước, giảm thiểu triệt để tạp âm xung quanh)\"}}', 0),
(117, 26, 'Loa Bluetooth Marshall Emberton II', 'loa-bluetooth-marshall-emberton-ii-3nl9', 'Marshall', 4390000.00, 4790000.00, 25, NULL, 'Loa di động chống nước chuẩn IP67 phong cách thiết kế retro huyền thoại.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng ASH\", \"Kết nối\": \"Không dây Bluetooth 5.1\", \"Thương hiệu\": \"Marshall\"}, \"detailed\": {\"Thời gian sạc\": \"Sạc đầy trong 3 giờ, Hỗ trợ sạc nhanh 20 phút chơi được 4 giờ\", \"Công suất đầu ra\": \"2 x 10W Class D Amplifiers\", \"Hệ thống âm thanh\": \"Âm thanh đa hướng 360 độ (True Stereophonic)\", \"Tính năng Stack Mode\": \"Hỗ trợ kết nối không dây nhiều loa Marshall Emberton II lại với nhau để nhân đôi công suất phát nhạc\", \"Thời lượng chơi nhạc\": \"Hơn 30 giờ liên tục cho một lần sạc đầy\", \"Chuẩn chống bụi nước\": \"IP67 (Ngâm nước ở độ sâu 1m trong tối đa 30 phút)\"}}', 0),
(118, 26, 'Webcam Logitech C922 Pro Stream 1080p', 'webcam-logitech-c922-pro-stream-1080p-w23n', 'Logitech', 2190000.00, 2590000.00, 35, NULL, 'Webcam livestream tiêu chuẩn quốc dân dành cho streamer bán hàng, dạy học.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Logitech\", \"Độ phân giải\": \"1080p Full HD\"}, \"detailed\": {\"Âm thanh\": \"Trang bị 2 micro hai bên thu âm thanh nổi chân thực (Stereo)\", \"Lấy nét\": \"Tự động lấy nét nhanh chóng (Auto Focus)\", \"Ống kính\": \"Kính Full HD với góc nhìn chéo 78 độ\", \"Đi kèm chân đế\": \"Tặng kèm một chân đế ba chân (Tripod) mini có thể điều khiển kéo dài nâng độ cao\", \"Thông số khung hình\": \"1080p ở tốc độ 30 khung hình/giây, 720p ở tốc độ 60 khung hình/giây\"}}', 0),
(119, 27, 'Màn hình ASUS ROG Swift OLED PG27AQDM 27\" 2K 240Hz', 'man-hinh-asus-rog-swift-oled-pg27aqdm-27-2k-240hz-s63l', 'ASUS', 25990000.00, 28990000.00, 8, NULL, 'Màn hình OLED chuyên game cao cấp, thời gian phản hồi siêu tốc.', '{\"general\": {\"Bảo hành\": \"36 tháng chính hãng chống cháy hình OLED\", \"Thương hiệu\": \"ASUS ROG\", \"Tần số quét\": \"240Hz\", \"Kích thước màn hình\": \"26.9 inch\"}, \"detailed\": {\"Độ phân giải\": \"2K WQHD (2560 x 1440)\", \"Cổng xuất hình\": \"1 x DisplayPort 1.4, 2 x HDMI 2.0, Jack tai nghe 3.5mm, cổng USB hub\", \"Độ sáng màn hình\": \"450 nits cơ bản, Đỉnh đạt 1000 nits HDR\", \"Thời gian phản hồi\": \"0.03 ms (Gray to Gray)\", \"Tính năng đặc biệt\": \"Tích hợp tản nhiệt tùy chỉnh (Custom Heatsink) giảm nhiệt độ bảng mạch đến 12%, chống lưu ảnh màn hình OLED\", \"Loại tấm nền (Panel)\": \"OLED (Chất lượng hiển thị đen tuyệt đối)\", \"Độ bao phủ màu sắc\": \"99% dải màu điện ảnh DCI-P3, Delta E < 2\"}}', 0),
(120, 27, 'Màn hình Dell UltraSharp U2723QE 27\" IPS Black 4K', 'man-hinh-dell-ultrasharp-u2723qe-27-ips-black-4k-2rvh', 'Dell', 11990000.00, 12990000.00, 15, NULL, 'Màn hình chuyên đồ họa cao cấp 4K tích hợp cổng USB-C sạc ngược 90W.', '{\"general\": {\"Bảo hành\": \"36 tháng Advanced Exchange Service\", \"Thương hiệu\": \"Dell UltraSharp\", \"Độ phân giải\": \"4K UHD (3840 x 2160)\", \"Kích thước màn\": \"27 inch\"}, \"detailed\": {\"Tốc độ quét\": \"60Hz\", \"Cổng kết nối\": \"1 x DP 1.4, 1 x HDMI 2.0, 1 x USB-C (Hỗ trợ DP và cấp điện sạc Laptop lên tới 90W), 1 x RJ45 mạng dây trực tiếp, 4 x USB 3.2\", \"Độ phủ màu sắc\": \"100% sRGB, 100% Rec.709, 98% DCI-P3\", \"Thiết kế chân đế\": \"Thiết kế công thái học cao cấp, nâng hạ độ cao, xoay dọc màn hình 90 độ hai chiều\", \"Tấm nền hiển thị\": \"IPS Black (Tăng độ tương phản gấp đôi lên 2000:1 so với IPS thường)\"}}', 0),
(121, 27, 'Màn hình LG UltraGear 27GR75Q-B 27\" IPS 2K 165Hz', 'man-hinh-lg-ultragear-27gr75q-b-27-ips-2k-165hz-bg5d', 'LG', 5990000.00, 6990000.00, 30, NULL, 'Màn hình gaming quốc dân IPS chất lượng hình ảnh sắc nét mượt mà.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Kích thước\": \"27 inch\", \"Thương hiệu\": \"LG\", \"Tần số quét\": \"165Hz\"}, \"detailed\": {\"Tấm nền\": \"IPS (Góc nhìn rộng 178 độ)\", \"Độ sáng\": \"300 nits, Hỗ trợ HDR10\", \"Cổng giao tiếp\": \"2 x HDMI 2.0, 1 x DisplayPort 1.4, Đầu ra âm thanh Jack 3.5mm\", \"Độ phân giải\": \"2K QHD (2560 x 1440)\", \"Thời gian phản hồi\": \"1ms (GtG)\", \"Công nghệ chống xé hình\": \"NVIDIA G-Sync Compatible, AMD FreeSync Premium\"}}', 0),
(122, 27, 'Màn hình Samsung Odyssey G5 LC27G55T 27\" Cong 2K 144Hz', 'man-hinh-samsung-odyssey-g5-lc27g55t-27-cong-2k-144hz-670p', 'Samsung', 5490000.00, 6290000.00, 20, NULL, 'Màn hình cong góc nhìn bao quát, giảm mỏi mắt khi sử dụng thời gian dài.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Kích thước\": \"27 inch\", \"Thương hiệu\": \"Samsung\", \"Độ cong màn hình\": \"1000R (Độ cong lý tưởng nhất cho mắt người)\"}, \"detailed\": {\"Tấm nền\": \"VA (Độ tương phản đen sâu 3000:1)\", \"Tần số quét\": \"144Hz\", \"Cổng kết nối\": \"1 x HDMI 2.0, 1 x DisplayPort 1.2\", \"Độ phân giải\": \"2K QHD (2560 x 1440)\", \"Công nghệ hình ảnh\": \"AMD FreeSync Premium, HDR10\", \"Thời gian phản hồi\": \"1ms (MPRT)\"}}', 0),
(123, 27, 'Màn hình GIGABYTE G24F 2 24\" IPS 180Hz', 'man-hinh-gigabyte-g24f-2-24-ips-180hz-51a4', 'GIGABYTE', 3290000.00, 3690000.00, 40, NULL, 'Sự lựa chọn hoàn hảo cho game thủ chơi các tựa game FPS bắn súng.', '{\"general\": {\"Bảo hành\": \"36 tháng chính hãng\", \"Kích thước\": \"23.8 inch\", \"Thương hiệu\": \"GIGABYTE\", \"Tần số quét\": \"165Hz (Có thể ép xung lên 180Hz)\"}, \"detailed\": {\"Chân đế\": \"Hỗ trợ thay đổi độ cao nâng hạ 130mm và gập nghiêng góc màn hình\", \"Tấm nền\": \"Super Speed IPS (SS IPS)\", \"Độ phủ màu\": \"95% DCI-P3, 125% sRGB\", \"Cổng kết nối\": \"2 x HDMI 2.0, 1 x DisplayPort 1.2, 2 x USB 3.0, Jack cắm tai nghe 3.5mm\", \"Độ phân giải\": \"Full HD (1920 x 1080)\", \"Thời gian phản hồi\": \"1ms (MPRT) / 2ms (GtG)\"}}', 0),
(124, 28, 'Bàn phím cơ Akko 3087 v2 DS Matcha Red Switch', 'ban-phim-co-akko-3087-v2-ds-matcha-red-switch-k6wn', 'Akko', 1190000.00, 1390000.00, 35, NULL, 'Bàn phím cơ thiết kế gọn gàng, phím PBT bền bỉ không bị bóng mờ.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"Akko\", \"Loại bàn phím\": \"Bàn phím cơ (Mechanical Keyboard)\", \"Kiểu kết nối\": \"Kết nối dây rời Type-C tiện lợi\"}, \"detailed\": {\"Tính năng\": \"Hỗ trợ NKRO chống xung đột phím, khóa phím Windows khi chơi game\", \"Loại Switch\": \"Akko V2 Switch (Red Switch - lực nhấn tuyến tính 45g êm ái)\", \"Chất liệu Keycap\": \"PBT Double-Shot (In 2 lớp nhựa bền bỉ, chống mòn ký tự)\", \"Ký tự in (Profile)\": \"OEM Profile dễ làm quen gõ phím nhanh\", \"Kích thước (Layout)\": \"Tenkeyless - TKL 87 phím\"}}', 1),
(125, 28, 'Bàn phím Logitech Prodigy G213 RGB', 'ban-phim-logitech-prodigy-g213-rgb-szrq', 'Logitech', 890000.00, 1090000.00, 50, NULL, 'Bàn phím giả cơ cao cấp có bệ kê tay êm ái, phím điều khiển media riêng.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Logitech\", \"Kiểu kết nối\": \"Kết nối dây USB 2.0\"}, \"detailed\": {\"Loại phím\": \"Giả cơ Logitech Mech-Dome (Cho cảm giác nhấn phản hồi cơ học)\", \"Hệ thống LED\": \"Đèn LED RGB 5 vùng tùy chỉnh màu sắc qua Logitech G HUB\", \"Phím chức năng\": \"Cụm phím tăng giảm âm lượng và phát/dừng nhạc chuyên biệt\", \"Tính năng nổi bật\": \"Có khả năng chống tràn nước (Đã thử nghiệm với 60ml chất lỏng), Tích hợp sẵn bệ tỳ cổ tay cố định giúp đỡ mỏi tay\"}}', 0),
(126, 28, 'Bàn phím cơ Keychron K2 Nhôm Led RGB Gateron Switch', 'ban-phim-co-keychron-k2-nhom-led-rgb-gateron-switch-xt3d', 'Keychron', 2190000.00, 2390000.00, 25, NULL, 'Bàn phím cơ không dây Bluetooth bán chạy nhất của Keychron, khung nhôm đầm tay.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"Keychron\", \"Chất liệu khung\": \"Khung nhôm sơn tĩnh điện CNC\", \"Hệ điều hành tương thích\": \"Hỗ trợ tốt nhất cho macOS, iOS, Windows, Android (Có sẵn nút gạt chuyển đổi)\"}, \"detailed\": {\"Layout\": \"75% gọn gàng (84 phím)\", \"Switch\": \"Gateron G Pro Mechanical (Blue/Red/Brown Switch)\", \"Đèn nền\": \"LED RGB 18 chế độ sáng khác nhau\", \"Dung lượng Pin\": \"4000 mAh (Dùng liên tục lên tới 240 giờ khi tắt đèn nền)\", \"Kiểu kết nối\": \"Không dây Bluetooth 5.1 (Kết nối đồng thời 3 thiết bị) hoặc cắm dây USB Type-C\"}}', 0),
(127, 28, 'Bàn phím cơ Razer BlackWidow V4 Pro Green Switch', 'ban-phim-co-razer-blackwidow-v4-pro-green-switch-9jjh', 'Razer', 5490000.00, 5990000.00, 12, NULL, 'Siêu phẩm bàn phím cơ gaming của Razer, phím bấm phản hồi giòn giã có đệm kê tay bọc da.', '{\"general\": {\"Layout\": \"Fullsize 104 phím chuyên dụng cộng thêm 5 phím macro phụ\", \"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Razer\"}, \"detailed\": {\"Keycap\": \"Nhựa ABS Doubleshot siêu bền\", \"Loại Switch\": \"Razer Green Mechanical Switch (Clicky & Tactile - âm thanh gõ lớn vui tai)\", \"Hệ thống LED\": \"Razer Chroma RGB tràn viền 3 phía xung quanh bàn phím và đệm tay\", \"Bệ kê tay đi kèm\": \"Kê tay bọc da mềm kết nối bằng nam châm thông minh\", \"Núm xoay điều khiển\": \"Núm xoay Razer Dial đa chức năng góc trái và con lăn âm lượng góc phải\"}}', 1),
(128, 28, 'Bàn phím cơ Corsair K70 PRO RGB Cherry MX Red', 'ban-phim-co-corsair-k70-pro-rgb-cherry-mx-red-lz4n', 'Corsair', 3690000.00, 3990000.00, 18, NULL, 'Thương hiệu bàn phím cơ huyền thoại, vỏ nhôm phay xước siêu sang.', '{\"general\": {\"Layout\": \"Fullsize\", \"Switch\": \"CHERRY MX Red Mechanical (Tuyến tính, gõ mượt mà và yên tĩnh)\", \"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Corsair\"}, \"detailed\": {\"Keycap\": \"PBT Double-Shot dày 1.5mm chống bóng dầu\", \"Phụ kiện\": \"Đệm kê tay từ tính tháo rời dễ dàng, Cáp bọc dù USB-C rời tiện dụng\", \"Bộ vi xử lý\": \"Công nghệ xử lý siêu tốc CORSAIR AXON cho tần số phản hồi phím lên tới 8000Hz (Nhanh gấp 8 lần phím thường)\", \"Chất liệu bề mặt\": \"Nhôm phay xước chuẩn công nghiệp hàng không siêu bền\"}}', 0),
(129, 29, 'Chuột Logitech G502 Hero High Performance', 'chuot-logitech-g502-hero-high-performance-sdnt', 'Logitech', 990000.00, 1190000.00, 55, NULL, 'Chuột chơi game bán chạy nhất hành tinh, có hệ thống điều chỉnh cân nặng.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Kết nối\": \"Kết nối dây USB dài 2.1m\", \"Thương hiệu\": \"Logitech G\"}, \"detailed\": {\"Cảm biến\": \"HERO 25K (Độ phân giải tối đa 25,600 DPI, tracking 1:1 chuẩn xác)\", \"Cuộn chuột\": \"Nút cuộn siêu tốc Dual-mode (Cuộn vô cực cực nhanh hoặc cuộn từng nấc chính xác)\", \"Số nút bấm\": \"11 nút bấm có thể cấu hình phím tắt thông qua phần mềm Logitech G HUB\", \"Độ bền nút bấm\": \"Công tắc cơ học độ bền 50 triệu lần nhấn\", \"Trọng lượng cơ bản\": \"121 g (Đi kèm 5 viên tạ nhỏ mỗi viên nặng 3.6g có khay chứa dưới đáy để tùy chỉnh độ đầm của chuột)\"}}', 1),
(130, 29, 'Chuột Razer DeathAdder V3 Pro Wireless Black', 'chuot-razer-deathadder-v3-pro-wireless-black-sbb6', 'Razer', 3190000.00, 3590000.00, 20, NULL, 'Chuột gaming không dây siêu nhẹ được các game thủ chuyên nghiệp khuyên dùng.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Razer\", \"Trọng lượng\": \"Siêu nhẹ chỉ 63 g\", \"Kiểu kết nối\": \"Không dây Razer HyperSpeed Wireless hoặc cắm dây Type-C\"}, \"detailed\": {\"Cảm biến\": \"Razer Focus Pro 30K Optical Sensor (Độ chính xác tương thích mọi bề mặt kính dày từ 4mm)\", \"DPI tối đa\": \"30000 DPI, Gia tốc tối đa: 70 G\", \"Thời lượng Pin\": \"Lên tới 90 giờ hoạt động liên tục ở tần số gửi tín hiệu 1000Hz\", \"Công tắc nút bấm\": \"Razer Optical Mouse Switches Gen-3 (Độ bền 90 triệu click, không bị double-click)\"}}', 0),
(131, 29, 'Lót chuột Corsair MM300 Anti-Fray Cloth Extended', 'lot-chuot-corsair-mm300-anti-fray-cloth-extended-phkz', 'Corsair', 550000.00, 650000.00, 45, NULL, 'Bàn di chuột kích thước dài phủ kín mặt bàn thích hợp cho góc máy gọn gàng.', '{\"general\": {\"Bảo hành\": \"Không áp dụng bảo hành điện tử\", \"Kích thước\": \"930 x 300 x 3 mm (Extended)\", \"Thương hiệu\": \"Corsair\"}, \"detailed\": {\"Mặt dưới\": \"Lớp cao su tự nhiên tạo độ bám chống trơn trượt trên mặt bàn gỗ/kính\", \"Viền lót chuột\": \"Được vắt sổ, bo viền chỉ khâu chịu lực chống sờn rách mép\", \"Chất liệu bề mặt\": \"Vải dệt mịn tối ưu hóa khả năng kiểm soát chuột (Control) của mắt đọc quang học\"}}', 1),
(132, 29, 'Chuột SteelSeries Rival 3 Ergonomic', 'chuot-steelseries-rival-3-ergonomic-q1q2', 'SteelSeries', 790000.00, 890000.00, 35, NULL, 'Chuột gaming công thái học chất lượng tốt từ hãng SteelSeries của Đan Mạch.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Kiểu dáng\": \"Công thái học cho người thuận tay phải\", \"Thương hiệu\": \"SteelSeries\"}, \"detailed\": {\"Cảm biến\": \"TrueMove Core quang học\", \"Hệ thống LED\": \"Đèn LED RGB 3 vùng Prism Sync độc đáo\", \"Độ bền nút\": \"Công tắc cơ học độ bền 60 triệu lần click\", \"Vật liệu vỏ\": \"Nhựa ABS đen nhám chống bám mồ hôi vân tay\", \"Độ phân giải\": \"Từ 100 đến 8500 CPI\"}}', 1),
(133, 29, 'Lót chuột SteelSeries QcK Heavy Large', 'lot-chuot-steelseries-qck-heavy-large-g1hh', 'SteelSeries', 490000.00, 550000.00, 60, NULL, 'Dòng lót chuột dày dặn được các game thủ FPS (CS:GO, Valorant) ưa chuộng nhất thế giới.', '{\"general\": {\"Bảo hành\": \"Không\", \"Kích thước\": \"450 x 400 x 6 mm (Cỡ lớn)\", \"Thương hiệu\": \"SteelSeries\"}, \"detailed\": {\"Vệ sinh\": \"Dễ dàng giặt giũ làm sạch bằng nước lạnh\", \"Độ dày bàn di\": \"6 mm (Độ dày lớn giúp che lấp hoàn hảo những điểm mấp mô nhỏ trên mặt bàn gỗ, tạo mặt phẳng di chuột hoàn hảo)\", \"Chất liệu vải\": \"Vải QcK dệt vi mô độc quyền tối ưu hóa độ chính xác của chuột ở tốc độ di chuyển chậm\"}}', 0),
(134, 30, 'Tai nghe Razer BlackShark V2 X Gaming Headset', 'tai-nghe-razer-blackshark-v2-x-gaming-headset-vrh6', 'Razer', 1190000.00, 1390000.00, 40, NULL, 'Tai nghe gaming chụp tai cách âm thụ động cực tốt, đeo nhẹ nhàng.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Kết nối\": \"Jack cắm 3.5mm (Tương thích PC, Laptop, Console, Mobile)\", \"Kiểu tai nghe\": \"Over-ear (Chụp tai)\", \"Thương hiệu\": \"Razer\"}, \"detailed\": {\"Microphone\": \"Razer HyperClear Cardioid Mic cố định (Lọc âm giọng nói tập trung hướng thu)\", \"Đệm tai\": \"Đệm mút hoạt tính bọc vải thoáng khí Memory Foam cực êm, không gây đau tai khi đeo kính\", \"Trọng lượng\": \"Siêu nhẹ chỉ 240g\", \"Màng loa (Driver)\": \"Razer TriForce 50mm (Thiết kế màng loa 3 phần độc quyền tối ưu dải âm Bass, Mid, Treble)\", \"Công nghệ âm thanh\": \"Hỗ trợ giải thuật âm thanh vòm 7.1 Surround Sound\", \"Tần số đáp ứng\": \"12 Hz – 28 kHz\"}}', 0),
(135, 30, 'Tai nghe Logitech G435 Lightspeed Wireless Black', 'tai-nghe-logitech-g435-lightspeed-wireless-black-j31u', 'Logitech', 1490000.00, 1790000.00, 30, NULL, 'Tai nghe không dây siêu nhẹ và thời trang làm bằng vật liệu tái chế bảo vệ môi trường.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Logitech G\", \"Trọng lượng\": \"Siêu nhẹ kỷ lục 165 g\", \"Kết nối không dây\": \"Không dây Lightspeed USB dongle hoặc kết nối Bluetooth\"}, \"detailed\": {\"Màng loa\": \"40 mm\", \"Microphone\": \"Tích hợp micro kép công nghệ thu chùm sóng (Beamforming) loại bỏ micro cần dài cản trở trước miệng\", \"Thời lượng Pin\": \"Sử dụng liên tục lên đến 18 giờ sau mỗi lần sạc đầy\", \"Chứng chỉ thân thiện\": \"Đạt chứng chỉ CarbonNeutral thân thiện với môi trường, nhựa sản xuất chứa 22% nhựa tái chế\"}}', 1),
(136, 30, 'Tai nghe HyperX Cloud II Red', 'tai-nghe-hyperx-cloud-ii-red-a1hg', 'HyperX', 1790000.00, 1990000.00, 35, NULL, 'Chiếc tai nghe gaming huyền thoại, khung nhôm siêu bền bỉ đồng hành cùng nhiều thế hệ game thủ.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Kết nối\": \"USB Sound Card đi kèm điều khiển hoặc Jack 3.5mm gốc\", \"Thương hiệu\": \"HyperX\"}, \"detailed\": {\"Micro\": \"Microphone lọc nhiễu có thể tháo rời hoàn toàn khi không dùng\", \"Màng loa\": \"Củ loa động 53mm với nam châm đất hiếm\", \"Vật liệu chế tạo\": \"Khung nhôm dẻo chịu lực cực tốt, Đệm tai bọc da chất liệu bọt biển hoạt tính sang trọng\", \"Hộp điều khiển âm thanh\": \"Tích hợp Soundcard giả lập âm thanh vòm 7.1, có nút tăng giảm âm lượng mic và tai nghe riêng biệt\"}}', 0),
(137, 30, 'Tai nghe không dây chống ồn Sony WH-1000XM5', 'tai-nghe-khong-day-chong-on-sony-wh-1000xm5-3jkf', 'Sony', 6990000.00, 7990000.00, 18, NULL, 'Đỉnh cao tai nghe chống ồn chủ động (ANC) nghe nhạc cao cấp bậc nhất của Sony.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng Sony Việt Nam\", \"Thương hiệu\": \"Sony\", \"Kiểu kết nối\": \"Bluetooth 5.2 (Hỗ trợ giải mã âm thanh chất lượng cao LDAC)\"}, \"detailed\": {\"Độ nhạy\": \"102 dB/mW\", \"Trọng lượng\": \"250g\", \"Thời lượng Pin\": \"Lên tới 30 giờ sử dụng liên tục (Bật ANC), sạc nhanh 3 phút dùng được 3 giờ\", \"Đặc tính thông minh\": \"Tính năng Speak-to-Chat (Tự động dừng nhạc và bật âm thanh xung quanh khi phát hiện bạn bắt đầu nói chuyện)\", \"Công nghệ chống ồn\": \"Bộ xử lý chống ồn tích hợp V1 kết hợp Bộ xử lý chống ồn độ phân giải cao QN1 tự động tối ưu hóa theo môi trường xung quanh\"}}', 0),
(138, 30, 'Tai nghe Asus ROG Cetra True Wireless ANC', 'tai-nghe-asus-rog-cetra-true-wireless-anc-fx9m', 'Asus', 1790000.00, 2090000.00, 25, NULL, 'Tai nghe nhét tai (in-ear) không dây chống ồn chủ động tối ưu cho gaming di động.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Kiểu dáng\": \"True Wireless In-ear\", \"Thương hiệu\": \"ASUS ROG\"}, \"detailed\": {\"Sạc pin\": \"Hỗ trợ sạc không dây tiện lợi cho hộp sạc\", \"Kháng nước\": \"Đạt chuẩn kháng nước nhẹ IPX4 (Chống tia mồ hôi khi tập thể thao)\", \"Thời lượng Pin\": \"Sử dụng lên đến 27 giờ (Tai nghe 5.5 giờ + hộp sạc 21.5 giờ khi tắt ANC)\", \"Độ trễ truyền tải\": \"Chế độ Gaming Mode tối ưu độ trễ âm thanh siêu thấp dưới 60ms cho game bắn súng\", \"Chống ồn chủ động (ANC)\": \"Hỗ trợ chống ồn chủ động nhiều mức độ và chế độ xuyên âm (Ambient)\"}}', 1);
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `brand`, `price`, `original_price`, `stock`, `thumbnail`, `short_description`, `specs`, `is_flash_sale`) VALUES
(139, 31, 'Ghế Gaming Warrior Archer Series W.A301', 'ghe-gaming-warrior-archer-series-wa301-8th9', 'Warrior', 2590000.00, 2990000.00, 12, NULL, 'Ghế gaming đệm đúc êm ái, bọc da PU cao cấp dễ lau chùi.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"Warrior\", \"Chất liệu bọc\": \"Da PU chống xước vân da tự nhiên\"}, \"detailed\": {\"Bánh xe\": \"Bánh xe nhựa PU giảm tiếng ồn khi di chuyển trên sàn nhà\", \"Khung ghế\": \"Khung kim loại thép chịu lực gia cố chắc chắn\", \"Đệm ngồi\": \"Đệm đúc nguyên khối mật độ cao chống xẹp lún theo thời gian\", \"Trục thủy lực\": \"Class 4 đạt chứng nhận quốc tế SGS chịu tải trọng lên tới 120 kg\", \"Bệ đỡ & Ngả lưng\": \"Bệ đỡ kiểu cánh bướm nâng hạ, hỗ trợ ngả lưng tối đa 135 độ nằm nghỉ ngơi\"}}', 0),
(140, 31, 'Ghế Secretlab TITAN Evo 2022 Black', 'ghe-secretlab-titan-evo-2022-black-2auy', 'Secretlab', 12490000.00, 13490000.00, 5, NULL, 'Dòng ghế gaming công thái học xa xỉ, nâng đỡ hoàn hảo cột sống.', '{\"general\": {\"Bảo hành\": \"60 tháng (5 năm) chính hãng\", \"Chất liệu\": \"Da thế hệ mới Secretlab NEO Hybrid Leatherette (Bền hơn da PU thông thường gấp 12 lần)\", \"Thương hiệu\": \"Secretlab (Singapore)\"}, \"detailed\": {\"Kê tay\": \"Kê tay kim loại 4D nâng cấp hệ thống tháo lắp thay đổi mặt đệm từ tính CloudMix\", \"Gối tựa đầu\": \"Gối tựa đầu cao su non tích hợp nam châm hút trực tiếp vào tựa lưng (Không cần dây đai)\", \"Tựa lưng công thái học\": \"Hệ thống hỗ trợ thắt lưng L-ADAPT 4 chiều chỉnh độ cao và độ cong sâu của múi đệm lưng\"}}', 0),
(141, 31, 'Bàn Gaming E-Dra EGT1460', 'ban-gaming-e-dra-egt1460-txtr', 'E-Dra', 1490000.00, 1790000.00, 15, NULL, 'Bàn gaming chân thép chữ Z chịu lực tốt, mặt bàn phủ carbon sang trọng.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"E-Dra\", \"Chất liệu mặt bàn\": \"Gỗ ép cao cấp phủ chất liệu sợi Carbon chống trầy xước chống nước\"}, \"detailed\": {\"Khung chân bàn\": \"Chân thép chữ Z sơn tĩnh điện chịu lực cao (tải trọng tĩnh lên đến 80kg)\", \"Kích thước bàn\": \"Chiều dài 140cm x Chiều rộng 60cm x Chiều cao 75cm\", \"Tiện ích đi kèm\": \"Tích hợp khay để cốc nước chống đổ bên phải, móc treo tai nghe bên trái và hộp luồn dây gọn gàng\"}}', 0),
(142, 31, 'Ghế Gaming Corsair T3 Rush Charcoal', 'ghe-gaming-corsair-t3-rush-charcoal-z3m5', 'Corsair', 5490000.00, 5990000.00, 8, NULL, 'Ghế gaming bọc chất liệu vải dệt thông thoáng khí, êm ái mát mẻ.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Thương hiệu\": \"Corsair\", \"Chất liệu bọc\": \"Vải dệt mềm thoáng khí (Chống tích tụ nhiệt độ)\"}, \"detailed\": {\"Tay đỡ\": \"Kê tay 4D tùy biến (Di chuyển lên/xuống, trái/phải, tiến/lùi, xoay góc)\", \"Khung gầm\": \"Khung kim loại chắc chắn\", \"Góc ngả lưng\": \"Ngả lưng lên đến 180 độ nằm phẳng hoàn toàn\", \"Chiều cao lưng ghế\": \"85 cm, Chiều rộng đệm ngồi: 56 cm\"}}', 1),
(143, 31, 'Bàn làm việc nâng hạ thông minh ErgoDesk Pro 1.4m', 'ban-lam-viec-nang-ha-thong-minh-ergodesk-pro-14m-z31f', 'ErgoDesk', 6490000.00, 7490000.00, 10, NULL, 'Bàn làm việc thông minh tự động điều chỉnh độ cao bằng nút bấm cảm ứng.', '{\"general\": {\"Bảo hành\": \"60 tháng (5 năm) chính hãng khung bàn và động cơ\", \"Thương hiệu\": \"ErgoDesk\", \"Cơ chế hoạt động\": \"Động cơ điện kép (Dual Motor)\"}, \"detailed\": {\"Tải trọng nâng\": \"Nâng đỡ tối đa lên tới 120 kg hoạt động êm ái dưới 45 dBA\", \"Độ cao nâng hạ\": \"Từ 60 cm đến 125 cm (Có bảng LED hiển thị độ cao hiện tại)\", \"Cảm biến an toàn\": \"Tích hợp cảm biến chống va chạm (Tự động dừng lại và đảo chiều nâng hạ khi gặp chướng ngại vật cản)\", \"Tính năng bộ nhớ\": \"Ghi nhớ sẵn 3 vị trí độ cao thường dùng của người sử dụng\", \"Kích thước mặt bàn\": \"140 cm x 70 cm x 2.5 cm\"}}', 0),
(144, 32, 'Router Wifi Asus RT-AX86U Pro Wifi 6', 'router-wifi-asus-rt-ax86u-pro-wifi-6-hh6j', 'Asus', 5990000.00, 6490000.00, 15, NULL, 'Router wifi chuẩn Wi-Fi 6 siêu tốc, chuyên dụng tối ưu đường truyền game.', '{\"general\": {\"Bảo hành\": \"36 tháng chính hãng\", \"Chuẩn Wi-Fi\": \"Wi-Fi 6 (802.11ax) Dual Band (Băng kép)\", \"Thương hiệu\": \"ASUS\"}, \"detailed\": {\"Ăng-ten\": \"3 ăng-ten rời bên ngoài và 1 ăng-ten ngầm bên trong\", \"Bộ vi xử lý\": \"CPU Quad-core 2.0 GHz thế hệ mới cực mạnh xử lý dữ liệu truyền tải\", \"Cổng giao tiếp\": \"1 x Cổng WAN 2.5 Gbps, 1 x Cổng WAN/LAN 1 Gbps, 4 x Cổng LAN 1 Gbps, 1 x USB 3.2, 1 x USB 2.0\", \"Công nghệ bảo mật\": \"WPA3 Personal/Enterprise, ASUS AiProtection Pro trọn đời bảo vệ thiết bị kết nối mạng\", \"Tốc độ truyền dữ liệu\": \"Lên đến 5700 Mbps (2.4GHz: 861 Mbps, 5GHz: 4804 Mbps)\"}}', 0),
(145, 32, 'Windows 11 Home Bản Quyền FPP', 'windows-11-home-ban-quyen-fpp-vul7', 'Microsoft', 3190000.00, 3490000.00, 100, NULL, 'Hệ điều hành Windows 11 Home chính hãng bản quyền vĩnh viễn, dạng thẻ USB FPP chuyển đổi máy được.', '{\"general\": {\"Bảo hành\": \"Hỗ trợ kích hoạt trọn đời từ Microsoft\", \"Thương hiệu\": \"Microsoft\", \"Hình thức bản quyền\": \"Hộp vật lý FPP (Full Packaged Product) đi kèm USB cài đặt chứa key bản quyền\"}, \"detailed\": {\"Ngôn ngữ\": \"Đa ngôn ngữ (English, Tiếng Việt...)\", \"Thời hạn bản quyền\": \"Vĩnh viễn theo 1 tài khoản Microsoft\", \"Khả năng chuyển đổi\": \"Hỗ trợ chuyển đổi cấp quyền từ máy tính cũ sang máy tính mới (Mỗi thời điểm chỉ kích hoạt 1 máy)\"}}', 0),
(146, 32, 'Office Home & Student 2021 Bản Quyền vĩnh viễn', 'office-home-student-2021-ban-quyen-vinh-vien-fl69', 'Microsoft', 2090000.00, 2290000.00, 100, NULL, 'Bộ ứng dụng văn phòng thiết yếu chính hãng sử dụng vĩnh viễn không cần thuê bao.', '{\"general\": {\"Bảo hành\": \"Chính hãng Microsoft\", \"Thời hạn\": \"Bản quyền sử dụng vĩnh viễn không hết hạn\", \"Thương hiệu\": \"Microsoft\"}, \"detailed\": {\"Hình thức giao hàng\": \"Dạng thẻ cào vật lý chứa mã kích hoạt hoặc Key điện tử kích hoạt trực tiếp trên tài khoản Microsoft\", \"Các ứng dụng bao gồm\": \"Microsoft Word, Microsoft Excel, Microsoft PowerPoint\", \"Số thiết bị kích hoạt\": \"Kích hoạt cho 1 máy tính PC hoặc Mac\"}}', 0),
(147, 32, 'Phần mềm diệt virus Kaspersky Standard 3 PCs 1 năm', 'phan-mem-diet-virus-kaspersky-standard-3-pcs-1-nam-87im', 'Kaspersky', 350000.00, 390000.00, 200, NULL, 'Giải pháp bảo mật toàn diện chống virus, mã độc tống tiền trojan.', '{\"general\": {\"Bảo hành\": \"Hỗ trợ kỹ thuật chính hãng Kaspersky Việt Nam\", \"Thương hiệu\": \"Kaspersky\", \"Thời hạn bản quyền\": \"12 tháng (1 năm) kể từ ngày kích hoạt\"}, \"detailed\": {\"Tính năng chính\": \"Quét virus thời gian thực, Bảo vệ giao dịch thanh toán trực tuyến, Tích hợp sẵn VPN bảo mật lướt web ẩn danh\", \"Số lượng thiết bị\": \"Kích hoạt sử dụng đồng thời trên 3 thiết bị (PC, Mac, Android, iOS)\"}}', 0),
(148, 32, 'Router Wifi TP-Link Archer AX55 Wifi 6', 'router-wifi-tp-link-archer-ax55-wifi-6-z9qj', 'TP-Link', 1690000.00, 1990000.00, 45, NULL, 'Router wifi chuẩn Wifi 6 thế hệ mới tốc độ cao, hỗ trợ Mesh phủ sóng rộng.', '{\"general\": {\"Bảo hành\": \"24 tháng chính hãng\", \"Chuẩn Wi-Fi\": \"Wi-Fi 6 (802.11ax)\", \"Thương hiệu\": \"TP-Link\"}, \"detailed\": {\"Ăng-ten\": \"4 ăng-ten ngoài độ nhạy cao công nghệ Beamforming truyền tín hiệu trực tiếp thiết bị\", \"Cổng kết nối\": \"1 x Cổng WAN Gigabit, 4 x Cổng LAN Gigabit, 1 x USB 3.0\", \"Tốc độ không dây\": \"Đạt 3000 Mbps (5GHz: 2402 Mbps, 2.4GHz: 574 Mbps)\", \"Hỗ trợ mạng lưới (Mesh)\": \"Tương thích công nghệ EasyMesh cho phép kết nối các router TP-Link khác tạo mạng lưới đồng nhất không góc chết\"}}', 0),
(149, 33, 'Máy chơi game Nintendo Switch OLED Model White', 'may-choi-game-nintendo-switch-oled-model-white-b7hw', 'Nintendo', 7490000.00, 8490000.00, 30, NULL, 'Máy chơi game cầm tay đa năng thế hệ mới của Nintendo với màn hình OLED rực rỡ.', '{\"general\": {\"Màn hình\": \"7.0 inch OLED cảm ứng đa điểm\", \"Bảo hành\": \"12 tháng tại cửa hàng\", \"Thương hiệu\": \"Nintendo\"}, \"detailed\": {\"Thời lượng Pin\": \"Sử dụng liên tục từ 4.5 đến 9 tiếng tùy thuộc vào game chơi nặng nhẹ\", \"Độ phân giải màn hình\": \"720p khi cầm tay, Xuất hình ảnh 1080p khi gắn vào dock cắm TV qua cổng HDMI\", \"Dung lượng bộ nhớ trong\": \"64GB (Hỗ trợ khe cắm thẻ nhớ mở rộng MicroSD lên tới 2TB)\", \"Cổng kết nối trên Dock cắm\": \"Cổng xuất HDMI, Cổng LAN mạng dây (Tích hợp sẵn trên Dock OLED), 2 cổng USB\"}}', 0),
(150, 33, 'Máy chơi game Sony PlayStation 5 Slim Standard Edition', 'may-choi-game-sony-playstation-5-slim-standard-edition-mmpo', 'Sony', 12990000.00, 14490000.00, 15, NULL, 'Máy chơi game console gia đình PS5 phiên bản Slim ổ đĩa vật lý gọn gàng.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng Sony Việt Nam\", \"Phiên bản\": \"PS5 Slim Standard Edition (Có ổ đĩa)\", \"Thương hiệu\": \"Sony\"}, \"detailed\": {\"Đồ họa\": \"Kiến trúc AMD Radeon RDNA 2, hỗ trợ Ray Tracing phần cứng\", \"Bộ nhớ RAM\": \"16GB GDDR6\", \"Tay cầm đi kèm\": \"1 x Tay cầm không dây DualSense có công nghệ rung phản hồi Haptic Feedback và cò súng mô phỏng lực cản Adaptive Triggers\", \"Ổ cứng lưu trữ\": \"SSD 1TB chuẩn siêu tốc NVMe\", \"Khả năng xuất hình\": \"Hỗ trợ tivi 4K tần số quét 120Hz, Tivi độ phân giải 8K\"}}', 0),
(151, 33, 'Máy chơi game cầm tay Steam Deck OLED 512GB', 'may-choi-game-cam-tay-steam-deck-oled-512gb-2i53', 'Valve', 15490000.00, 16990000.00, 12, NULL, 'Máy chơi game cầm tay mạnh mẽ nhất chạy kho game Steam của bạn ở bất cứ đâu.', '{\"general\": {\"Màn hình\": \"7.4 inch HDR OLED 90Hz\", \"Bảo hành\": \"12 tháng tại cửa hàng\", \"Thương hiệu\": \"Valve (Steam)\"}, \"detailed\": {\"Kết nối\": \"Wi-Fi 6E băng tần kép, Bluetooth 5.3\", \"Bộ nhớ RAM\": \"16GB LPDDR5 6400MT/s\", \"Bộ vi xử lý\": \"APU AMD 6nm (Zen 2 4 nhân/8 luồng, GPU RDNA 2 8 CUs)\", \"Dung lượng Pin\": \"Pin 50Whr (Thời lượng chơi game từ 3 đến 12 giờ tùy cấu hình game)\", \"Độ phân giải\": \"1280 x 800 pixels (Tỷ lệ 16:10), Độ sáng đỉnh 1000 nits HDR\", \"Ổ cứng lưu trữ\": \"512GB NVMe SSD tốc độ cao\"}}', 1),
(152, 33, 'Máy chơi game cầm tay ASUS ROG Ally RC71L Z1 Extreme', 'may-choi-game-cam-tay-asus-rog-ally-rc71l-z1-extreme-4exd', 'Asus', 14990000.00, 17990000.00, 18, NULL, 'Máy chơi game cầm tay chạy hệ điều hành Windows 11 cấu hình CPU AMD cực mạnh.', '{\"general\": {\"Màn hình\": \"7 inch IPS 120Hz\", \"Bảo hành\": \"24 tháng chính hãng Asus\", \"Thương hiệu\": \"ASUS ROG\", \"Hệ điều hành\": \"Windows 11 Home bản quyền\"}, \"detailed\": {\"Bộ nhớ RAM\": \"16GB LPDDR5 6400MHz (Dual Channel)\", \"Bộ vi xử lý\": \"AMD Ryzen Z1 Extreme (8 nhân, 16 luồng, đồ họa RDNA 3 lên tới 8.6 Teraflops)\", \"Ổ cứng lưu trữ\": \"512GB PCIe 4.0 NVMe M.2 SSD (Kích thước 2230)\", \"Hệ thống tản nhiệt\": \"Tản nhiệt kép ROG Intelligent Cooling hoạt động êm ái chống trọng lực\", \"Độ phân giải màn hình\": \"FHD (1920 x 1080), 120Hz, độ phản hồi 7ms, hỗ trợ FreeSync Premium\"}}', 0),
(153, 33, 'Máy chơi game Xbox Series X 1TB Console', 'may-choi-game-xbox-series-x-1tb-console-piq0', 'Microsoft', 13490000.00, 14990000.00, 10, NULL, 'Máy chơi game console gia đình mạnh nhất của Microsoft hỗ trợ đĩa game vật lý.', '{\"general\": {\"Bảo hành\": \"12 tháng\", \"Thương hiệu\": \"Microsoft\", \"Dung lượng lưu trữ\": \"SSD 1TB NVMe mở rộng được\"}, \"detailed\": {\"Đồ họa\": \"GPU AMD RDNA 2 customized đạt hiệu năng 12.15 Teraflops\", \"Bộ vi xử lý\": \"CPU AMD Zen 2 customized 8 nhân ở xung nhịp 3.8GHz\", \"Công nghệ âm thanh\": \"Dolby Digital 5.1, DTS 5.1, Dolby TrueHD với Atmos\", \"Khả năng xử lý hình ảnh\": \"True 4K Gaming, hỗ trợ lên tới 8K HDR và tốc độ 120 khung hình/giây\"}}', 0),
(154, 34, 'Hub chuyển đổi đa năng Ugreen USB-C 6-in-1', 'hub-chuyen-doi-da-nang-ugreen-usb-c-6-in-1-is9w', 'Ugreen', 490000.00, 590000.00, 99, NULL, 'Cổng Hub mở rộng cắm là chạy tiện lợi cho Macbook và các dòng laptop mỏng nhẹ chỉ có cổng Type-C.', '{\"general\": {\"Bảo hành\": \"18 tháng chính hãng (Lỗi 1 đổi 1)\", \"Thương hiệu\": \"Ugreen\", \"Cổng kết nối đầu vào\": \"USB Type-C\"}, \"detailed\": {\"Cổng sạc ngược\": \"1 x USB-C hỗ trợ công nghệ sạc nhanh Power Delivery lên đến 100W\", \"Cổng xuất hình ảnh\": \"1 x HDMI (Hỗ trợ truyền hình ảnh độ phân giải 4K ở tần số 30Hz)\", \"Đầu đọc thẻ nhớ\": \"1 x Khe đọc thẻ SD, 1 x Khe đọc thẻ MicroSD (Hỗ trợ đọc đồng thời cả hai thẻ)\", \"Cổng truyền dữ liệu\": \"2 x USB 3.0 (Tốc độ truyền tệp tin lên tới 5Gbps)\"}}', 1),
(155, 34, 'Củ sạc nhanh Anker GaNPrime 65W 3 cổng', 'cu-sac-nhanh-anker-ganprime-65w-3-cong-ek0e', 'Anker', 890000.00, 990000.00, 75, NULL, 'Sạc nhanh công nghệ vật liệu bán dẫn GaNPrime thế hệ mới siêu nhỏ gọn.', '{\"general\": {\"Bảo hành\": \"18 tháng chính hãng Anker Việt Nam\", \"Thương hiệu\": \"Anker\", \"Công suất tối đa\": \"65W Max\"}, \"detailed\": {\"Cổng sạc\": \"2 x USB-C, 1 x USB-A\", \"Tính năng an toàn\": \"ActiveShield 2.0 kiểm soát giám sát nhiệt độ thông minh hơn 3 triệu lần mỗi ngày để bảo vệ thiết bị\", \"Kích thước củ sạc\": \"Nhỏ hơn 53% so với củ sạc 61W của Apple\", \"Công nghệ phân bổ nguồn\": \"PowerIQ 4.0 tự động nhận diện thiết bị cắm và phân phối công suất sạc tối ưu nhất\"}}', 0),
(156, 34, 'Cáp HDMI Baseus High Definition 4K 2.0 2m', 'cap-hdmi-baseus-high-definition-4k-20-2m-9352', 'Baseus', 150000.00, 190000.00, 120, NULL, 'Dây cáp kết nối truyền tín hiệu hình ảnh HDMI 4K siêu bền bọc vải dù.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"Baseus\", \"Độ dài cáp\": \"2 mét\"}, \"detailed\": {\"Chuẩn HDMI\": \"HDMI 2.0 (Hỗ trợ xuất hình ảnh 4K độ phân giải ở tần số quét 60Hz)\", \"Chất liệu lõi cáp\": \"Đồng nguyên chất chống nhiễu, các đầu tiếp xúc mạ vàng 24K chống ô-xy hóa truyền dẫn ổn định\", \"Chất liệu vỏ cáp\": \"Bọc vải dù nylon dệt mật độ cao chống đứt gãy gập gẫy gập\"}}', 1),
(157, 34, 'Pin sạc dự phòng Anker PowerCore 20000mAh sạc nhanh 22.5W', 'pin-sac-du-phong-anker-powercore-20000mah-sac-nhanh-225w-goa1', 'Anker', 690000.00, 790000.00, 60, NULL, 'Pin sạc dự phòng dung lượng cực lớn sạc nhanh tiện lợi mang đi du lịch.', '{\"general\": {\"Bảo hành\": \"18 tháng chính hãng\", \"Thương hiệu\": \"Anker\", \"Dung lượng Pin\": \"20,000 mAh\"}, \"detailed\": {\"Cổng sạc\": \"1 x USB-C (Hỗ trợ sạc vào và ra), 2 x USB-A sạc ra thiết bị\", \"Công suất sạc ra\": \"22.5W Max sạc nhanh qua cổng USB-C\", \"Số lần sạc ước tính\": \"Sạc được khoảng 4.3 lần cho iPhone 14, hoặc 3 lần cho iPad mini 6\"}}', 0),
(158, 34, 'Cáp sạc Baseus Explorer USB-C to USB-C 100W 1m', 'cap-sac-baseus-explorer-usb-c-to-usb-c-100w-1m-0tgs', 'Baseus', 120000.00, 150000.00, 150, NULL, 'Cáp sạc nhanh công suất lớn lên tới 100W, có đèn LED hiển thị trạng thái sạc.', '{\"general\": {\"Bảo hành\": \"12 tháng chính hãng\", \"Thương hiệu\": \"Baseus\", \"Chiều dài cáp\": \"1 mét\"}, \"detailed\": {\"Tính năng\": \"Đèn LED chỉ báo trạng thái sạc nhanh ở đầu cáp sạc, chip quản lý nguồn thông minh chống quá tải nhiệt\", \"Công suất sạc\": \"Hỗ trợ sạc nhanh công suất tối đa 100W (20V/5A) sạc tốt cho laptop/MacBook và iPad\", \"Tốc độ truyền dữ liệu\": \"480 Mbps truyền tải ảnh nhạc nhanh chóng\"}}', 0),
(159, 35, 'Dịch vụ vệ sinh bảo dưỡng PC/Laptop toàn diện', 'dich-vu-ve-sinh-bao-duong-pclaptop-toan-dien-81t8', 'Tech-Store', 150000.00, 250000.00, 9999, NULL, 'Dịch vụ vệ sinh hút bụi máy tính chuyên nghiệp, giúp tối ưu nhiệt độ linh kiện.', '{\"general\": {\"Địa điểm\": \"Trực tiếp tại showroom hoặc tại nhà khách hàng\", \"Thời gian xử lý\": \"30 - 45 phút\", \"Đơn vị thực hiện\": \"Phòng kỹ thuật Tech-Store\"}, \"detailed\": {\"Các bước thực hiện\": \"1. Hút sạch bụi bẩn bên trong máy. 2. Tra keo tản nhiệt ARCTIC MX-4 cao cấp cho CPU/GPU. 3. Vệ sinh cánh quạt tản nhiệt. 4. Lau sạch các cổng cắm kết nối ngoại vi ngoại quan.\", \"Quyền lợi khách hàng\": \"Được xem trực tiếp quá trình kỹ thuật viên tháo lắp vệ sinh thiết bị máy tính\"}}', 0),
(160, 35, 'Dịch vụ lắp ráp PC theo yêu cầu tại showroom', 'dich-vu-lap-rap-pc-theo-yeu-cau-tai-showroom-5roo', 'Tech-Store', 200000.00, 300000.00, 9999, NULL, 'Đội ngũ kỹ thuật viên tay nghề cao hỗ trợ tư vấn và lắp ráp PC chuyên nghiệp.', '{\"general\": {\"Đơn vị\": \"Kỹ thuật viên Tech-Store\", \"Thời gian thực hiện\": \"60 - 90 phút tùy độ phức tạp của dàn máy\"}, \"detailed\": {\"Nghiệp vụ bao gồm\": \"Lắp ráp toàn bộ các linh kiện phần cứng (CPU, Main, RAM, VGA, PSU, Case), đi dây bó gọn gàng thẩm mỹ, tối ưu luồng gió lưu thông trong case\", \"Kiểm tra sau lắp ráp\": \"Test bật máy ổn định, cài đặt driver cập nhật BIOS bản mới nhất\"}}', 0),
(161, 35, 'Gói bảo hành mở rộng Tech-Care thêm 1 năm cho Laptop', 'goi-bao-hanh-mo-rong-tech-care-them-1-nam-cho-laptop-2jm2', 'Tech-Store', 990000.00, 1200000.00, 9999, NULL, 'An tâm sử dụng thiết bị lâu dài hơn với gói nâng cấp bảo hành từ cửa hàng.', '{\"general\": {\"Thời hạn gói\": \"12 tháng (1 năm) sau khi hết hạn bảo hành gốc của hãng\", \"Đơn vị cung cấp\": \"Trung tâm bảo hành Tech-Store\"}, \"detailed\": {\"Quyền lợi gói\": \"Miễn phí 100% công sửa chữa thay thế linh kiện lỗi phần cứng phát sinh trong thời gian bảo hành mở rộng (ngoại trừ rơi vỡ, ngập nước)\", \"Phạm vi áp dụng\": \"Áp dụng cho các sản phẩm Laptop mua mới tại cửa hàng Tech-Store\"}}', 0),
(162, 35, 'Dịch vụ cài đặt hệ điều hành & phần mềm văn phòng cơ bản', 'dich-vu-cai-dat-he-dieu-hanh-phan-mem-van-phong-co-ban-e7vq', 'Tech-Store', 100000.00, 150000.00, 9999, NULL, 'Cài đặt sạch hệ điều hành ổn định, không phần mềm rác.', '{\"general\": {\"Hình thức\": \"Cài đặt trực tiếp tại showroom\", \"Thời gian thực hiện\": \"30 - 50 phút\"}, \"detailed\": {\"Hệ điều hành\": \"Cài đặt Windows 10/11 Home hoặc Pro bản cập nhật mới nhất\", \"Ứng dụng đi kèm\": \"Cài đặt bộ Office cơ bản, trình duyệt Chrome/Edge, bộ gõ Unikey tiếng Việt, phần mềm giải nén WinRAR, phần mềm đọc PDF Acrobat Reader\"}}', 0),
(163, 35, 'Dịch vụ sửa chữa phần cứng PC/Laptop lấy ngay', 'dich-vu-sua-chua-phan-cung-pclaptop-lay-ngay-h107', 'Tech-Store', 300000.00, 450000.00, 9999, NULL, 'Khắc phục nhanh chóng các sự cố phần cứng chập nguồn, mất hiển thị màn hình.', '{\"general\": {\"Bảo hành dịch vụ\": \"Bảo hành 3 tháng cho lỗi linh kiện sửa chữa\", \"Đơn vị sửa chữa\": \"Kỹ thuật viên phần cứng chuyên sâu Tech-Store\"}, \"detailed\": {\"Cam kết\": \"Linh kiện thay thế chính hãng mới 100%, khách hàng ký tên lên linh kiện khi gửi máy qua đêm\", \"Các lỗi hỗ trợ sửa\": \"Sửa lỗi chập nguồn IC trên mainboard, hàn cổng cắm USB/HDMI bị gãy tiếp xúc, thay thế cell pin chai, thay bàn phím/màn hình Laptop hỏng lấy ngay\"}}', 0),
(164, 21, 'abc', 'abc-1782627723374', 'sony', 54000000.00, 56000000.00, 12, '/uploads/1782627704146_Gemini_Generated_Image_fnq1emfnq1emfnq1.png', '', '{\"general\": {\"Tên\": \"\", \"Nhu cầu\": \"\", \"Màu sắc\": \"\", \"Bảo hành\": \"\", \"Part-number\": \"\", \"Series model\": \"\", \"Thương hiệu\": \"\"}, \"detailed\": {\"CPU\": \"\", \"Pin\": \"\", \"RAM\": \"DDR4\", \"Webcam\": \"\", \"Bàn phím\": \"\", \"Lưu trữ\": \"\", \"Màn hình\": \"\", \"Chất liệu\": \"\", \"Kích thước\": \"\", \"Khối lượng\": \"\", \"Chip đồ họa\": \"\", \"Cổng kết nối\": \"\", \"Hệ điều hành\": \"\", \"Trong hộp có gì\": \"\", \"Đèn LED trên máy\": \"\", \"Kết nối không dây\": \"\"}}', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_main` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `url`, `is_main`) VALUES
(24, 164, '/uploads/1782627704146_Gemini_Generated_Image_fnq1emfnq1emfnq1.png', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_relations`
--

DROP TABLE IF EXISTS `product_relations`;
CREATE TABLE IF NOT EXISTS `product_relations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `related_product_id` int NOT NULL,
  `relation_type` enum('bought_together','cross_sell','related') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_relation_unique` (`product_id`,`related_product_id`,`relation_type`),
  KEY `related_product_id` (`related_product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','STAFF','USER') COLLATE utf8mb4_unicode_ci DEFAULT 'USER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `address` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `created_at`, `address`) VALUES
(1, 'Admin G-Store', 'admin@gstore.com', '@Nhl123.', '0986046133', 'ADMIN', '2026-05-16 17:03:21', '1159 Braxton Street,TPHCM'),
(2, 'Hoàng Lực', 'nguyenhoangluc@gmail.com', '@Nhl123.', '0986046131', 'USER', '2026-05-16 17:23:52', '1159 Braxton Street'),
(3, 'Nguyễn Văn Ts', 'nguyenvantest1@gmail.com', '739af6500bb306dc11c5e2bb9902478f:78ae3319ed092411134cf7da6581ac92d56efd5fd72452234c8ab0a4d02017ec5f2511cbe63d4a42c3594028e102c814c19a1a4d298e8ae057eb280ca6582fd6', '0986046132', 'STAFF', '2026-05-21 01:07:34', '1159 Braxton Street'),
(6, 'NH L', 'abc@gmail.com', '312cba1825597d88a6422c7b460ab2a4:56b7b3acc121b9108f2e55ebce105dc1f50ebd588fa87fb18720a7a2ea509dde177f7e220486150f8cdd16d4713a4529195feb0dd90e0bd3fe03c4e9226b559a', '0986046134', 'STAFF', '2026-05-31 14:55:04', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `label` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Nhà riêng',
  `receiver_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warranties`
--

DROP TABLE IF EXISTS `warranties`;
CREATE TABLE IF NOT EXISTS `warranties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serial_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('ACTIVE','EXPIRED','CLAIMED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `warranties`
--

INSERT INTO `warranties` (`id`, `order_id`, `product_id`, `customer_phone`, `serial_number`, `start_date`, `end_date`, `status`) VALUES
(3, 6, 154, '0986046133', 'SN-6-154-P5MNUW', '2026-06-28', '2028-06-28', 'ACTIVE');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warranty_tickets`
--

DROP TABLE IF EXISTS `warranty_tickets`;
CREATE TABLE IF NOT EXISTS `warranty_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warranty_id` int NOT NULL,
  `issue_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('RECEIVED','SENT_TO_MANUFACTURER','REPAIRED_EXCHANGED','READY_FOR_PICKUP','CLOSED','PENDING_APPROVAL','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'RECEIVED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `receive_condition` text COLLATE utf8mb4_unicode_ci,
  `new_serial_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `staff_notes` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `type` enum('OFFLINE','ONLINE') COLLATE utf8mb4_unicode_ci DEFAULT 'OFFLINE',
  `customer_address` text COLLATE utf8mb4_unicode_ci,
  `media_urls` json DEFAULT NULL,
  `shipping_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_method` enum('SHOWROOM','SHIPPER') COLLATE utf8mb4_unicode_ci DEFAULT 'SHOWROOM',
  PRIMARY KEY (`id`),
  KEY `warranty_id` (`warranty_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `order_vat_invoices`
--
ALTER TABLE `order_vat_invoices`
  ADD CONSTRAINT `fk_vat_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product_relations`
--
ALTER TABLE `product_relations`
  ADD CONSTRAINT `product_relations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_relations_ibfk_2` FOREIGN KEY (`related_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `warranties`
--
ALTER TABLE `warranties`
  ADD CONSTRAINT `warranties_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `warranties_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `warranty_tickets`
--
ALTER TABLE `warranty_tickets`
  ADD CONSTRAINT `warranty_tickets_ibfk_1` FOREIGN KEY (`warranty_id`) REFERENCES `warranties` (`id`) ON DELETE CASCADE;
-- --------------------------------------------------------
--
-- Cấu trúc bảng cho bảng `options` và `product_options`
--

CREATE TABLE IF NOT EXISTS `options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `spec_group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_option` (`spec_group`, `name`, `value`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_options` (
  `product_id` int NOT NULL,
  `option_id` int NOT NULL,
  PRIMARY KEY (`product_id`, `option_id`),
  KEY `option_id` (`option_id`),
  CONSTRAINT `fk_po_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_option` FOREIGN KEY (`option_id`) REFERENCES `options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Di chuyển dữ liệu 'general' specs từ cột json sang bảng options
INSERT IGNORE INTO `options` (`spec_group`, `name`, `value`)
SELECT DISTINCT
  'general' AS spec_group,
  key_table.opt_name,
  JSON_UNQUOTE(JSON_EXTRACT(p.specs, CONCAT('$.general."', key_table.opt_name, '"'))) AS opt_value
FROM products p
JOIN JSON_TABLE(
  JSON_KEYS(p.specs, '$.general'),
  '$[*]' COLUMNS (
    opt_name VARCHAR(191) PATH '$'
  )
) key_table ON p.specs IS NOT NULL AND JSON_KEYS(p.specs, '$.general') IS NOT NULL;

-- Di chuyển dữ liệu 'detailed' specs từ cột json sang bảng options
INSERT IGNORE INTO `options` (`spec_group`, `name`, `value`)
SELECT DISTINCT
  'detailed' AS spec_group,
  key_table.opt_name,
  JSON_UNQUOTE(JSON_EXTRACT(p.specs, CONCAT('$.detailed."', key_table.opt_name, '"'))) AS opt_value
FROM products p
JOIN JSON_TABLE(
  JSON_KEYS(p.specs, '$.detailed'),
  '$[*]' COLUMNS (
    opt_name VARCHAR(191) PATH '$'
  )
) key_table ON p.specs IS NOT NULL AND JSON_KEYS(p.specs, '$.detailed') IS NOT NULL;

-- Liên kết sản phẩm và thuộc tính 'general' trong product_options
INSERT IGNORE INTO `product_options` (`product_id`, `option_id`)
SELECT 
  p.id AS product_id,
  o.id AS option_id
FROM products p
JOIN JSON_TABLE(
  JSON_KEYS(p.specs, '$.general'),
  '$[*]' COLUMNS (
    opt_name VARCHAR(191) PATH '$'
  )
) key_table ON p.specs IS NOT NULL AND JSON_KEYS(p.specs, '$.general') IS NOT NULL
JOIN `options` o ON o.spec_group = 'general' 
                 AND o.name = key_table.opt_name 
                 AND o.value = JSON_UNQUOTE(JSON_EXTRACT(p.specs, CONCAT('$.general."', key_table.opt_name, '"')));

-- Liên kết sản phẩm và thuộc tính 'detailed' trong product_options
INSERT IGNORE INTO `product_options` (`product_id`, `option_id`)
SELECT 
  p.id AS product_id,
  o.id AS option_id
FROM products p
JOIN JSON_TABLE(
  JSON_KEYS(p.specs, '$.detailed'),
  '$[*]' COLUMNS (
    opt_name VARCHAR(191) PATH '$'
  )
) key_table ON p.specs IS NOT NULL AND JSON_KEYS(p.specs, '$.detailed') IS NOT NULL
JOIN `options` o ON o.spec_group = 'detailed' 
                 AND o.name = key_table.opt_name 
                 AND o.value = JSON_UNQUOTE(JSON_EXTRACT(p.specs, CONCAT('$.detailed."', key_table.opt_name, '"')));

-- Xóa cột specs cũ trong bảng products
ALTER TABLE `products` DROP COLUMN `specs`;

-- 8. Thêm cột lưu vết người đóng gói và người giao hàng vào bảng orders
ALTER TABLE `orders` 
  ADD COLUMN `packer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN `shipper_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN `shipper_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- 9. Tạo bảng order_timeline_logs để lưu vết chi tiết từng khâu
CREATE TABLE IF NOT EXISTS `order_timeline_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `packer_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipper_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipper_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_otl_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Thêm cột phục vụ nghiệp vụ dùng thử (Try Before You Buy) và đặt cọc vào bảng orders
ALTER TABLE `orders` 
  ADD COLUMN `is_trial` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `trial_expired_at` timestamp NULL DEFAULT NULL,
  ADD COLUMN `trial_status` enum('TRIALING','APPROVED_PAID','REJECTED_RETURN','COLLECTED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN `trial_feedback` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN `deposit_amount` decimal(15,2) DEFAULT '0.00',
  ADD COLUMN `deposit_status` enum('PENDING_DEPOSIT','DEPOSITED','REFUNDED','FORFEITED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN `deposit_note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- 11. Tạo bảng trial_notifications lưu vết tin nhắn SMS tự động khi hết hạn dùng thử
CREATE TABLE IF NOT EXISTS `trial_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('SENT', 'FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'SENT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tn_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Thêm cột parent_id và khóa ngoại vào bảng categories phục vụ danh mục cha-con
ALTER TABLE `categories` 
  ADD COLUMN `parent_id` int DEFAULT NULL,
  ADD CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

-- ============================================================
-- 13. Nghiệp vụ 3: Một dòng đơn hàng mua nhiều máy, mỗi máy
--     phải có Serial Number (S/N) vật lý riêng biệt.
--
-- Vấn đề gốc: order_items.quantity = 2 nhưng chỉ sinh 1 bảo hành
--             dùng chung một mã S/N tự động → sai thực tế.
--
-- Giải pháp:
--   (a) Tạo bảng trung gian `order_item_serials`:
--       Nhân viên đóng gói bắt buộc phải quét (scan) đúng số lượng
--       S/N bằng với quantity của dòng đó trước khi chuyển sang SHIPPED.
--   (b) Cột `serial_number` trong bảng `warranties` được giữ nguyên
--       nhưng bổ sung cột `order_item_serial_id` để truy vết nguồn gốc
--       S/N đến tận dòng đóng gói cụ thể.
-- ============================================================

-- 13a. Bảng trung gian lưu S/N từng chiếc máy trong một dòng đơn hàng
CREATE TABLE IF NOT EXISTS `order_item_serials` (
  `id`            int NOT NULL AUTO_INCREMENT,
  `order_item_id` int NOT NULL COMMENT 'FK → order_items.id',
  `serial_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã S/N vật lý dán trên thân máy',
  `scanned_by`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên nhân viên quét mã',
  `scanned_at`    timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm quét',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_serial_number` (`serial_number`),
  KEY `idx_order_item_id` (`order_item_id`),
  CONSTRAINT `fk_ois_order_item`
    FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Danh sách S/N vật lý được quét cho từng dòng đơn hàng khi đóng gói';

-- 13b. Liên kết bảng warranties với order_item_serials để mỗi phiếu
--      bảo hành tương ứng với đúng một chiếc máy (một S/N cụ thể).
--      Cho phép NULL để không phá dữ liệu bảo hành cũ đã tồn tại.
ALTER TABLE `warranties`
  ADD COLUMN `order_item_serial_id` int DEFAULT NULL
    COMMENT 'FK → order_item_serials.id; NULL cho bảo hành tạo thủ công trước khi có nghiệp vụ này'
    AFTER `order_id`,
  ADD KEY `idx_warranties_ois` (`order_item_serial_id`),
  ADD CONSTRAINT `fk_warranties_ois`
    FOREIGN KEY (`order_item_serial_id`) REFERENCES `order_item_serials` (`id`) ON DELETE SET NULL;

COMMIT;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
