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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} ${playfair.variable} bg-[#fcfcfc] text-[#222222]`}>
          <Navbar />
          {children}
          <CartDrawer />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
