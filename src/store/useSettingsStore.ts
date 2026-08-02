import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  toggleTheme: () => void;
  setLanguage: (lang: 'vi' | 'en') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'tech-store-settings',
      skipHydration: true,
    }
  )
);

export const translations = {
  en: {
    brand: 'TECH STORE',
    tagline: 'Technologies',
    searchPlaceholder: 'Search',
    initialize: 'Initialize',
    orders: 'Orders',
    cart: 'Cart',
    systemIndex: 'System Index',
    systemOperational: 'System: Operational',
    phaseTransition: 'Phase Transition',
    limitedSequence: 'Limited Sequence',
    expiresIn: 'Expires In',
    accessFullDatabase: 'Access Full Database',
    allocated: 'Allocated',
    laptops: 'Laptops',
    displays: 'Displays',
    peripherals: 'Peripherals',
    components: 'Components',
    exploreSeries: 'Explore Series',
    viewCatalog: 'View Catalog',
    futureOfTechnology: 'THE FUTURE OF TECHNOLOGY',
    techDescription: 'Explore our curated selection of ultra-high-end hardware and peripherals designed for the elite.',
    heroSlides: [
      {
        title: 'FUTURE OF TECHNOLOGY',
        description: 'Discover our ultra-premium hardware collection curated for the elite.'
      },
      {
        title: 'OLED VISUAL REVOLUTION',
        description: 'Experience deep blacks and infinite contrast with our latest curved displays.'
      },
      {
        title: 'ULTIMATE WORKSTATIONS',
        description: 'Engineered for maximum performance and professional-grade stability.'
      },
      {
        title: 'CORE POWER UNLEASHED',
        description: 'Next-gen processors and components designed for the most demanding tasks.'
      }
    ],
    showroom3d: '3D SHOWROOM',
    showroomDescription: 'Interact with virtual 3D models of premium technology items',
    dragToRotate: 'Drag to Rotate 360°',
    rgbCustomization: 'RGB LED Customization',
    openScreen: 'Tilt Screen',
    fanSpeed: 'Fan Control',
    keyClick: 'Press Keys to Test'
  },
  vi: {
    brand: 'TECH STORE',
    tagline: 'Technologies',
    searchPlaceholder: 'Search',
    initialize: 'Đăng nhập',
    orders: 'Đơn hàng',
    cart: 'Giỏ hàng',
    systemIndex: 'Danh mục hệ thống',
    systemOperational: 'Trạng thái: Hoạt động',
    phaseTransition: 'Giai đoạn chuyển giao',
    limitedSequence: 'Số lượng có hạn',
    expiresIn: 'Kết thúc trong',
    accessFullDatabase: 'Xem tất cả sản phẩm Flash Sale',
    allocated: 'Đã phân phối',
    laptops: 'Laptops',
    displays: 'Displays',
    peripherals: 'Peripherals',
    components: 'Components',
    exploreSeries: 'KHÁM PHÁ CÁC DÒNG MÁY',
    viewCatalog: 'XEM DANH MỤC SẢN PHẨM',
    futureOfTechnology: 'FUTURE OF TECHNOLOGY',
    techDescription: 'Khám phá bộ sưu tập phần cứng và thiết bị ngoại vi cực kỳ cao cấp được tuyển chọn cho giới thượng lưu.',
    heroSlides: [
      {
        title: 'FUTURE OF TECHNOLOGY',
        description: 'Khám phá bộ sưu tập phần cứng và thiết bị ngoại vi cực kỳ cao cấp được tuyển chọn cho giới thượng lưu.'
      },
      {
        title: 'OLED VISUAL REVOLUTION',
        description: 'Trải nghiệm độ tương phản vô hạn và sắc đen tuyệt đối với các màn hình cong mới nhất.'
      },
      {
        title: 'ULTIMATE WORKSTATIONS',
        description: 'Được thiết kế cho hiệu năng tối đa và độ ổn định chuẩn chuyên nghiệp.'
      },
      {
        title: 'CORE POWER UNLEASHED',
        description: 'Bộ vi xử lý và linh kiện thế hệ mới dành cho những tác vụ khắt khe nhất.'
      }
    ],
    showroom3d: 'PHÒNG CHIẾU 3D',
    showroomDescription: 'Tương tác trực quan với các mô hình phần cứng 3D cực kỳ sống động',
    dragToRotate: 'Kéo chuột để xoay 360°',
    rgbCustomization: 'Tùy chỉnh đèn LED RGB',
    openScreen: 'Gập mở màn hình',
    fanSpeed: 'Điều khiển quạt gió',
    keyClick: 'Gõ phím để thử âm'
  }
};
