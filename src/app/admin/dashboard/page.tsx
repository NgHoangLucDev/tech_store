'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Percent, 
  ShoppingBag,
  Inbox,
  Activity,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';

interface Summary {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  shippedOrders: number;
  paidOrders: number;
  aov: number;
  lowStockCount: number;
}

interface RevenueChartData {
  date: string;
  fullDate: string;
  revenue: number;
  orders: number;
}

interface CategoryStat {
  category: string;
  revenue: number;
  count: number;
}

interface TopProduct {
  id: number;
  name: string;
  image: string;
  brand: string;
  quantity: number;
  revenue: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  brand: string;
  stock: number;
  price: number;
  image: string;
}

interface StatsData {
  summary: Summary;
  revenueChart: RevenueChartData[];
  categoryStats: CategoryStat[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
}

interface RecentOrder {
  id: number;
  customer_name: string;
  total_price: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30'>('30');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  // State chứa toàn bộ dữ liệu thống kê từ API
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  
  // State cho việc hover trên biểu đồ SVG
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    data: RevenueChartData;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
      fetchDashboardData();
    }
  }, [mounted, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        toast.error('Lỗi tải dữ liệu thống kê');
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.slice(0, 5)); // Lấy 5 đơn mới nhất
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Lỗi tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return null;

  const isStaff = user.role === 'STAFF';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const exportToCSV = () => {
    if (!stats) return;
    try {
      let csvContent = '\uFEFF'; // UTF-8 BOM
      
      csvContent += 'BÁO CÁO THỐNG KÊ TỔNG QUAN HỆ THỐNG TECH-STORE\n';
      csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n\n`;
      
      csvContent += 'CHỈ SỐ TỔNG QUAN\n';
      csvContent += 'Chỉ số,Số lượng / Giá trị\n';
      csvContent += `Tổng doanh thu,${stats.summary.revenue} VND\n`;
      csvContent += `Tổng số đơn hàng,${stats.summary.orders}\n`;
      csvContent += `Đơn hoàn thành,${stats.summary.completedOrders}\n`;
      csvContent += `Đơn chờ xử lý,${stats.summary.pendingOrders}\n`;
      csvContent += `Đơn đang giao,${stats.summary.shippedOrders}\n`;
      csvContent += `Đơn đã hủy,${stats.summary.cancelledOrders}\n`;
      csvContent += `Giá trị đơn hàng trung bình (AOV),${stats.summary.aov} VND\n`;
      csvContent += `Tổng sản phẩm trong hệ thống,${stats.summary.products}\n`;
      csvContent += `Sản phẩm tồn kho thấp (<= 5),${stats.summary.lowStockCount}\n`;
      csvContent += `Tổng số khách hàng,${stats.summary.users}\n\n`;
      
      csvContent += 'DOANH THU THEO DANH MỤC\n';
      csvContent += 'Danh mục,Số lượng sản phẩm đã bán,Doanh thu (VND)\n';
      stats.categoryStats.forEach(c => {
        csvContent += `"${c.category}",${c.count},${c.revenue}\n`;
      });
      csvContent += '\n';
      
      csvContent += 'TOP SẢN PHẨM BÁN CHẠY\n';
      csvContent += 'Mã sản phẩm,Tên sản phẩm,Thương hiệu,Số lượng đã bán,Doanh thu (VND)\n';
      stats.topProducts.forEach(p => {
        csvContent += `${p.id},"${p.name.replace(/"/g, '""')}","${p.brand}",${p.quantity},${p.revenue}\n`;
      });
      csvContent += '\n';

      csvContent += 'DOANH THU CHI TIẾT THEO NGÀY (30 NGÀY QUA)\n';
      csvContent += 'Ngày,Doanh thu (VND),Số đơn hàng thành công\n';
      stats.revenueChart.forEach(d => {
        csvContent += `${d.fullDate || d.date},${d.revenue},${d.orders}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bao-cao-techstore-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Xuất báo cáo CSV thành công!');
    } catch (error) {
      console.error('Export CSV Error:', error);
      toast.error('Lỗi khi xuất báo cáo');
    }
  };

  // Lọc dữ liệu biểu đồ theo bộ lọc thời gian (7 ngày hay 30 ngày)
  const chartData = stats ? (timeRange === '7' ? stats.revenueChart.slice(-7) : stats.revenueChart) : [];
  
  // Tính các toạ độ cho biểu đồ custom SVG Area Chart
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue), 1000000) : 1000000;
  const maxOrders = chartData.length > 0 ? Math.max(...chartData.map(d => d.orders), 5) : 5;

  const revenuePoints = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1 || 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (d.revenue / maxRevenue) * (svgHeight - 2 * paddingY);
    return { x, y, data: d, index: i };
  });

  const revenueLinePath = revenuePoints.length > 0
    ? `M ${revenuePoints[0].x} ${revenuePoints[0].y} ` + revenuePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const revenueAreaPath = revenuePoints.length > 0
    ? `${revenueLinePath} L ${revenuePoints[revenuePoints.length - 1].x} ${svgHeight - paddingY} L ${revenuePoints[0].x} ${svgHeight - paddingY} Z`
    : '';

  // Doughnut Chart Data
  const pendingCount = stats?.summary.pendingOrders || 0;
  const completedCount = (stats?.summary.completedOrders || 0) + (stats?.summary.paidOrders || 0);
  const shippedCount = stats?.summary.shippedOrders || 0;
  const cancelledCount = stats?.summary.cancelledOrders || 0;
  const totalDoughnutCount = pendingCount + completedCount + shippedCount + cancelledCount;

  const doughnutSegments = [
    { label: 'Hoàn thành', count: completedCount, color: 'text-emerald-500', strokeColor: '#10B981', bgHex: '#10B981' },
    { label: 'Đang giao', count: shippedCount, color: 'text-blue-500', strokeColor: '#3B82F6', bgHex: '#3B82F6' },
    { label: 'Chờ xử lý', count: pendingCount, color: 'text-amber-500', strokeColor: '#F59E0B', bgHex: '#F59E0B' },
    { label: 'Đã hủy', count: cancelledCount, color: 'text-red-500', strokeColor: '#EF4444', bgHex: '#EF4444' }
  ].filter(s => s.count > 0);

  let accumulatedPercent = 0;
  const doughnutItems = doughnutSegments.map((s) => {
    const percent = totalDoughnutCount > 0 ? (s.count / totalDoughnutCount) * 100 : 0;
    const strokeDashoffset = 314.16 - (percent / 100) * 314.16;
    const rotation = (accumulatedPercent / 100) * 360 - 90;
    accumulatedPercent += percent;
    return {
      ...s,
      percent,
      strokeDashoffset,
      rotation
    };
  });

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-8">
        <div className="space-y-0.5">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-emerald-500 font-extrabold text-[10px] sm:text-[11px] tracking-[0.3em] uppercase">Hệ thống đang trực tuyến</p>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
            TỔNG QUAN
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Lọc thời gian */}
          <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                timeRange === '7' ? 'bg-primary text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                timeRange === '30' ? 'bg-primary text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 ngày
            </button>
          </div>

          {/* Xuất báo cáo */}
          <button
            onClick={exportToCSV}
            disabled={!stats}
            className="flex items-center gap-1.5 bg-[#111] hover:bg-white/5 border border-white/5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black text-white uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất báo cáo</span>
          </button>

          {/* Admin badge (Hiển thị từ màn sm trở lên) */}
          <div className="hidden sm:flex bg-gradient-to-r from-neutral-900 to-black px-4 py-2 rounded-2xl border border-white/5 items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Users className="w-3 h-3 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">{user.name}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                {isStaff ? 'Nhân viên' : 'Root Admin'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {loading || !stats ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-xs">Đang tải dữ liệu tổng quan...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* Doanh thu */}
            {!isStaff && (
              <StatsCard
                title="DOANH THU"
                value={formatPrice(stats.summary.revenue)}
                icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />}
                gradient="from-indigo-500/10 via-purple-500/5 to-transparent"
                border="border-indigo-500/20"
                glow="shadow-indigo-500/5"
                subtext={`AOV: ${formatPrice(stats.summary.aov)}`}
                progress={80}
              />
            )}
            
            {/* Đơn hàng */}
            <StatsCard
              title="ĐƠN HÀNG"
              value={stats.summary.orders.toString()}
              icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
              gradient="from-amber-500/10 via-orange-500/5 to-transparent"
              border="border-amber-500/20"
              glow="shadow-amber-500/5"
              subtext={`${stats.summary.completedOrders} hoàn thành • ${stats.summary.pendingOrders} chờ`}
              progress={totalDoughnutCount > 0 ? Math.round((completedCount / totalDoughnutCount) * 100) : 0}
            />

            {/* Sản phẩm */}
            <StatsCard
              title="SẢN PHẨM"
              value={stats.summary.products.toString()}
              icon={<Package className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />}
              gradient="from-teal-500/10 via-emerald-500/5 to-transparent"
              border="border-teal-500/20"
              glow="shadow-teal-500/5"
              subtext={stats.summary.lowStockCount > 0 ? `${stats.summary.lowStockCount} sắp hết` : "Kho an toàn"}
              subtextColor={stats.summary.lowStockCount > 0 ? "text-rose-400 font-bold" : "text-slate-400"}
              progress={Math.max(10, 100 - (stats.summary.lowStockCount / (stats.summary.products || 1) * 100))}
            />

            {/* Khách hàng */}
            <StatsCard
              title="KHÁCH HÀNG"
              value={stats.summary.users.toString()}
              icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />}
              gradient="from-pink-500/10 via-rose-500/5 to-transparent"
              border="border-pink-500/20"
              glow="shadow-pink-500/5"
              subtext="Tài khoản hoạt động"
              progress={70}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-[#111111]/80 backdrop-blur-md rounded-3xl p-4 sm:p-8 border border-white/5 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-8">
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-black tracking-widest text-slate-500 uppercase">Biểu đồ doanh thu</h3>
                  <p className="text-sm sm:text-lg font-extrabold text-white">Xu Hướng Doanh Thu {timeRange} Ngày Qua</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                      chartType === 'line' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Đường
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                      chartType === 'bar' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cột
                  </button>
                </div>
              </div>

              {/* Custom SVG Chart */}
              <div className="relative h-[220px] w-full">
                {chartData.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Không có dữ liệu trong khoảng thời gian này
                  </div>
                ) : (
                  <>
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                        </linearGradient>
                        <linearGradient id="chartBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingY + ratio * (svgHeight - 2 * paddingY);
                        return (
                          <line
                            key={idx}
                            x1={paddingX}
                            y1={y}
                            x2={svgWidth - paddingX}
                            y2={y}
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Render Chart according to type */}
                      {chartType === 'line' ? (
                        <>
                          {/* Filled Area */}
                          <path
                            d={revenueAreaPath}
                            fill="url(#chartAreaGradient)"
                          />
                          {/* Line */}
                          <path
                            d={revenueLinePath}
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Dots */}
                          {revenuePoints.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r={hoveredPoint?.index === idx ? "6" : "3.5"}
                              className="fill-[#10B981] stroke-[#111] stroke-2 transition-all duration-150"
                            />
                          ))}
                        </>
                      ) : (
                        /* Bar Chart version */
                        revenuePoints.map((p, idx) => {
                          const barWidth = Math.max(4, (svgWidth - 2 * paddingX) / chartData.length * 0.6);
                          const barHeight = svgHeight - paddingY - p.y;
                          return (
                            <rect
                              key={idx}
                              x={p.x - barWidth / 2}
                              y={p.y}
                              width={barWidth}
                              height={barHeight}
                              fill="url(#chartBarGradient)"
                              rx="3"
                              className="transition-all duration-300 hover:opacity-100 opacity-90"
                            />
                          );
                        })
                      )}

                      {/* Hover Interaction Guide Line */}
                      {hoveredPoint && (
                        <line
                          x1={hoveredPoint.x}
                          y1={paddingY}
                          x2={hoveredPoint.x}
                          y2={svgHeight - paddingY}
                          stroke="#10B981"
                          strokeDasharray="4 4"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      )}

                      {/* X Axis Labels */}
                      {chartData.map((d, i) => {
                        // Chỉ hiện một số nhãn để tránh chen chúc
                        const shouldShow = chartData.length <= 10 || i % Math.round(chartData.length / 6) === 0 || i === chartData.length - 1;
                        if (!shouldShow) return null;
                        const x = paddingX + (i / (chartData.length - 1 || 1)) * (svgWidth - 2 * paddingX);
                        return (
                          <text
                            key={i}
                            x={x}
                            y={svgHeight}
                            fill="#64748B"
                            fontSize="9"
                            fontWeight="800"
                            textAnchor="middle"
                          >
                            {d.date}
                          </text>
                        );
                      })}
                    </svg>

                    {/* Interactive overlay areas to trigger tooltip */}
                    <div className="absolute inset-0 flex" style={{ left: paddingX, right: paddingX, top: paddingY, bottom: paddingY }}>
                      {revenuePoints.map((p, idx) => (
                        <div
                          key={idx}
                          className="h-full flex-1 cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ index: idx, x: p.x, y: p.y, data: p.data })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </div>

                    {/* Tooltip Overlay */}
                    <AnimatePresence>
                      {hoveredPoint && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute z-20 bg-[#1e1e1e] border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-none min-w-[200px]"
                          style={{
                            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                            top: `${(hoveredPoint.y / svgHeight) * 100 - 35}%`,
                            transform: 'translate(-50%, -100%)',
                          }}
                        >
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                            Ngày {new Date(hoveredPoint.data.fullDate).toLocaleDateString('vi-VN')}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[11px] font-bold text-slate-400">Doanh thu:</span>
                              <span className="text-sm font-black text-primary">{formatPrice(hoveredPoint.data.revenue)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[11px] font-bold text-slate-400">Đơn hàng:</span>
                              <span className="text-xs font-black text-white">{hoveredPoint.data.orders} đơn</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>

            {/* Status Breakdown & Category Stats */}
            <div className="bg-[#111111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl flex flex-col justify-between">
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase">Trạng thái & Tỷ lệ</h3>
                <p className="text-lg font-extrabold text-white">Tình Trạng Đơn Hàng</p>
              </div>

              {/* Doughnut and legend container */}
              <div className="flex flex-row items-center justify-around gap-4 py-2">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg width="110" height="110" viewBox="0 0 120 120" className="overflow-visible">
                    {totalDoughnutCount === 0 ? (
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="14"
                      />
                    ) : (
                      doughnutItems.map((item, idx) => (
                        <circle
                          key={idx}
                          cx="60"
                          cy="60"
                          r="48"
                          fill="transparent"
                          stroke={item.strokeColor}
                          strokeWidth="14"
                          strokeDasharray="301.6"
                          strokeDashoffset={301.6 - (item.percent / 100) * 301.6}
                          strokeLinecap="round"
                          transform={`rotate(${item.rotation} 60 60)`}
                          className="transition-all duration-500 hover:stroke-[16] cursor-pointer"
                        />
                      ))
                    )}
                  </svg>
                  {/* Center Text */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white leading-none">{totalDoughnutCount}</span>
                    <span className="text-[8px] font-black text-slate-500 tracking-wider uppercase mt-1">Đơn hàng</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {doughnutItems.length === 0 ? (
                    <p className="text-xs text-slate-500 font-bold">Không có dữ liệu đơn hàng</p>
                  ) : (
                    doughnutItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.bgHex }} />
                        <span className="text-[11px] font-bold text-slate-400 min-w-[80px]">{item.label}</span>
                        <span className="text-xs font-black text-white">{item.count}</span>
                        <span className="text-[10px] text-slate-500">({Math.round(item.percent)}%)</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Category progress bars */}
              <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Doanh thu theo danh mục</p>
                </div>
                <div className="space-y-3 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {stats.categoryStats.length === 0 ? (
                    <div className="text-center text-xs text-slate-600 py-4">Chưa có doanh thu danh mục</div>
                  ) : (
                    stats.categoryStats.map((cat, idx) => {
                      const maxCatRevenue = Math.max(...stats.categoryStats.map(c => c.revenue), 1000000);
                      const percent = Math.min(100, Math.round((cat.revenue / maxCatRevenue) * 100));
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-300">
                            <span className="truncate max-w-[150px]">{cat.category}</span>
                            <span className="text-white font-extrabold">{formatPrice(cat.revenue)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Grid: Recent Orders, Top Selling & Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders Section */}
            <div className="lg:col-span-2 bg-[#111111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase">Đơn hàng</h3>
                    <p className="text-lg font-extrabold text-white">Đơn Hàng Gần Đây</p>
                  </div>
                  <button
                    onClick={() => router.push('/admin/orders')}
                    className="text-primary font-black text-xs tracking-widest uppercase hover:underline underline-offset-8 transition-all flex items-center gap-1 active:scale-95"
                  >
                    Xem tất cả
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between group border-b border-white/5 pb-5 last:border-0 last:pb-0 hover:bg-white/2 transition-colors rounded-xl px-2 py-1"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center text-white font-black text-sm border border-white/5">
                            {order.customer_name
                              ? order.customer_name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
                              : 'KH'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white group-hover:text-primary transition-colors uppercase">
                              Đơn #{order.id}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                              {order.customer_name || 'Khách vãng lai'} • {new Date(order.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-black text-base text-white tracking-tight">{formatPrice(order.total_price)}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full shadow ${
                            order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                            order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            order.status === 'SHIPPED' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                            order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                            'bg-blue-500/10 text-primary border border-primary/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                      <Inbox className="w-8 h-8 mb-2" />
                      <p className="text-xs uppercase font-black tracking-widest">Chưa có đơn hàng nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Selling & Low Stock */}
            <div className="space-y-8 flex flex-col justify-between">
              {/* Top Selling Products */}
              <div className="bg-[#111111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase">Sản phẩm nổi bật</h3>
                      <p className="text-base font-extrabold text-white">Bán Chạy Nhất</p>
                    </div>
                    <Award className="w-5 h-5 text-primary" />
                  </div>

                  <div className="space-y-4">
                    {stats.topProducts.length === 0 ? (
                      <div className="text-center text-xs text-slate-600 py-6 uppercase font-bold">Không có dữ liệu bán hàng</div>
                    ) : (
                      stats.topProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-black text-slate-500">
                              #{idx + 1}
                            </div>
                            <div className="truncate max-w-[180px]">
                              <p className="text-xs font-extrabold text-white truncate leading-tight">{p.name}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{p.brand}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-primary">{p.quantity} đã bán</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">{formatPrice(p.revenue)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-[#111111]/80 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-2xl flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase">Cảnh báo tồn kho</h3>
                      <p className="text-base font-extrabold text-white">Sắp Hết Hàng (Tồn ≤ 5)</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>

                  <div className="space-y-4">
                    {stats.lowStockProducts.length === 0 ? (
                      <div className="text-center text-xs text-slate-600 py-6 uppercase font-bold">Tồn kho đầy đủ, an toàn</div>
                    ) : (
                      stats.lowStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center overflow-hidden">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                            <div className="truncate max-w-[160px]">
                              <p className="text-xs font-extrabold text-white truncate leading-tight">{p.name}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{p.brand}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                              p.stock === 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                              Tồn: {p.stock}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-1">{formatPrice(p.price)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  border: string;
  glow: string;
  subtext: string;
  subtextColor?: string;
  progress: number;
}

function StatsCard({
  title,
  value,
  icon,
  gradient,
  border,
  subtext,
  subtextColor = "text-slate-400"
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  border: string;
  glow?: string;
  subtext: string;
  subtextColor?: string;
  progress?: number;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-3.5 sm:p-5 border ${border} shadow-lg flex flex-col justify-between transition-all duration-300 relative overflow-hidden`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[8px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">{title}</p>
          <h3 className="text-[13px] sm:text-xl lg:text-2xl font-black tracking-tight text-white leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{value}</h3>
        </div>
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
          {icon}
        </div>
      </div>

      <p className={`text-[9px] sm:text-[10px] font-bold ${subtextColor} truncate mt-3`}>{subtext}</p>
    </div>
  );
}
