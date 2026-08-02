'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeV2 } from '@/components/features/home/HomeV2';
import { ProductQuickView } from '@/components/features/product/ProductQuickView';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { LAPTOP_GAMING as MOCK_LAPTOPS, MONITORS as MOCK_MONITORS, PERIPHERALS as MOCK_PERIPHERALS, COMPONENTS as MOCK_COMPONENTS } from '@/lib/data';
import { Toaster } from 'react-hot-toast';

export default function HomeV2Page() {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useSettingsStore();

  const fetchDbProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            price: parseFloat(p.price) || 0,
            originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
            discount: (p.original_price && parseFloat(p.original_price) > parseFloat(p.price)) 
              ? Math.round(((parseFloat(p.original_price) - parseFloat(p.price)) / parseFloat(p.original_price)) * 100) 
              : undefined,
            image: p.image || '/laptop.png',
            rating: parseFloat(p.rating) || 4.8,
            reviewsCount: parseInt(p.reviewsCount) || 45,
            category_name: p.category_name,
            category_id: p.category_id,
            slug: p.slug,
            specs: p.specs,
            is_flash_sale: p.is_flash_sale
          }));
          setDbProducts(formatted);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu MySQL:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDbProducts(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  // Trích xuất các sản phẩm thuộc Flash Sale
  const flashSaleProducts = dbProducts.filter((p: any) => p.is_flash_sale === 1);

  // Hàm trộn dữ liệu thực với dữ liệu mock
  const getProductsForCategory = (cat: any) => {
    const dbFiltered = dbProducts.filter(p => p.category_id === cat.id);
    
    let mockList: any[] = [];
    const normalizedSlug = cat.slug.toLowerCase();
    if (normalizedSlug === 'laptops' || normalizedSlug === 'laptop') {
      mockList = MOCK_LAPTOPS;
    } else if (normalizedSlug === 'displays' || normalizedSlug === 'display' || normalizedSlug === 'manhinh' || normalizedSlug === 'man-hinh') {
      mockList = MOCK_MONITORS;
    } else if (normalizedSlug === 'peripherals' || normalizedSlug === 'phukien' || normalizedSlug === 'phu-kien') {
      mockList = MOCK_PERIPHERALS;
    } else if (normalizedSlug === 'components' || normalizedSlug === 'linhkien' || normalizedSlug === 'linh-kien-pc') {
      mockList = MOCK_COMPONENTS;
    }
    
    const merged = [...dbFiltered, ...mockList];
    // Loại trùng lặp theo ID
    return merged.filter((p, index, self) => self.findIndex(t => t.id === p.id) === index);
  };

  // Tạo cấu trúc dữ liệu truyền cho HomeV2
  const homepageData = categories.map(cat => ({
    category: cat,
    products: getProductsForCategory(cat)
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary selection:text-white">
      <Toaster position="top-center" />
      <Header />
      
      <HomeV2 
        data={homepageData} 
        categories={categories}
        flashSaleProducts={flashSaleProducts}
        loading={loading}
        onSelectProduct={(p) => setSelectedProduct(p)} 
      />

      <Footer />

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
