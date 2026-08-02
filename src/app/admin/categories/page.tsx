'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Cpu, 
  Laptop, 
  Monitor, 
  Keyboard, 
  Smartphone, 
  Headphones, 
  HelpCircle, 
  Usb, 
  Volume2, 
  Armchair, 
  Network, 
  Gamepad,
  Layers,
  Folder,
  FolderOpen,
  FolderGit2,
  ChevronDown,
  ChevronRight,
  CornerDownRight
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: number | null;
}

const ICON_OPTIONS = [
  'Laptop', 'Monitor', 'Cpu', 'Keyboard', 'Smartphone', 
  'Headphones', 'Usb', 'Volume2', 'Armchair', 'Network', 'Gamepad', 'HelpCircle'
];

export default function AdminCategories() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Trạng thái lọc danh mục: 'all' | 'root' | 'child'
  const [activeTab, setActiveTab] = useState<'all' | 'root' | 'child'>('all');
  // Trạng thái mở rộng các danh mục gốc: lưu danh sách id danh mục gốc đang mở
  const [expandedRootIds, setExpandedRootIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '',
    icon: 'Laptop',
    parent_id: ''
  });

  const isAdmin = user?.role === 'ADMIN';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) { 
      toast.error("Lỗi tải danh mục"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    setMounted(true);
    if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
      fetchCategories();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading(editingCategory ? "Đang cập nhật..." : "Đang thêm mới...");
    
    let cleanSlug = formData.slug.trim();
    if (!cleanSlug) {
      cleanSlug = formData.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-');
    }

    const payload = {
      name: formData.name,
      slug: cleanSlug,
      icon: formData.icon,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
    };
    
    try {
      const res = await fetch('/api/admin/categories', {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory ? { ...payload, id: editingCategory.id } : payload)
      });

      if (res.ok) {
        toast.success(editingCategory ? "Cập nhật thành công" : "Thêm mới thành công", { id: t });
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Lỗi xử lý", { id: t });
      }
    } catch (err) {
      toast.error("Lỗi kết nối", { id: t });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này? Các danh mục con liên kết sẽ tự động chuyển về làm danh mục gốc.')) return;
    
    const t = toast.loading("Đang xóa...");
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        toast.success("Đã xóa danh mục", { id: t });
        fetchCategories();
      } else {
        toast.error("Lỗi khi xóa", { id: t });
      }
    } catch (err) {
      toast.error("Lỗi kết nối", { id: t });
    }
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ 
      name: cat.name, 
      slug: cat.slug,
      icon: cat.icon || 'Laptop',
      parent_id: cat.parent_id ? cat.parent_id.toString() : '' 
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ 
      name: '', 
      slug: '',
      icon: 'Laptop',
      parent_id: ''
    });
    setIsModalOpen(true);
  };

  // Hàm mở rộng/thu gọn danh mục gốc
  const toggleExpandRoot = (id: number) => {
    setExpandedRootIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (!mounted || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return null;

  // Tính số liệu danh mục nhanh
  const totalCategories = categories.length;
  const rootCategories = categories.filter(c => c.parent_id === null).length;
  const subCategories = categories.filter(c => c.parent_id !== null).length;

  // Xử lý logic lọc danh mục hiển thị
  const rootCats = categories.filter(c => c.parent_id === null);
  const childCats = categories.filter(c => c.parent_id !== null);

  interface DisplayRow {
    category: Category;
    isChild: boolean;
    parentName?: string;
  }

  let displayedCategories: DisplayRow[] = [];

  if (activeTab === 'all') {
    // Hiển thị cấu trúc cây: Danh mục gốc, nếu gốc mở rộng thì chèn các con ngay dưới
    rootCats.forEach(root => {
      displayedCategories.push({ category: root, isChild: false });
      const isExpanded = expandedRootIds.includes(root.id);
      if (isExpanded) {
        const children = childCats.filter(c => c.parent_id === root.id);
        children.forEach(child => {
          displayedCategories.push({ category: child, isChild: true, parentName: root.name });
        });
      }
    });
  } else if (activeTab === 'root') {
    // Chỉ hiển thị các danh mục gốc, nhưng vẫn cho phép bấm để hiện danh mục con của gốc đó
    rootCats.forEach(root => {
      displayedCategories.push({ category: root, isChild: false });
      const isExpanded = expandedRootIds.includes(root.id);
      if (isExpanded) {
        const children = childCats.filter(c => c.parent_id === root.id);
        children.forEach(child => {
          displayedCategories.push({ category: child, isChild: true, parentName: root.name });
        });
      }
    });
  } else {
    // Chỉ hiển thị các danh mục con dưới dạng danh sách phẳng
    childCats.forEach(child => {
      const parent = rootCats.find(r => r.id === child.parent_id);
      displayedCategories.push({ category: child, isChild: true, parentName: parent?.name });
    });
  }

  return (
    <div className="space-y-10">
      <Toaster position="top-center" />
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hệ thống phân loại</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-none">DANH MỤC</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-black font-black text-xs tracking-wider uppercase rounded-xl transition-all active:scale-95 cursor-pointer font-bold shrink-0"
          >
            <Plus size={16} />
            <span>THÊM DANH MỤC</span>
          </button>
        )}
      </header>

      {/* Stats Cards / Filter Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        {/* Tất cả danh mục Card */}
        <div 
          onClick={() => setActiveTab('all')}
          className={`border rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer transition-all duration-300 active:scale-98 select-none ${
            activeTab === 'all' 
              ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
              : 'bg-[#111111]/60 border-white/5 hover:border-white/10 hover:bg-[#151515]'
          }`}
        >
          <div className="space-y-0.5">
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Tất cả</p>
            <p className="text-lg sm:text-2xl font-black text-white">{totalCategories}</p>
          </div>
          <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-colors mt-2 sm:mt-0 ${
            activeTab === 'all' ? 'bg-primary/20 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-slate-400'
          }`}>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* Danh mục gốc Card */}
        <div 
          onClick={() => setActiveTab('root')}
          className={`border rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer transition-all duration-300 active:scale-98 select-none ${
            activeTab === 'root' 
              ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/5' 
              : 'bg-[#111111]/60 border-white/5 hover:border-white/10 hover:bg-[#151515]'
          }`}
        >
          <div className="space-y-0.5">
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Danh mục Gốc</p>
            <p className="text-lg sm:text-2xl font-black text-white">{rootCategories}</p>
          </div>
          <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-colors mt-2 sm:mt-0 ${
            activeTab === 'root' ? 'bg-indigo-500/20 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400'
          }`}>
            <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* Danh mục con Card */}
        <div 
          onClick={() => setActiveTab('child')}
          className={`border rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer transition-all duration-300 active:scale-98 select-none ${
            activeTab === 'child' 
              ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/5' 
              : 'bg-[#111111]/60 border-white/5 hover:border-white/10 hover:bg-[#151515]'
          }`}
        >
          <div className="space-y-0.5">
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Danh mục Con</p>
            <p className="text-lg sm:text-2xl font-black text-white">{subCategories}</p>
          </div>
          <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-colors mt-2 sm:mt-0 ${
            activeTab === 'child' ? 'bg-teal-500/20 border-teal-500/20 text-teal-400' : 'bg-white/5 border-white/5 text-slate-400'
          }`}>
            <CornerDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>

      {/* Main categories container (Cards on mobile, Table on desktop) */}
      <section className="bg-[#111111]/80 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        {/* Mobile View: Cards list (<640px) */}
        <div className="block sm:hidden divide-y divide-white/5">
          {displayedCategories.map(({ category: cat, isChild, parentName }) => {
            const subCats = categories.filter(c => c.parent_id === cat.id);
            const hasChildren = subCats.length > 0;
            const isExpanded = expandedRootIds.includes(cat.id);

            return (
              <div 
                key={cat.id}
                className={`p-4 transition-colors space-y-3 ${
                  isChild ? 'bg-white/[0.015] pl-5 border-l-2 border-primary/40' : 'bg-black/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                      isChild ? 'bg-white/3 border-white/5 text-slate-400' : 'bg-primary/10 border-primary/20 text-primary'
                    }`}>
                      {cat.icon === 'Laptop' && <Laptop size={16} />}
                      {cat.icon === 'Monitor' && <Monitor size={16} />}
                      {cat.icon === 'Cpu' && <Cpu size={16} />}
                      {cat.icon === 'Keyboard' && <Keyboard size={16} />}
                      {cat.icon === 'Smartphone' && <Smartphone size={16} />}
                      {cat.icon === 'Headphones' && <Headphones size={16} />}
                      {cat.icon === 'Usb' && <Usb size={16} />}
                      {cat.icon === 'Volume2' && <Volume2 size={16} />}
                      {cat.icon === 'Armchair' && <Armchair size={16} />}
                      {cat.icon === 'Network' && <Network size={16} />}
                      {cat.icon === 'Gamepad' && <Gamepad size={16} />}
                      {cat.icon === 'HelpCircle' && <HelpCircle size={16} />}
                      {!ICON_OPTIONS.includes(cat.icon || '') && <HelpCircle size={16} />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isChild && <CornerDownRight className="w-3 h-3 text-slate-500 shrink-0" />}
                        <p className={`font-extrabold tracking-tight truncate ${isChild ? 'text-slate-200 text-sm' : 'text-white text-base'}`}>
                          {cat.name}
                        </p>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500">ID: #{cat.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => openEditModal(cat)}
                      className="p-2.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95 cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={15} />
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2.5 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    {isChild ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Cha: {parentName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/5 text-slate-400 border border-white/5">
                        Gốc
                      </span>
                    )}

                    {!isChild && hasChildren && (
                      <button 
                        onClick={() => toggleExpandRoot(cat.id)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-wider active:scale-95 cursor-pointer"
                      >
                        <span>{subCats.length} con</span>
                        {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-primary truncate max-w-[130px]">/{cat.slug}</span>
                </div>
              </div>
            );
          })}
          {displayedCategories.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
              Không tìm thấy danh mục tương ứng
            </div>
          )}
        </div>

        {/* Desktop View: Table (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5">Danh Mục</th>
                <th className="px-8 py-5">Danh Mục Cha</th>
                <th className="px-8 py-5">Đường Dẫn (Slug)</th>
                <th className="px-8 py-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {displayedCategories.map(({ category: cat, isChild, parentName }) => {
                const subCats = categories.filter(c => c.parent_id === cat.id);
                const hasChildren = subCats.length > 0;
                const isExpanded = expandedRootIds.includes(cat.id);

                return (
                  <tr 
                    key={cat.id} 
                    className={`transition-colors group ${
                      isChild 
                        ? 'bg-white/[0.01]/30 hover:bg-white/[0.03]' 
                        : 'hover:bg-white/[0.02]'
                    } ${!isChild && hasChildren ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (!isChild && hasChildren) {
                        toggleExpandRoot(cat.id);
                      }
                    }}
                  >
                    {/* ID */}
                    <td className="px-8 py-4 font-mono font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        {isChild && <CornerDownRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                        #{cat.id}
                      </div>
                    </td>

                    {/* Tên Danh Mục */}
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                            isChild 
                              ? 'bg-white/3 border-white/3 text-slate-400' 
                              : 'bg-white/5 border-white/5 text-primary group-hover:scale-105'
                          }`}>
                            {cat.icon === 'Laptop' && <Laptop size={16} />}
                            {cat.icon === 'Monitor' && <Monitor size={16} />}
                            {cat.icon === 'Cpu' && <Cpu size={16} />}
                            {cat.icon === 'Keyboard' && <Keyboard size={16} />}
                            {cat.icon === 'Smartphone' && <Smartphone size={16} />}
                            {cat.icon === 'Headphones' && <Headphones size={16} />}
                            {cat.icon === 'Usb' && <Usb size={16} />}
                            {cat.icon === 'Volume2' && <Volume2 size={16} />}
                            {cat.icon === 'Armchair' && <Armchair size={16} />}
                            {cat.icon === 'Network' && <Network size={16} />}
                            {cat.icon === 'Gamepad' && <Gamepad size={16} />}
                            {cat.icon === 'HelpCircle' && <HelpCircle size={16} />}
                            {!ICON_OPTIONS.includes(cat.icon || '') && <HelpCircle size={16} />}
                          </span>
                          <span className={`font-extrabold tracking-tight ${
                            isChild ? 'text-slate-300 text-sm' : 'text-white text-base'
                          }`}>
                            {cat.name}
                          </span>
                        </div>

                        {/* Chỉ mục con & Nút bấm thu gọn/mở rộng cho danh mục gốc */}
                        {!isChild && hasChildren && (
                          <div 
                            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation(); // Ngăn sự kiện click hàng
                              toggleExpandRoot(cat.id);
                            }}
                          >
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {subCats.length} mục con
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-primary" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Danh Mục Cha */}
                    <td className="px-8 py-4">
                      {isChild ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {parentName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 text-slate-400 border border-white/5">
                          Danh mục Gốc
                        </span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="px-8 py-4 text-xs font-mono text-primary uppercase tracking-wider">/{cat.slug}</td>

                    {/* Thao Tác */}
                    <td className="px-8 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                        >
                          <Edit3 size={16} />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {displayedCategories.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Không tìm thấy danh mục tương ứng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-16 text-center font-bold text-slate-500 animate-pulse uppercase tracking-[0.35em] text-xs">Đang tải danh sách danh mục...</div>}
      </section>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto no-scrollbar flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-md" 
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-[#121212] border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-xl shadow-2xl z-10 pointer-events-auto"
            >
              <header className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                  {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tên danh mục</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Laptop Gaming, Chuột chơi game..."
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-semibold outline-none focus:border-primary text-sm transition-all focus:bg-white/[0.08]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Đường dẫn (Slug - Để trống để tự tạo)</label>
                  <input 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="laptop-gaming, chuot-gaming..."
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-primary font-mono text-xs outline-none focus:border-primary transition-all focus:bg-white/[0.08]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Danh mục Cha</label>
                    <div className="relative">
                      <select 
                        value={formData.parent_id}
                        onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                        className="w-full h-12 bg-[#121212] border border-white/10 rounded-2xl px-4 text-white font-semibold outline-none focus:border-primary text-sm appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#121212] text-white">Làm Danh mục Gốc (Root)</option>
                        {categories
                          .filter(c => !editingCategory || c.id !== editingCategory.id)
                          .map(c => (
                            <option key={c.id} value={c.id} className="bg-[#121212] text-white">{c.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Biểu tượng (Icon)</label>
                    <div className="relative">
                      <select 
                        value={formData.icon}
                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                        className="w-full h-12 bg-[#121212] border border-white/10 rounded-2xl px-4 text-white font-semibold outline-none focus:border-primary text-sm appearance-none cursor-pointer"
                      >
                        {ICON_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="bg-[#121212] text-white">{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/95 text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer mt-4"
                >
                  XÁC NHẬN CẬP NHẬT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

