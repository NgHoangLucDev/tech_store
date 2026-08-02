const mysql = require('mysql2/promise');

async function saveProductOptions(pool, productId, specsStr) {
  if (!specsStr) return;
  let specs;
  try {
    specs = typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
  } catch (e) {
    console.error("Error parsing specs in saveProductOptions:", e);
    return;
  }
  const groups = ['general', 'detailed'];
  for (const group of groups) {
    const groupData = specs[group];
    if (groupData && typeof groupData === 'object') {
      for (const [name, val] of Object.entries(groupData)) {
        const valStr = String(val).trim();
        const nameStr = name.trim();
        if (!nameStr || !valStr) continue;
        
        await pool.execute(
          `INSERT INTO options (spec_group, name, value) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
          [group, nameStr, valStr]
        );
        
        const [optRows] = await pool.execute('SELECT LAST_INSERT_ID() as id');
        let optionId = optRows[0]?.id;
        
        if (!optionId || optionId === 0) {
          const [findRows] = await pool.execute(
            'SELECT id FROM options WHERE spec_group = ? AND name = ? AND value = ?',
            [group, nameStr, valStr]
          );
          optionId = findRows[0]?.id;
        }
        
        if (optionId) {
          await pool.execute(
            'INSERT IGNORE INTO product_options (product_id, option_id) VALUES (?, ?)',
            [productId, optionId]
          );
        }
      }
    }
  }
}

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tech_store',
  });

  console.log('Starting MySQL Migration...');

  try {
    // 1. Đảm bảo các danh mục chuẩn tồn tại
    const standardCategories = [
      { name: 'Laptop', slug: 'laptop' },
      { name: 'Điện thoại', slug: 'dien-thoai' },
      { name: 'Linh kiện PC', slug: 'linh-kien-pc' },
      { name: 'Phụ kiện', slug: 'phu-kien' }
    ];

    for (const cat of standardCategories) {
      await pool.execute(
        'INSERT INTO categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name',
        [cat.name, cat.slug]
      );
    }
    console.log('✔ Standard categories verified/seeded.');

    // 2. Lấy danh mục phụ kiện
    let [categories] = await pool.execute('SELECT id FROM categories WHERE slug = ?', ['phu-kien']);
    let accessoryCatId = categories[0].id;
    console.log(`✔ Found accessory category ID: ${accessoryCatId}`);

    // 3. Tạo các bảng options và product_options liên quan
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        spec_group VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
        name VARCHAR(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        value VARCHAR(500) COLLATE utf8mb4_unicode_ci NOT NULL,
        UNIQUE KEY uq_option (spec_group, name, value(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_options (
        product_id INT NOT NULL,
        option_id INT NOT NULL,
        PRIMARY KEY (product_id, option_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tạo bảng product_relations
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_relations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        related_product_id INT NOT NULL,
        relation_type ENUM('bought_together', 'cross_sell', 'related') NOT NULL,
        UNIQUE KEY product_relation_unique (product_id, related_product_id, relation_type),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✔ Tables "options", "product_options" and "product_relations" verified/created.');

    // 4. Thêm sản phẩm phụ kiện để làm demo gợi ý mua kèm / bán chéo
    const extraProducts = [
      {
        id: 4,
        category_id: accessoryCatId,
        name: 'Chuột chơi game ASUS ROG Harpe Ace Aim Lab Edition',
        slug: 'chuot-gaming-asus-rog-harpe-ace',
        brand: 'ASUS',
        price: 2990000.00,
        original_price: 3490000.00,
        stock: 45,
        thumbnail: 'https://lh3.googleusercontent.com/9w9P_x12KzQ4b0PZ0XhYpZ3z5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz=rw',
        short_description: '✔ Chuột gaming siêu nhẹ 54g.\n✔ Cảm biến ROG AimPoint 36,000 DPI.\n✔ Bảo hành 24 tháng.',
        specs: JSON.stringify({
          general: {
            "Thương hiệu": "ASUS",
            "Bảo hành": "24 tháng",
            "Màu sắc": "Đen",
            "Nhu cầu": "Gaming"
          },
          detailed: {
            "Kết nối": "Không dây ROG SpeedNova 2.4GHz / Bluetooth / Dây USB",
            "Cảm biến": "ROG AimPoint (36000 DPI)",
            "Trọng lượng": "54g siêu nhẹ",
            "Thời lượng pin": "Lên tới 90 giờ",
            "Đèn LED": "RGB Aura Sync"
          }
        })
      },
      {
        id: 5,
        category_id: accessoryCatId,
        name: 'Bàn phím cơ ASUS ROG Azoth Wireless OLED',
        slug: 'ban-phim-co-asus-rog-azoth',
        brand: 'ASUS',
        price: 5290000.00,
        original_price: 5890000.00,
        stock: 15,
        thumbnail: 'https://lh3.googleusercontent.com/uR6GvR-C7jT_0b0O_XhYpZ3z5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz=rw',
        short_description: '✔ Bàn phím cơ custom size 75%.\n✔ Màn hình OLED hiển thị thông số.\n✔ Bảo hành 24 tháng.',
        specs: JSON.stringify({
          general: {
            "Thương hiệu": "ASUS",
            "Bảo hành": "24 tháng",
            "Màu sắc": "Xám Gunmetal",
            "Nhu cầu": "Gaming / Custom"
          },
          detailed: {
            "Kích thước": "75% layout",
            "Switch": "ROG NX Red (Pre-lubed, Hot-swappable)",
            "Màn hình": "OLED 2-inch đơn sắc",
            "Kết nối": "ROG SpeedNova 2.4GHz / Bluetooth / Dây Type-C",
            "Chất liệu": "Nắp nhôm, gasket mount cao cấp"
          }
        })
      },
      {
        id: 6,
        category_id: accessoryCatId,
        name: 'Tai nghe chơi game ROG Delta S Wireless USB-C',
        slug: 'tai-nghe-rog-delta-s-wireless',
        brand: 'ASUS',
        price: 4690000.00,
        original_price: 5190000.00,
        stock: 20,
        thumbnail: 'https://lh3.googleusercontent.com/tB6GvR-C7jT_0b0O_XhYpZ3z5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz5Zz=rw',
        short_description: '✔ Kết nối không dây kép 2.4GHz & Bluetooth.\n✔ Màng loa 50 mm ASUS Essence.\n✔ Mic chống ồn AI Beamforming.',
        specs: JSON.stringify({
          general: {
            "Thương hiệu": "ASUS",
            "Bảo hành": "24 tháng",
            "Màu sắc": "Đen",
            "Nhu cầu": "Gaming / Nghe nhạc"
          },
          detailed: {
            "Kết nối": "2.4GHz USB-C Dongle / Bluetooth",
            "Màng loa": "50mm Neodymium nam châm",
            "Microphone": "AI Beamforming tích hợp chống ồn",
            "Trọng lượng": "318g",
            "Thời lượng pin": "Tối đa 25 giờ, hỗ trợ sạc nhanh"
          }
        })
      }
    ];

    for (const p of extraProducts) {
      await pool.execute(`
        INSERT INTO products (id, category_id, name, slug, brand, price, original_price, stock, thumbnail, short_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          category_id = VALUES(category_id),
          price = VALUES(price), 
          original_price = VALUES(original_price), 
          stock = VALUES(stock)
      `, [p.id, p.category_id, p.name, p.slug, p.brand, p.price, p.original_price, p.stock, p.thumbnail, p.short_description]);

      if (p.specs) {
        await saveProductOptions(pool, p.id, p.specs);
      }
    }
    console.log('✔ Accessory products seeded.');

    const laptopSpecs = {
      general: {
        "Thương hiệu": "ASUS",
        "Bảo hành": "24 tháng",
        "Series model": "ASUS ROG Strix G16",
        "Tên": "ROG Strix G16 G614JV",
        "Part-number": "G614JV-N3038W",
        "Màu sắc": "Xám Eclipse (Eclipse Gray)",
        "Nhu cầu": "Gaming / Đồ họa nặng"
      },
      detailed: {
        "CPU": "Intel® Core™ i7-13650HX (14 nhân 20 luồng, 24MB Cache, up to 4.9GHz)",
        "Chip đồ họa": "NVIDIA® GeForce RTX™ 4060 8GB GDDR6 (TGP up to 140W)",
        "Màn hình": "16.0\" WUXGA (1920 x 1200) IPS, 16:10, 165Hz, 100% sRGB, G-Sync",
        "Webcam": "HD 720P Camera tích hợp",
        "RAM": "16GB DDR5 4800MHz (2 x 8GB SO-DIMM, nâng cấp tối đa 32GB)",
        "Lưu trữ": "512GB SSD M.2 PCIe® 4.0 NVMe™ (Còn dư 1 khe M.2 trống)",
        "Cổng kết nối": "1x RJ45 LAN, 1x Thunderbolt™ 4, 1x USB 3.2 Gen 2 Type-C (DP/Power Delivery), 2x USB 3.2 Gen 2 Type-A, 1x HDMI 2.1, 1x Combo Audio Jack",
        "Kết nối không dây": "Wi-Fi 6E (802.11ax) (Triple band) 2*2 + Bluetooth® 5.3",
        "Bàn phím": "Backlit Chiclet Keyboard 4-Zone RGB",
        "Hệ điều hành": "Windows 11 Home bản quyền",
        "Kích thước": "35.4 x 26.4 x 2.26 ~ 3.04 cm",
        "Pin": "4-cell Li-ion, 90WHrs",
        "Khối lượng": "2.50 kg",
        "Chất liệu": "Mặt A hợp kim nhôm, thân nhựa ABS cao cấp",
        "Đèn LED trên máy": "Thanh LED viền Aura Sync Light Bar gầm máy",
        "Trong hộp có gì": "Sách hướng dẫn sử dụng, Adapter sạc zin 280W"
      }
    };

    const pcSpecs = {
      general: {
        "Thương hiệu": "PV Gaming",
        "Bảo hành": "36 tháng chính hãng",
        "Series model": "Cupid TM028",
        "Tên": "PV Gaming Cupid TM028",
        "Nhu cầu": "Gaming / Livestream / Đồ họa"
      },
      detailed: {
        "CPU": "Intel Core i5-12400F (6 nhân, 12 luồng, 18MB Cache, up to 4.4GHz)",
        "Bo mạch chủ": "MSI B760M Gaming Plus WIFI DDR4",
        "RAM": "16GB DDR4 3200MHz (2 x 8GB TeamGroup Elite)",
        "Chip đồ họa": "NVIDIA GeForce RTX 3060 12GB GDDR6",
        "Lưu trữ": "1TB SSD WD SN3000 NVMe Gen4x4",
        "Nguồn (PSU)": "MSI MAG A650BNL 650W 80 Plus Bronze",
        "Tản nhiệt": "Tản nhiệt khí COOLER AIGO ICE200 PRO RGB - Đen",
        "Vỏ case": "MSI PAG PANO M110A bể cá sang trọng",
        "Hệ điều hành": "Free DOS (Hỗ trợ cài đặt Windows thử nghiệm)"
      }
    };

    // 5. Chuẩn hóa specs JSON cho Laptop Asus ROG Strix G16 (tìm động theo tên/slug)
    const [strixProducts] = await pool.execute(
      "SELECT id FROM products WHERE slug LIKE '%asus-rog-strix-g16%' OR name LIKE '%ROG Strix G16%' LIMIT 2"
    );
    const strixId1 = strixProducts[0]?.id || null;
    const strixId2 = strixProducts[1]?.id || null;

    if (strixId1) {
      await saveProductOptions(pool, strixId1, laptopSpecs);
      console.log(`✔ Structured specs JSON for Laptop ROG Strix (id: ${strixId1}) updated.`);
    } else {
      console.log('⚠ Laptop ROG Strix G16 (Laptop 1) not found in DB. Skipping specs.');
    }
    if (strixId2) {
      await saveProductOptions(pool, strixId2, laptopSpecs);
      console.log(`✔ Structured specs JSON for Laptop ROG Strix (id: ${strixId2}) updated.`);
    } else {
      console.log('⚠ Laptop ROG Strix G16 (Laptop 2) not found in DB. Skipping specs.');
    }

    // 6. Chuẩn hóa specs cho PC (tìm động theo tên/slug)
    const [pcProducts] = await pool.execute(
      "SELECT id FROM products WHERE slug LIKE '%pc-gvn-viper%' OR name LIKE '%PC GVN%' OR name LIKE '%PV Gaming%' LIMIT 1"
    );
    const pcId = pcProducts[0]?.id || null;
    if (pcId) {
      await saveProductOptions(pool, pcId, pcSpecs);
      console.log(`✔ Structured specs JSON for PC PV Gaming (id: ${pcId}) updated.`);
    } else {
      console.log('⚠ PC PV Gaming not found in DB. Skipping specs.');
    }

    // 7. Tạo các mối quan hệ gợi ý cho sản phẩm chính (Laptop ROG Strix id: strixId1)
    if (strixId1) {
      // Xóa quan hệ cũ để tránh trùng lặp
      await pool.execute('DELETE FROM product_relations WHERE product_id = ?', [strixId1]);
      
      // Thêm các mối quan hệ:
      // - Mua kèm: Chuột (id: 4), Bàn phím (id: 5)
      // - Bán chéo: Tai nghe (id: 6)
      // - Liên quan: PC (pcId), Laptop Strix 2 (strixId2)
      const relations = [
        { product_id: strixId1, related_product_id: 4, relation_type: 'bought_together' },
        { product_id: strixId1, related_product_id: 5, relation_type: 'bought_together' },
        { product_id: strixId1, related_product_id: 6, relation_type: 'cross_sell' }
      ];

      if (pcId) {
        relations.push({ product_id: strixId1, related_product_id: pcId, relation_type: 'related' });
      }
      if (strixId2) {
        relations.push({ product_id: strixId1, related_product_id: strixId2, relation_type: 'related' });
      }

      for (const rel of relations) {
        // Kiểm tra xem related_product_id có tồn tại trong bảng products không trước khi chèn
        const [relatedCheck] = await pool.execute('SELECT id FROM products WHERE id = ?', [rel.related_product_id]);
        if (relatedCheck.length > 0) {
          await pool.execute(`
            INSERT INTO product_relations (product_id, related_product_id, relation_type)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE relation_type = VALUES(relation_type)
          `, [rel.product_id, rel.related_product_id, rel.relation_type]);
        } else {
          console.log(`⚠ Related product ID ${rel.related_product_id} not found in DB. Skipping relation.`);
        }
      }
      console.log(`✔ Product recommendations seeded for Laptop ROG Strix (id: ${strixId1}).`);
    } else {
      console.log('⚠ Laptop ROG Strix G16 (Laptop 1) not found in DB. Skipping relations.');
    }

    console.log('✔ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
