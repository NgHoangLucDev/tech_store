'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Box, 
  Zap, 
  Layers, 
  Laptop, 
  Headphones, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  ArrowLeft, 
  Trash2, 
  RefreshCcw,
  Edit3,
  X,
  FileText,
  Link,
  AlertCircle,
  Inbox,
  ChevronRight,
  PlusCircle,
  Trash
} from 'lucide-react';

const getCategoryIcon = (slug: string) => {
  const s = slug?.toLowerCase() || '';
  if (s.includes('laptop')) return <Laptop size={20} />;
  if (s.includes('tai-nghe') || s.includes('headphone') || s.includes('audio')) return <Headphones size={20} />;
  if (s.includes('phone') || s.includes('mobile')) return <Smartphone size={20} />;
  if (s.includes('display') || s.includes('man-hinh')) return <Monitor size={20} />;
  if (s.includes('sale') || s.includes('discount')) return <Sparkles size={20} />;
  return <Layers size={20} />;
};

export default function AdminProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState<any[]>([]);

  const filteredProducts = products.filter(p => {
    if (selectedCategoryId === null) return false;
    return p.category_id === selectedCategoryId;
  });

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    original_price: '',
    stock: '',
    stock_refurbished: '',
    category_id: '',
    image: '',
    description: '',
    specs: '',
    is_flash_sale: false
  });

  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'specs' | 'relations'>('basic');
  const [specsState, setSpecsState] = useState<{
    general: { [key: string]: string };
    detailed: { [key: string]: string };
  }>({ general: {}, detailed: {} });

  const [currentRelations, setCurrentRelations] = useState<{
    bought_together: any[];
    cross_sell: any[];
    related: any[];
  }>({ bought_together: [], cross_sell: [], related: [] });

  const [relationTargetId, setRelationTargetId] = useState<string>('');
  const [relationType, setRelationType] = useState<'bought_together' | 'cross_sell' | 'related'>('bought_together');
  const [filterCategoryForRelation, setFilterCategoryForRelation] = useState<string>('');

  const [subImages, setSubImages] = useState<string[]>([]);

  const fetchProductImages = async (prodId: number) => {
    try {
      const res = await fetch(`/api/products/images?productId=${prodId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const subImgs = data.filter((img: any) => !img.is_main).map((img: any) => img.url);
        setSubImages(subImgs);
      }
    } catch (e) {
      console.error("Lỗi lấy danh sách ảnh chi tiết:", e);
    }
  };

  const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadToast = toast.loading("Đang tải lên ảnh chính...");
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success("Tải lên ảnh chính thành công!", { id: uploadToast });
      } else {
        toast.error(data.error || "Lỗi khi upload", { id: uploadToast });
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối: " + err.message, { id: uploadToast });
    }
  };

  const handleUploadSubImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadToast = toast.loading(`Đang tải lên ${files.length} ảnh phụ...`);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadData = new FormData();
        uploadData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadData
        });
        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
        }
      }
      if (newUrls.length > 0) {
        setSubImages(prev => [...prev, ...newUrls]);
        toast.success(`Tải lên thành công ${newUrls.length} ảnh phụ!`, { id: uploadToast });
      } else {
        toast.error("Không có ảnh phụ nào được tải lên thành công", { id: uploadToast });
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối: " + err.message, { id: uploadToast });
    }
  };

  const removeSubImage = (urlToRemove: string) => {
    setSubImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { toast.error("Lỗi kết nối cơ sở dữ liệu"); }
    finally { setLoading(false); }
  };

  const fetchDeletedProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?showDeleted=true');
      const data = await res.json();
      if (Array.isArray(data)) setDeletedProducts(data);
    } catch (err) { console.error("Lỗi lấy sản phẩm đã xóa:", err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) { console.error(err); }
  };

  const fetchProductRelations = async (prodId: number) => {
    try {
      const res = await fetch(`/api/products/relations?productId=${prodId}`);
      const data = await res.json();
      if (data) {
        setCurrentRelations({
          bought_together: data.bought_together || [],
          cross_sell: data.cross_sell || [],
          related: data.related || []
        });
      }
    } catch (e) {
      console.error("Lỗi lấy liên kết sản phẩm:", e);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
      fetchProducts();
      fetchCategories();
      fetchDeletedProducts();
    }
  }, [user]);

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setActiveFormTab('basic');

    let parsedSpecs = { general: {}, detailed: {} };
    if (product.specs) {
      try {
        const parsed = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
        if (parsed && typeof parsed === 'object') {
          if (parsed.general || parsed.detailed) {
            parsedSpecs = {
              general: parsed.general || {},
              detailed: parsed.detailed || {}
            };
          } else {
            parsedSpecs = {
              general: {},
              detailed: parsed
            };
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    setSpecsState(parsedSpecs);

    fetchProductRelations(product.id);
    fetchProductImages(product.id);

    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      price: product.price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      stock: product.stock?.toString() || '',
      stock_refurbished: product.stock_refurbished?.toString() || '0',
      category_id: product.category_id?.toString() || '',
      image: product.image || '',
      description: product.description || '',
      specs: typeof product.specs === 'object' ? JSON.stringify(product.specs, null, 2) : product.specs || '',
      is_flash_sale: product.is_flash_sale === 1
    });
    setFilterCategoryForRelation('');
    setIsAdding(true);
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setActiveFormTab('basic');
    setSpecsState({ general: {}, detailed: {} });
    setSubImages([]);
    setFormData({ 
      name: '', 
      brand: '', 
      price: '', 
      original_price: '', 
      stock: '', 
      stock_refurbished: '0',
      category_id: selectedCategoryId !== null ? selectedCategoryId.toString() : '', 
      image: '', 
      description: '', 
      specs: '', 
      is_flash_sale: false 
    });
    setFilterCategoryForRelation('');
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    const t = toast.loading("Đang xử lý...");
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const result = await res.json();

      if (res.ok) {
        const msg = result.hasOrders
          ? `⚠️ ${result.message}`
          : result.message || "Đã xóa thành công";
        toast.success(msg, { id: t, duration: 5000 });
        fetchProducts();
        fetchDeletedProducts();
      } else {
        toast.error(result.error || "Lỗi khi xóa sản phẩm", { id: t, duration: 5000 });
      }
    } catch (err) {
      toast.error("Lỗi kết nối API", { id: t });
    }
    setConfirmDelete(null);
  };

  const handleRestore = async (id: number) => {
    const t = toast.loading("Đang khôi phục sản phẩm...");
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, restore: true })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Đã khôi phục thành công", { id: t });
        fetchProducts();
        fetchDeletedProducts();
      } else {
        toast.error(result.error || "Lỗi khôi phục", { id: t });
      }
    } catch (err) {
      toast.error("Lỗi kết nối API", { id: t });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const serializedSpecs = JSON.stringify(specsState);
    const finalFormData = { ...formData, specs: serializedSpecs };
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId
      ? { ...finalFormData, id: editingId, images: subImages }
      : { ...finalFormData, images: subImages };
    const t = toast.loading("Đang lưu...");

    try {
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success(editingId ? "Cập nhật thành công" : "Thêm mới thành công", { id: t });
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', brand: '', price: '', original_price: '', stock: '', stock_refurbished: '', category_id: '', image: '', description: '', specs: '', is_flash_sale: false });
        setSpecsState({ general: {}, detailed: {} });
        setSubImages([]);
        fetchProducts();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Lỗi xử lý dữ liệu", { id: t, duration: 5000 });
      }
    } catch (err) {
      toast.error("Lỗi kết nối hệ thống", { id: t });
    }
  };

  const updateSpecField = (group: 'general' | 'detailed', oldKey: string, newKey: string, val: string) => {
    setSpecsState(prev => {
      const groupData = { ...prev[group] };
      if (oldKey !== newKey) {
        delete groupData[oldKey];
      }
      groupData[newKey] = val;
      return {
        ...prev,
        [group]: groupData
      };
    });
  };

  const addSpecField = (group: 'general' | 'detailed') => {
    setSpecsState(prev => {
      const groupData = { ...prev[group] };
      const newKey = `Thuộc tính ${Object.keys(groupData).length + 1}`;
      groupData[newKey] = "";
      return {
        ...prev,
        [group]: groupData
      };
    });
  };

  const removeSpecField = (group: 'general' | 'detailed', key: string) => {
    setSpecsState(prev => {
      const groupData = { ...prev[group] };
      delete groupData[key];
      return {
        ...prev,
        [group]: groupData
      };
    });
  };

  const applyTemplate = (type: 'laptop' | 'phone' | 'component' | 'peripheral') => {
    let generalKeys: string[] = [];
    let detailedKeys: string[] = [];

    if (type === 'laptop') {
      generalKeys = ["Thương hiệu", "Bảo hành", "Series model", "Tên", "Part-number", "Màu sắc", "Nhu cầu"];
      detailedKeys = ["CPU", "Chip đồ họa", "Màn hình", "Webcam", "RAM", "Lưu trữ", "Cổng kết nối", "Kết nối không dây", "Bàn phím", "Hệ điều hành", "Kích thước", "Pin", "Khối lượng", "Chất liệu", "Đèn LED trên máy", "Trong hộp có gì"];
    } else if (type === 'phone') {
      generalKeys = ["Thương hiệu", "Bảo hành", "Màu sắc", "Nhu cầu"];
      detailedKeys = ["Màn hình", "CPU (Chipset)", "RAM", "Bộ nhớ trong", "Camera sau", "Camera trước", "Pin & Sạc", "Hệ điều hành", "Kích thước", "Khối lượng"];
    } else if (type === 'component') {
      generalKeys = ["Thương hiệu", "Bảo hành", "Series model"];
      detailedKeys = ["Loại linh kiện", "Thông số kỹ thuật chi tiết", "Chuẩn giao tiếp", "Kích thước", "Điện năng tiêu thụ"];
    } else if (type === 'peripheral') {
      generalKeys = ["Thương hiệu", "Bảo hành", "Màu sắc"];
      detailedKeys = ["Chuẩn kết nối", "Đèn LED", "Tương thích", "Kích thước", "Khối lượng", "Tính năng đặc biệt"];
    }

    const newGeneral: any = {};
    const newDetailed: any = {};

    generalKeys.forEach(k => { newGeneral[k] = specsState.general[k] || ""; });
    detailedKeys.forEach(k => { newDetailed[k] = specsState.detailed[k] || ""; });

    setSpecsState({ general: newGeneral, detailed: newDetailed });
    toast.success("Đã áp dụng mẫu thông số kỹ thuật!");
  };

  const handleAddRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !relationTargetId) return;
    const t = toast.loading("Đang liên kết...");
    try {
      const res = await fetch('/api/products/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingId,
          relatedProductId: parseInt(relationTargetId),
          relationType
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Đã thêm liên kết", { id: t });
        setRelationTargetId('');
        fetchProductRelations(editingId);
      } else {
        toast.error(data.error || "Lỗi liên kết", { id: t });
      }
    } catch (err) {
      toast.error("Lỗi kết nối", { id: t });
    }
  };

  const handleDeleteRelation = async (relatedId: string, type: string) => {
    if (!editingId) return;
    const t = toast.loading("Đang xóa liên kết...");
    try {
      const res = await fetch('/api/products/relations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingId,
          relatedProductId: parseInt(relatedId),
          relationType: type
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Đã xóa liên kết", { id: t });
        fetchProductRelations(editingId);
      } else {
        toast.error(data.error || "Lỗi khi xóa", { id: t });
      }
    } catch (err) {
      toast.error("Lỗi kết nối", { id: t });
    }
  };

  const handleToggleFlashSale = async (id: number, isFlashSale: boolean) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_flash_sale: isFlashSale ? 1 : 0 } : p));

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_flash_sale: isFlashSale })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật trạng thái Flash Sale");
      }
      toast.success(isFlashSale ? "Đã kích hoạt Flash Sale!" : "Đã tắt Flash Sale!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_flash_sale: !isFlashSale ? 1 : 0 } : p));
    }
  };

  if (!mounted || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return null;

  const isAdmin = user.role === 'ADMIN';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-10">
      <Toaster position="top-center" />
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Box className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hệ thống sản phẩm</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-none">KHO HÀNG</h1>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddNewClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-black font-black text-xs tracking-wider uppercase rounded-xl transition-all active:scale-95 cursor-pointer font-bold shrink-0"
          >
            <Plus size={16} />
            <span>NHẬP HÀNG MỚI</span>
          </button>
        )}
      </header>

      {/* Form Modal (Add/Edit Product) */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] overflow-y-auto no-scrollbar flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              className="relative bg-[#121212] border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-5xl shadow-2xl z-10 pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                  {editingId ? 'Cập Nhật Sản Phẩm' : 'Nhập Sản Phẩm Mới'}
                </h2>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form Navigation Tabs */}
              <div className="flex border-b border-white/5 mb-6 gap-4 sm:gap-6 text-sm overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
                <button
                  type="button"
                  onClick={() => setActiveFormTab('basic')}
                  className={cn(
                    "pb-3 font-bold uppercase tracking-wider transition-all border-b-2 text-xs",
                    activeFormTab === 'basic'
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  Thông tin cơ bản
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('specs')}
                  className={cn(
                    "pb-3 font-bold uppercase tracking-wider transition-all border-b-2 text-xs",
                    activeFormTab === 'specs'
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-400 hover:text-white"
                  )}
                >
                  Thông số kỹ thuật
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('relations')}
                    className={cn(
                      "pb-3 font-bold uppercase tracking-wider transition-all border-b-2 text-xs",
                      activeFormTab === 'relations'
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-400 hover:text-white"
                    )}
                  >
                    Gợi ý mua kèm/bán chéo
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeFormTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tên sản phẩm</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 h-11 rounded-xl px-4 outline-none focus:border-primary transition-all font-semibold text-sm text-white" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Thương hiệu</label>
                          <input required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-white/5 border border-white/10 h-11 rounded-xl px-4 outline-none focus:border-primary transition-all font-semibold text-sm text-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Danh mục</label>
                          <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full bg-[#121212] border border-white/10 h-11 rounded-xl px-4 outline-none focus:border-primary transition-all font-semibold text-sm text-white appearance-none cursor-pointer">
                            <option value="">-- CHỌN PHÂN LOẠI --</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id} className="bg-[#121212] text-white">
                                {c.name.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Giá bán (VNĐ)</label>
                          <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/5 border border-white/10 h-11 rounded-xl px-4 outline-none focus:border-primary transition-all font-bold text-sm text-primary" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Giá gốc chưa giảm (VNĐ)</label>
                          <input type="number" value={formData.original_price} onChange={e => setFormData({ ...formData, original_price: e.target.value })} className="w-full bg-white/5 border border-white/10 h-11 rounded-xl px-4 outline-none focus:border-primary transition-all font-bold text-sm text-slate-400" />
                        </div>
                      </div>

                      {/* Main Image Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Ảnh chính đại diện (Thumbnail)</label>
                        <div className="flex items-center gap-4 bg-white/2 border border-white/5 p-4 rounded-xl">
                          {formData.image ? (
                            <div className="relative w-16 h-16 rounded-xl border border-white/10 overflow-hidden bg-black flex items-center justify-center p-1 group shrink-0">
                              <img src={formData.image} alt="Preview" className="object-contain w-full h-full" />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-500 font-bold transition-all text-[10px] cursor-pointer"
                              >
                                XÓA
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-600 bg-white/5 shrink-0">
                              <Box size={18} />
                            </div>
                          )}
                          <label className="px-4 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-slate-300 cursor-pointer transition-all active:scale-95">
                            Chọn ảnh
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadMainImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Detail gallery sub-images */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Thư viện ảnh chi tiết (Sub-images)</label>
                        <div className="flex flex-wrap gap-3 items-center bg-white/2 border border-white/5 p-4 rounded-xl">
                          {subImages.map((url, index) => (
                            <div key={index} className="relative w-14 h-14 rounded-lg border border-white/10 overflow-hidden bg-black flex items-center justify-center p-1 group shrink-0">
                              <img src={url} alt={`SubPreview ${index}`} className="object-contain w-full h-full" />
                              <button
                                type="button"
                                onClick={() => removeSubImage(url)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-500 font-bold transition-all text-[8px] cursor-pointer"
                              >
                                XÓA
                              </button>
                            </div>
                          ))}
                          <label className="w-14 h-14 rounded-lg border-2 border-dashed border-white/10 hover:border-primary/50 flex flex-col items-center justify-center text-slate-500 hover:text-primary bg-white/5 hover:bg-primary/5 cursor-pointer transition-all active:scale-95 shrink-0">
                            <Plus size={16} />
                            <span className="text-[7px] font-black uppercase tracking-widest mt-0.5">Thêm</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleUploadSubImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tồn kho mới (Brand New)</label>
                          <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full bg-white/5 border border-white/10 h-11 rounded-xl px-4 outline-none focus:border-primary transition-all font-bold text-sm text-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tồn Likenew (Refurbished)</label>
                          <input required type="number" value={formData.stock_refurbished} onChange={e => setFormData({ ...formData, stock_refurbished: e.target.value })} className="w-full bg-white/5 border border-white/10 h-11 rounded-xl px-4 outline-none focus:border-primary transition-all font-bold text-sm text-white" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Mô tả sản phẩm</label>
                        <textarea rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary transition-all font-semibold text-sm resize-none text-white" />
                      </div>

                      <div className="flex items-center gap-3 bg-white/2 border border-white/5 p-4 rounded-xl">
                        <input
                          type="checkbox"
                          id="is_flash_sale"
                          checked={formData.is_flash_sale}
                          onChange={e => setFormData({ ...formData, is_flash_sale: e.target.checked })}
                          className="w-5 h-5 accent-red-500 rounded border-white/10 bg-white/5 cursor-pointer"
                        />
                        <label htmlFor="is_flash_sale" className="text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer select-none">Đưa sản phẩm vào Flash Sale</label>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'specs' && (
                  <div className="space-y-6 text-left">
                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Khởi tạo nhanh mẫu thông số</span>
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => applyTemplate('laptop')} className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Mẫu Laptop</button>
                        <button type="button" onClick={() => applyTemplate('phone')} className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Mẫu Điện thoại</button>
                        <button type="button" onClick={() => applyTemplate('component')} className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Mẫu Linh kiện</button>
                        <button type="button" onClick={() => applyTemplate('peripheral')} className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Mẫu Phụ kiện</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nhóm Thông tin chung */}
                      <div className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h3 className="text-sm font-black uppercase text-primary">Thông tin chung</h3>
                          <button type="button" onClick={() => addSpecField('general')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">+ Thêm</button>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                          {Object.entries(specsState.general).map(([key, val]) => (
                            <div key={key} className="flex gap-2 items-center bg-black/30 p-2.5 rounded-xl border border-white/5">
                              <input
                                type="text"
                                value={key}
                                placeholder="Thuộc tính"
                                onChange={e => updateSpecField('general', key, e.target.value, val)}
                                className="w-1/3 bg-white/5 border border-white/5 h-8 rounded-lg px-2 outline-none focus:border-primary text-xs font-bold text-white"
                              />
                              <input
                                type="text"
                                value={val}
                                placeholder="Giá trị"
                                onChange={e => updateSpecField('general', key, key, e.target.value)}
                                className="flex-1 bg-white/5 border border-white/5 h-8 rounded-lg px-2 outline-none focus:border-primary text-xs text-slate-300 font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => removeSpecField('general', key)}
                                className="text-rose-500 hover:text-rose-400 font-bold px-1 text-sm"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {Object.keys(specsState.general).length === 0 && (
                            <p className="text-[10px] text-slate-600 font-bold uppercase text-center py-8">Chưa có thông số</p>
                          )}
                        </div>
                      </div>

                      {/* Nhóm Cấu hình chi tiết */}
                      <div className="p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h3 className="text-sm font-black uppercase text-primary">Cấu hình chi tiết</h3>
                          <button type="button" onClick={() => addSpecField('detailed')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">+ Thêm</button>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                          {Object.entries(specsState.detailed).map(([key, val]) => (
                            <div key={key} className="flex gap-2 items-center bg-black/30 p-2.5 rounded-xl border border-white/5">
                              <input
                                type="text"
                                value={key}
                                placeholder="Thuộc tính"
                                onChange={e => updateSpecField('detailed', key, e.target.value, val)}
                                className="w-1/3 bg-white/5 border border-white/5 h-8 rounded-lg px-2 outline-none focus:border-primary text-xs font-bold text-white"
                              />
                              <input
                                type="text"
                                value={val}
                                placeholder="Giá trị"
                                onChange={e => updateSpecField('detailed', key, key, e.target.value)}
                                className="flex-1 bg-white/5 border border-white/5 h-8 rounded-lg px-2 outline-none focus:border-primary text-xs text-slate-300 font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => removeSpecField('detailed', key)}
                                className="text-rose-500 hover:text-rose-400 font-bold px-1 text-sm"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {Object.keys(specsState.detailed).length === 0 && (
                            <p className="text-[10px] text-slate-600 font-bold uppercase text-center py-8">Chưa có thông số</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'relations' && (
                  <div className="space-y-6 text-left">
                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Thêm liên kết sản phẩm</span>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Loại liên kết</label>
                          <select 
                            value={relationType} 
                            onChange={e => setRelationType(e.target.value as any)}
                            className="w-full bg-[#121212] border border-white/10 h-10 rounded-xl px-3 outline-none focus:border-primary text-xs text-white"
                          >
                            <option value="bought_together">SẢN PHẨM MUA KÈM</option>
                            <option value="cross_sell">BÁN CHÉO (CROSS-SELL)</option>
                            <option value="related">SẢN PHẨM LIÊN QUAN</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Lọc theo danh mục</label>
                          <select 
                            value={filterCategoryForRelation} 
                            onChange={e => {
                              setFilterCategoryForRelation(e.target.value);
                              setRelationTargetId('');
                            }}
                            className="w-full bg-[#121212] border border-white/10 h-10 rounded-xl px-3 outline-none focus:border-primary text-xs text-white"
                          >
                            <option value="">-- TẤT CẢ DANH MỤC --</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Sản phẩm liên kết</label>
                          <select 
                            value={relationTargetId} 
                            onChange={e => setRelationTargetId(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 h-10 rounded-xl px-3 outline-none focus:border-primary text-xs text-white"
                          >
                            <option value="">-- CHỌN SẢN PHẨM --</option>
                            {products
                              .filter((p: any) => p.id.toString() !== editingId?.toString())
                              .filter((p: any) => {
                                if (!filterCategoryForRelation) return true;
                                return p.category_id.toString() === filterCategoryForRelation.toString();
                              })
                              .map((p: any) => (
                                <option key={p.id} value={p.id}>
                                  {p.name.toUpperCase()} ({p.brand.toUpperCase()})
                                </option>
                              ))
                            }
                          </select>
                        </div>
                        <button 
                          type="button" 
                          onClick={handleAddRelation} 
                          className="h-10 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/95 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          Thiết lập liên kết
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Mua kèm */}
                      <div className="p-5 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase text-primary pb-2 border-b border-white/5">Mua kèm</h4>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                          {currentRelations.bought_together.length > 0 ? (
                            currentRelations.bought_together.map((r: any) => (
                              <div key={r.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                <div className="min-w-0 pr-2">
                                  <p className="text-[10px] font-bold text-white truncate uppercase">{r.name}</p>
                                  <p className="text-primary text-[10px] font-black mt-0.5">{formatPrice(r.price)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRelation(r.id, 'bought_together')}
                                  className="text-rose-500 hover:text-rose-400 font-bold text-xs p-1"
                                >
                                  Xóa
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[9px] text-slate-600 font-bold uppercase text-center py-6">Chưa có liên kết</p>
                          )}
                        </div>
                      </div>

                      {/* Bán chéo */}
                      <div className="p-5 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase text-primary pb-2 border-b border-white/5">Bán chéo</h4>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                          {currentRelations.cross_sell.length > 0 ? (
                            currentRelations.cross_sell.map((r: any) => (
                              <div key={r.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                <div className="min-w-0 pr-2">
                                  <p className="text-[10px] font-bold text-white truncate uppercase">{r.name}</p>
                                  <p className="text-primary text-[10px] font-black mt-0.5">{formatPrice(r.price)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRelation(r.id, 'cross_sell')}
                                  className="text-rose-500 hover:text-rose-400 font-bold text-xs p-1"
                                >
                                  Xóa
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[9px] text-slate-600 font-bold uppercase text-center py-6">Chưa có liên kết</p>
                          )}
                        </div>
                      </div>

                      {/* Liên quan */}
                      <div className="p-5 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                        <h4 className="text-xs font-black uppercase text-primary pb-2 border-b border-white/5">Sản phẩm liên quan</h4>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                          {currentRelations.related.length > 0 ? (
                            currentRelations.related.map((r: any) => (
                              <div key={r.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                <div className="min-w-0 pr-2">
                                  <p className="text-[10px] font-bold text-white truncate uppercase">{r.name}</p>
                                  <p className="text-primary text-[10px] font-black mt-0.5">{formatPrice(r.price)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRelation(r.id, 'related')}
                                  className="text-rose-500 hover:text-rose-400 font-bold text-xs p-1"
                                >
                                  Xóa
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[9px] text-slate-600 font-bold uppercase text-center py-6">Chưa có liên kết</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-white/5">
                  <button type="submit" className="flex-1 bg-primary h-12 rounded-2xl font-black uppercase text-xs tracking-widest text-black hover:bg-primary/95 transition-all cursor-pointer shadow-md">Xác nhận hệ thống</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="px-8 bg-white/5 hover:bg-white/10 h-12 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 text-white cursor-pointer transition-all">Hủy bỏ</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDelete(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#121212] border border-red-500/20 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl z-10"
            >
              <h2 className="text-2xl font-black mb-3 uppercase text-white">XÓA SẢN PHẨM?</h2>
              <p className="text-slate-400 font-bold mb-6 text-xs uppercase tracking-wider">Dữ liệu sẽ bị ẩn và đưa vào thùng rác.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-600 hover:bg-red-500 active:scale-95 h-11 rounded-xl font-black uppercase text-xs tracking-widest text-white transition-all shadow-lg cursor-pointer"
                >
                  XÓA NGAY
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 h-11 rounded-xl font-black uppercase text-xs tracking-widest text-white transition-all cursor-pointer"
                >
                  HỦY BỎ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category selector view */}
      {selectedCategoryId === null ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tổng danh mục', value: categories.length, color: 'from-sky-500/20 to-sky-600/5 border-sky-500/20 text-sky-300' },
              { label: 'Tổng sản phẩm', value: products.length, color: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-300' },
              { label: 'Tồn kho mới', value: products.reduce((a: number, p: any) => a + (p.stock || 0), 0), color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-300' },
              { label: 'Cần nhập hàng', value: products.filter((p: any) => p.stock < 5).length, color: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-300' },
            ].map(s => (
              <div key={s.label} className={cn('bg-gradient-to-br to-transparent rounded-2xl border p-4', s.color.split(' ').slice(0,2).join(' '), s.color.split(' ')[2])}>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                <p className={cn('text-2xl font-black', s.color.split(' ')[3])}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {categories.map((cat, idx) => {
              const count = products.filter((p: any) => p.category_id === cat.id).length;
              const PALETTES = [
                { icon: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/15', hover: 'hover:border-sky-400/40 hover:bg-sky-500/10' },
                { icon: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/15', hover: 'hover:border-violet-400/40 hover:bg-violet-500/10' },
                { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', hover: 'hover:border-emerald-400/40 hover:bg-emerald-500/10' },
                { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15', hover: 'hover:border-amber-400/40 hover:bg-amber-500/10' },
                { icon: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/15', hover: 'hover:border-rose-400/40 hover:bg-rose-500/10' },
                { icon: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/15', hover: 'hover:border-teal-400/40 hover:bg-teal-500/10' },
                { icon: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/15', hover: 'hover:border-indigo-400/40 hover:bg-indigo-500/10' },
                { icon: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/15', hover: 'hover:border-orange-400/40 hover:bg-orange-500/10' },
              ];
              const p = PALETTES[idx % PALETTES.length];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    'flex flex-col items-start p-5 rounded-2xl border bg-[#0e0e0e] text-left transition-all duration-200 group cursor-pointer hover:-translate-y-0.5 shadow-lg w-full min-h-[110px] justify-between',
                    p.border, p.hover
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className={cn('p-2.5 rounded-xl bg-black/20', p.bg, p.icon)}>
                      {getCategoryIcon(cat.slug || cat.name)}
                    </div>
                    <ChevronRight className={cn('w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-all', p.icon)} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-white leading-tight mb-1">{cat.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('w-1.5 h-1.5 rounded-full', count > 0 ? p.bg.replace('bg-', 'bg-').replace('/10', '/60') : 'bg-slate-700')} />
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{count} sản phẩm</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Products list table view inside selected category */
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <ArrowLeft size={14} />
              Quay lại
            </button>

            {/* Quick Switcher Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                      isSelected
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-white/2 border-white/5 text-slate-500 hover:border-white/10 hover:text-white"
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Container (Cards on mobile, Table on desktop) */}
          <section className="bg-[#0e0e0e] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl">
            {/* Mobile View: Cards list (<640px) */}
            <div className="block sm:hidden p-2 space-y-2">
              {loading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Đang tải...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <Box className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-600">Chưa có sản phẩm nào trong danh mục này</p>
                </div>
              ) : (
                filteredProducts.map((item) => (
                  <div key={item.id} className="p-3 bg-[#0c0c0c] rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Image */}
                      <div className="w-12 h-12 bg-black rounded-xl border border-white/5 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img src={item.image || '/laptop.png'} alt={item.name} className="w-full h-full object-contain" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-white leading-snug truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-black text-xs text-primary">{formatPrice(item.price)}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{item.brand}</span>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-white/5 hover:bg-sky-500/10 text-slate-300 hover:text-sky-400 rounded-xl transition-all active:scale-95 cursor-pointer"
                          title="Sửa"
                        >
                          <Edit3 size={14} />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => setConfirmDelete(item.id)}
                            className="p-2 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400/80 hover:text-rose-400 rounded-xl transition-all active:scale-95 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stock & Flash Sale Pill Footer */}
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                          Tồn: <strong className="text-white">{item.stock}</strong>
                        </span>
                        {(item.stock_refurbished || 0) > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            LikeNew: <strong>{item.stock_refurbished}</strong>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleToggleFlashSale(item.id, item.is_flash_sale !== 1); }}
                        className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold transition-all active:scale-95 cursor-pointer',
                          item.is_flash_sale === 1
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                            : 'bg-white/5 border-white/5 text-slate-500'
                        )}
                      >
                        <Zap size={11} className={cn(item.is_flash_sale === 1 && 'fill-rose-400')} />
                        <span>{item.is_flash_sale === 1 ? 'Sale ON' : 'Sale'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Table (hidden sm:block) */}
            <div className="hidden sm:block">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sản phẩm</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Giá bán</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tồn mới</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tồn likenew</span>
                <span className="w-16" />
              </div>

              {loading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Đang tải...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <Box className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-600">Chưa có sản phẩm nào trong danh mục này</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {filteredProducts.map((item) => (
                    <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3 hover:bg-white/[0.025] transition-colors group">
                      {/* Product */}
                      <div className="flex items-center gap-3">
                        {/* Flash sale toggle */}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleToggleFlashSale(item.id, item.is_flash_sale !== 1); }}
                          className={cn(
                            'p-2 rounded-xl border transition-all shrink-0 cursor-pointer',
                            item.is_flash_sale === 1
                              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-600 hover:text-slate-300'
                          )}
                          title={item.is_flash_sale === 1 ? 'Tắt Flash Sale' : 'Kích hoạt Flash Sale'}
                        >
                          <Zap size={13} className={cn(item.is_flash_sale === 1 && 'fill-rose-400')} />
                        </button>
                        {/* Image */}
                        <div className="w-11 h-11 bg-black rounded-xl border border-white/[0.06] flex items-center justify-center p-1.5 shrink-0 group-hover:border-sky-500/20 transition-all">
                          <img src={item.image || '/laptop.png'} alt={item.name} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all" />
                        </div>
                        {/* Info */}
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors truncate leading-tight">{item.name}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{item.brand}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <p className="font-extrabold text-sm text-white tracking-tight">{formatPrice(item.price)}</p>
                        {item.original_price && (
                          <p className="text-[10px] text-slate-600 line-through">{formatPrice(item.original_price)}</p>
                        )}
                      </div>

                      {/* Stock new */}
                      <div>
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border',
                          item.stock === 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          item.stock < 5  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full',
                            item.stock === 0 ? 'bg-rose-400' : item.stock < 5 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                          )} />
                          {item.stock}
                        </span>
                      </div>

                      {/* Stock refurbished */}
                      <div>
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border',
                          (item.stock_refurbished || 0) === 0 ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' :
                          (item.stock_refurbished || 0) < 3   ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full',
                            (item.stock_refurbished || 0) === 0 ? 'bg-slate-600' :
                            (item.stock_refurbished || 0) < 3 ? 'bg-amber-400' : 'bg-sky-400'
                          )} />
                          {item.stock_refurbished || 0}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-all cursor-pointer" title="Chỉnh sửa">
                          <Edit3 size={13} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setConfirmDelete(item.id)}
                            className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer" title="Xóa">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer count */}
            {filteredProducts.length > 0 && (
              <div className="px-5 py-2.5 border-t border-white/[0.04] bg-white/[0.01]">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{filteredProducts.length} sản phẩm</p>
              </div>
            )}
          </section>

          {/* Soft-Deleted Products Trash Bin */}
          <section className="mt-6 text-left">
            <button
              type="button"
              onClick={() => setShowTrash(prev => !prev)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md select-none",
                showTrash
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                  : "bg-white/5 border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-white/8"
              )}
            >
              <Trash2 size={14} />
              Thùng rác ({deletedProducts.filter(p => p.category_id === selectedCategoryId).length})
            </button>

            {showTrash && (
              <div className="mt-4 bg-[#121212]/90 border border-rose-500/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-rose-500/10 flex items-center gap-3">
                  <Trash2 size={14} className="text-rose-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Sản Phẩm Đã Ẩn</span>
                </div>
                {deletedProducts.filter(p => p.category_id === selectedCategoryId).length === 0 ? (
                  <div className="p-12 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">Không có sản phẩm nào</div>
                ) : (
                  <div className="divide-y divide-rose-500/10">
                    {deletedProducts
                      .filter(p => p.category_id === selectedCategoryId)
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-rose-500/5 transition-colors">
                          <div className="w-12 h-12 bg-black/40 rounded-xl border border-rose-500/10 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                            <img src={item.image || '/laptop.png'} alt={item.name} className="w-full h-full object-contain opacity-40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-extrabold text-slate-400 uppercase tracking-tight truncate line-through">{item.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{item.brand} · {formatPrice(item.price)} · Tồn: {item.stock}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRestore(item.id)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                          >
                            <RefreshCcw size={12} />
                            Khôi phục
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
