import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "react-hot-toast";
import ClientPatch from "@/components/layout/ClientPatch";
import FloatingContact from "@/components/layout/FloatingContact";

export const metadata: Metadata = {
  title: "TechStore Premium — Laptop, Màn hình, Linh kiện chính hãng",
  description: "Mua laptop gaming, màn hình 4K, linh kiện PC và phụ kiện công nghệ chính hãng. Bảo hành 12–24 tháng, giao hàng toàn quốc, hỗ trợ kỹ thuật 24/7.",
  openGraph: {
    title: "TechStore Premium — Thiết bị công nghệ chính hãng",
    description: "Laptop gaming, màn hình OLED, linh kiện PC cao cấp. Bảo hành tận tâm, giá cạnh tranh.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClientPatch />
        <Toaster 
          position="top-right" 
          reverseOrder={false} 
          toastOptions={{
            duration: 1500, // 1.5s để đủ đọc nhưng vẫn nhanh theo ý bạn
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '16px',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
        {children}
        <FloatingContact />
      </body>
    </html>
  );
}
