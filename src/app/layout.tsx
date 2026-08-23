import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Heritage Tales",
  description: "Premium Indian Brassware and curated collections.",
};

import { ClerkProvider } from '@clerk/nextjs'

import Footer from '@/components/Footer';
import { getStoreSettings } from '@/lib/actions';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} ${playfair.variable} bg-[#fcfcfc] text-[#222222]`}>
          {settings.is_sale_active && settings.global_discount > 0 && (
            <div className="bg-black text-white text-center py-2 text-sm font-bold tracking-wide uppercase">
              Global Sale: {settings.global_discount}% off entire store! Discount applied at checkout.
            </div>
          )}
          <Navbar />
          {children}
          <CartDrawer />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
