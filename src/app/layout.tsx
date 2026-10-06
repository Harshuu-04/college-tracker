import type { Metadata } from "next";
import { Geist, Geist_Mono, Merriweather } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "MSIT Placement Portal",
  description: "Training and Placement Management System for MSIT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 relative z-0">
        {/* Fixed Watermark Background */}
        <div 
          className="fixed inset-0 z-0 pointer-events-none "
          style={{
            backgroundImage: "url('/watermark.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="flex-1 flex flex-col relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
