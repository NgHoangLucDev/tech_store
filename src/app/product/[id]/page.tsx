'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ShoppingCart, ShieldCheck, Truck, RefreshCw, 
  ChevronRight, Star, Plus, Minus, Share2, 
  Heart, Cpu, Monitor, Zap, Info, Box
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/features/product/ProductCard';
import { ALL_PRODUCTS } from '@/lib/data';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load initial product from mock list
  const mockProduct = ALL_PRODUCTS.find(p => p.id === id) || ALL_PRODUCTS[0] || { id: '', name: 'Đang tải...', price: 0, image: '/laptop.png', category: '', brand: '', specs: null };
  const [product, setProduct] = useState<any>(mockProduct);
  const [activeTab, setActiveTab] = useState<'specs' | 'description'>('specs');
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [boughtTogether, setBoughtTogether] = useState<any[]>([]);
  const [crossSell, setCrossSell] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [detailImages, setDetailImages] = useState<string[]>([]);
  
  const images = detailImages.length > 0 ? detailImages : [product.image, product.image, product.image, product.image];
  
  // Helper to parse specs in new grouped JSON format
  const getGroupedSpecs = () => {
    if (!product.specs) {
      return {
        general: {
          "Thương hiệu": product.brand || "Đang cập nhật",
          "Tên": product.name
        },
        detailed: {}
      };
    }

    try {
      const parsed = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
      if (parsed && typeof parsed === 'object') {
        if (parsed.general || parsed.detailed) {
          return {
            general: parsed.general || {},
            detailed: parsed.detailed || {}
          };
        }
        // Fallback for flat JSON object
        return {
          general: {
            "Thương hiệu": product.brand || "Đang cập nhật",
            "Tên": product.name
          },
          detailed: parsed
        };
      }
    } catch (e) {
      console.error("Lỗi parse specs:", e);
    }

    return { general: {}, detailed: {} };
  };

  const groupedSpecs = getGroupedSpecs();

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);

    const loadProductDetails = async () => {
      try {
        const res = await fetch('/api/products');
        const dbData = await res.json();
        if (Array.isArray(dbData)) {
          const dbProduct = dbData.find((p: any) => p.id.toString() === id);
          if (dbProduct) {
            const price = parseFloat(dbProduct.price) || 0;
            const originalPrice = dbProduct.original_price ? parseFloat(dbProduct.original_price) : undefined;
            const discount = (originalPrice && originalPrice > price) 
              ? Math.round(((originalPrice - price) / originalPrice) * 100) 
              : undefined;

            const loadedProduct = {
              id: dbProduct.id.toString(),
              name: dbProduct.name,
              price,
              originalPrice,
              discount,
              image: dbProduct.image || '/laptop.png',
              rating: parseFloat(dbProduct.rating) || 4.8,
              reviewsCount: parseInt(dbProduct.reviewsCount) || 45,
              category: dbProduct.category_slug || dbProduct.slug || dbProduct.category_name?.toLowerCase() || '',
              category_name: dbProduct.category_name || '',
              brand: dbProduct.brand || 'ASUS',
              description: dbProduct.description,
              specs: dbProduct.specs
            };
            setProduct(loadedProduct);

            // 0. Fetch sub-images
            try {
              const imgRes = await fetch(`/api/products/images?productId=${dbProduct.id}`);
              const imgData = await imgRes.json();
              if (Array.isArray(imgData) && imgData.length > 0) {
                const imgUrls = imgData.map((img: any) => img.url);
                setDetailImages(imgUrls);
              }
            } catch (err) {
              console.error("Lỗi lấy danh sách ảnh chi tiết từ MySQL:", err);
            }

            // 1. Fetch similar products (same category)
            const catName = dbProduct.category_name || dbProduct.category_slug || dbProduct.slug || '';
            if (catName) {
              const simRes = await fetch(`/api/products?category=${encodeURIComponent(catName)}`);
              const simData = await simRes.json();
              if (Array.isArray(simData)) {
                setSimilarProducts(simData.filter((p: any) => p.id.toString() !== dbProduct.id.toString()));
              }
            }

            // 2. Fetch relations (bought together, cross sell, related)
            const relRes = await fetch(`/api/products/relations?productId=${dbProduct.id}`);
            const relData = await relRes.json();
            if (relData) {
              setBoughtTogether(relData.bought_together || []);
              setCrossSell(relData.cross_sell || []);
              setRelatedProducts(relData.related || []);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm từ MySQL:", err);
      }
    };
    loadProductDetails();
  }, [id]);

  if (!mounted) return null;

  const handleAddToCart = () => {
    // Add main product
    addItem({ ...product, quantity });
    
    // Add selected addon items
    if (selectedAddons.length > 0) {
      const addonsToAdd = boughtTogether.filter(item => selectedAddons.includes(item.id.toString()));
      addonsToAdd.forEach(addon => {
        addItem({ ...addon, quantity: 1 });
      });
      toast.success('Đã thêm sản phẩm chính và các phụ kiện mua kèm vào giỏ hàng!');
    } else {
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiến hành mua hàng');
      router.push('/login');
      return;
    }
    // Add main product
    addItem({ ...product, quantity });
    
    // Add selected addon items
    if (selectedAddons.length > 0) {
      const addonsToAdd = boughtTogether.filter(item => selectedAddons.includes(item.id.toString()));
      addonsToAdd.forEach(addon => {
        addItem({ ...addon, quantity: 1 });
      });
    }
    router.push('/checkout');
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      <Header />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        {/* Breadcrumbs HUD */}
        <nav className="flex items-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-4">
           <Link href="/" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary cursor-pointer transition-colors">Trang chủ</Link>
           <ChevronRight size={12} className="text-slate-700" />
           <Link href={`/products?category=${product.category}`} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary cursor-pointer transition-colors">
              {product.category === 'laptops' ? 'Máy tính xách tay' : 
               product.category === 'displays' ? 'Màn hình đồ họa' : 
               product.category === 'peripherals' ? 'Phụ kiện cao cấp' : 
               product.category === 'components' ? 'Linh kiện phần cứng' : 
               product.category}
           </Link>
           <ChevronRight size={12} className="text-slate-700" />
           <span className="text-[9px] font-black uppercase tracking-widest text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
           {/* Left: Media & Description Area */}
           <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                 {/* Main Image Stage */}
                 <div className={cn(
                   "relative aspect-[4/3] rounded-[3rem] border-2 overflow-hidden group transition-all duration-500",
                   theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-xl"
                 )}>
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                    <AnimatePresence mode="wait">
                       <motion.div 
                         key={activeImg}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 1.05 }}
                         transition={{ duration: 0.4 }}
                         className="relative w-full h-full p-12"
                       >
                          <Image src={images[activeImg]} alt={product.name} fill className="object-contain rounded-[2.5rem]" />
                       </motion.div>
                    </AnimatePresence>
                    
                    {/* Floating Controls */}
                    <div className="absolute top-8 right-8 flex flex-col gap-4">
                       <button className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:text-primary transition-all border border-white/10">
                          <Share2 size={20} />
                       </button>
                       <button className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:text-red-500 transition-all border border-white/10">
                          <Heart size={20} />
                       </button>
                    </div>
                 </div>

                 {/* Thumbnails */}
                 <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                    {images.map((img, i) => (
                       <button 
                         key={i}
                         onClick={() => setActiveImg(i)}
                         className={cn(
                           "relative w-24 h-24 rounded-2xl border-2 overflow-hidden transition-all shrink-0",
                           activeImg === i ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-white/5 opacity-50 hover:opacity-100 hover:border-white/20"
                         )}
                       >
                          <Image src={img} alt="Thumbnail" fill className="object-cover p-2" />
                       </button>
                    ))}
                 </div>
              </div>

              {/* Product Info Sections */}
              <div className={cn(
                "rounded-[3rem] border-2 p-12 space-y-12 transition-all duration-500",
                theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-xl"
              )}>
                 {/* Tabs Header */}
                 <div className="flex border-b border-white/10 pb-1 gap-8">
                    <button 
                      onClick={() => setActiveTab('specs')}
                      className={cn(
                        "pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                        activeTab === 'specs' 
                          ? "border-primary text-primary" 
                          : "border-transparent text-slate-500 hover:text-white"
                      )}
                    >
                       Thông số kỹ thuật
                    </button>
                    <button 
                      onClick={() => setActiveTab('description')}
                      className={cn(
                        "pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                        activeTab === 'description' 
                          ? "border-primary text-primary" 
                          : "border-transparent text-slate-500 hover:text-white"
                      )}
                    >
                       Chi tiết sản phẩm
                    </button>
                 </div>

                 {activeTab === 'specs' ? (
                    <div className="space-y-10">
                       {/* Group 1: Thông tin chung */}
                       {Object.keys(groupedSpecs.general).length > 0 ? (
                         <div className="space-y-4">
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-primary italic">Thông tin chung</h3>
                            <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                               {Object.entries(groupedSpecs.general).map(([key, value]: any, index) => (
                                  <div key={index} className={cn(
                                    "grid grid-cols-3 p-5 text-xs font-semibold leading-relaxed",
                                    index % 2 === 0 ? (theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50") : ""
                                  )}>
                                     <span className="text-slate-500 uppercase tracking-wider">{key}</span>
                                     <span className={cn("col-span-2 font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{value}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                       ) : (
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center py-4">Chưa cập nhật thông tin chung</p>
                       )}

                       {/* Group 2: Cấu hình chi tiết */}
                       {Object.keys(groupedSpecs.detailed).length > 0 ? (
                         <div className="space-y-4">
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-primary italic">Cấu hình chi tiết</h3>
                            <div className="relative">
                               <div className={cn(
                                 "border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 transition-all duration-700",
                                 !isExpanded && "max-h-[400px] overflow-hidden"
                               )}>
                                  {Object.entries(groupedSpecs.detailed).map(([key, value]: any, index) => (
                                     <div key={index} className={cn(
                                       "grid grid-cols-3 p-5 text-xs font-semibold leading-relaxed",
                                       index % 2 === 0 ? (theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50") : ""
                                     )}>
                                        <span className="text-slate-500 uppercase tracking-wider">{key}</span>
                                        <span className={cn("col-span-2 font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{value}</span>
                                     </div>
                                  ))}
                               </div>
                               {!isExpanded && (
                                  <div className={cn(
                                    "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t pointer-events-none",
                                    theme === 'dark' ? "from-slate-950" : "from-white"
                                  )} />
                               )}
                            </div>
                            
                            <div className="text-center pt-4">
                               <button 
                                 onClick={() => setIsExpanded(!isExpanded)}
                                 className="px-8 py-3 bg-white/5 border-2 border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-primary hover:border-primary/30 transition-all active:scale-95"
                                >
                                  {isExpanded ? 'Thu gọn thông số' : 'Xem thêm cấu hình chi tiết'}
                               </button>
                            </div>
                         </div>
                       ) : (
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center py-4">Chưa cập nhật cấu hình chi tiết</p>
                       )}
                    </div>
                 ) : (
                    <section className="space-y-6">
                       <div className="prose prose-invert max-w-none text-sm font-medium leading-relaxed">
                          <p className="text-slate-400 whitespace-pre-line">
                             {product.description || `${product.name} là mẫu sản phẩm cao cấp sở hữu cấu hình mạnh mẽ, thiết kế hiện đại và độ bền vượt trội. Được cung cấp chính hãng tại Tech-Store với chế độ hậu mãi và bảo hành 5 sao.`}
                          </p>
                       </div>
                    </section>
                 )}

                 <hr className="border-white/5" />

                 {/* Ratings HUD */}
                 <section className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-black uppercase tracking-tighter italic">Đánh giá khách hàng</h2>
                       <div className="flex items-center gap-4">
                          <span className="text-5xl font-black text-primary tracking-tighter">4.9</span>
                          <div className="flex flex-col">
                             <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} className="text-primary" />)}
                             </div>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">128 nhận xét</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       {[1, 2].map((review) => (
                          <div key={review} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
                             <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary uppercase">N</div>
                                   <div>
                                      <h4 className="text-xs font-black uppercase tracking-widest">Nguyễn Minh Quân</h4>
                                      <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Đã mua tại Tech-Store</span>
                                   </div>
                                </div>
                                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">12/05/2026</span>
                             </div>
                             <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"Máy cực khỏe, chạy êm, tản nhiệt tốt ngoài mong đợi. Nhân viên Tech-Store hỗ trợ cài đặt phần mềm rất nhiệt tình. Rất hài lòng!"</p>
                          </div>
                       ))}
                    </div>
                 </section>
              </div>
           </div>

           {/* Right: Buy & Specs Sticky HUD */}
           <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-8">
                 {/* Purchase Card */}
                 <div className={cn(
                   "rounded-[3rem] border-2 p-10 space-y-8 transition-all duration-500",
                   theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-xl"
                 )}>
                    <div className="space-y-4">
                       <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Module Stock: In stock</span>
                       <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight italic drop-shadow-xl">{product.name}</h1>
                       <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                             {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" className="text-primary" />)}
                          </div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">(128 Signal Units Received)</span>
                       </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-primary/5 border-2 border-primary/20 space-y-2">
                       <div className="flex items-baseline gap-4">
                          <span className="text-4xl font-black text-primary tracking-tighter">{product.price.toLocaleString('vi-VN')}₫</span>
                          <span className="text-sm font-bold text-slate-500 line-through">{(product.price * 1.15).toLocaleString('vi-VN')}₫</span>
                       </div>
                       <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] block">Tiết kiệm: 15% (Chương trình ưu đãi tháng 5)</span>
                    </div>

                    {/* Quantity & CTAs */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-6">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Số lượng</span>
                          <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5">
                             <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-primary transition-colors"><Minus size={16} /></button>
                             <span className="w-12 text-center font-black text-xl">{quantity}</span>
                             <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-primary transition-colors"><Plus size={16} /></button>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button 
                            onClick={handleBuyNow}
                            className="h-20 bg-primary text-white rounded-[2rem] font-black flex flex-col items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30"
                          >
                             <span className="text-[10px] uppercase tracking-[0.3em]">MUA NGAY</span>
                             <span className="text-[8px] opacity-60 font-bold uppercase tracking-widest italic">Nhận hàng trong 2h</span>
                          </button>
                          <button 
                             onClick={handleAddToCart}
                             className={cn(
                               "h-20 border-2 rounded-[2rem] font-black flex flex-col items-center justify-center gap-1 active:scale-95 transition-all",
                               theme === 'dark' ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200"
                             )}
                           >
                              <ShoppingCart size={20} className="mb-1" />
                              <span className="text-[9px] uppercase tracking-[0.2em]">GIỎ HÀNG</span>
                           </button>
                       </div>
                       
                       <button className="w-full h-16 bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all">
                          MUA TRẢ GÓP 0% LÃI SUẤT
                       </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-6 pt-4">
                       <div className="flex items-center gap-3">
                          <ShieldCheck size={20} className="text-primary" />
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Bảo hành 24 tháng</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <RefreshCw size={20} className="text-primary" />
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">1 đổi 1 trong 30 ngày</span>
                       </div>
                    </div>
                 </div>

                 {/* Bought Together (Sản phẩm mua kèm) */}
                 {boughtTogether.length > 0 && (
                    <div className={cn(
                      "rounded-[3rem] border-2 p-10 space-y-8 transition-all duration-500",
                      theme === 'dark' ? "bg-slate-900/40 border-white/5" : "bg-slate-100 border-slate-200 shadow-xl"
                    )}>
                       <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-primary">
                             <Plus size={20} className="animate-pulse" /> 
                             Sản phẩm đi mua kèm
                          </h3>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Tích chọn combo nhận ưu đãi tại Tech-Store</p>
                       </div>

                       <div className="space-y-4">
                          {boughtTogether.map((item) => {
                            const isChecked = selectedAddons.includes(item.id.toString());
                            return (
                               <div 
                                 key={item.id}
                                 onClick={() => {
                                    if (isChecked) {
                                      setSelectedAddons(selectedAddons.filter(id => id !== item.id.toString()));
                                    } else {
                                      setSelectedAddons([...selectedAddons, item.id.toString()]);
                                    }
                                 }}
                                 className={cn(
                                   "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none",
                                   isChecked 
                                     ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" 
                                     : "border-white/5 bg-white/5 hover:border-white/20"
                                 )}
                               >
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    readOnly
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" 
                                  />
                                  <div className="relative w-16 h-16 bg-black rounded-xl overflow-hidden shrink-0 border border-white/5">
                                     <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <h4 className={cn("text-[10px] font-black truncate uppercase tracking-wider", theme === 'dark' ? "text-white" : "text-slate-900")}>{item.name}</h4>
                                     <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{item.brand}</p>
                                     <p className="text-primary font-black text-xs mt-1">{item.price.toLocaleString('vi-VN')}₫</p>
                                  </div>
                               </div>
                            );
                          })}
                       </div>

                       {selectedAddons.length > 0 && (
                          <div className="p-6 bg-primary/10 border-2 border-primary/20 rounded-2xl text-center space-y-2">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Tổng combo ({selectedAddons.length + 1} sản phẩm)</span>
                             <p className="text-2xl font-black text-primary tracking-tight leading-none">
                                {(product.price + boughtTogether
                                   .filter(item => selectedAddons.includes(item.id.toString()))
                                   .reduce((acc, item) => acc + item.price, 0)
                                ).toLocaleString('vi-VN')}₫
                             </p>
                          </div>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Similar Products Carousel */}
        <section className="mt-32 space-y-12">
           <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Sản phẩm tương tự</h2>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                 Xem tất cả <ChevronRight size={14} />
              </button>
           </div>
           <div className="flex gap-8 overflow-x-auto no-scrollbar pb-8">
              {(similarProducts.length > 0 ? similarProducts : ALL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id)).slice(0, 5).map((p) => (
                 <div key={p.id} className="min-w-[300px]">
                    <ProductCard {...p} />
                 </div>
              ))}
           </div>
        </section>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
           <section className="mt-20 space-y-12">
              <div className="flex items-center justify-between">
                 <h2 className="text-4xl font-black uppercase tracking-tighter italic">Gợi ý liên quan</h2>
              </div>
              <div className="flex gap-8 overflow-x-auto no-scrollbar pb-8">
                 {relatedProducts.map((p) => (
                    <div key={p.id} className="min-w-[300px]">
                       <ProductCard {...p} />
                    </div>
                 ))}
              </div>
           </section>
        )}
      </main>

      <Footer />
      
      <style jsx global>{`
        .mask-gradient {
          mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
