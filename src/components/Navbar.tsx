'use client';

import { useCartStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const { items, toggleCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  // Hydration fix for zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-[#222222] tracking-tighter font-serif">
            HERITAGE <span className="text-[#b5955b]">TALES</span>
          </h1>
        </Link>
        <nav className="flex space-x-6 items-center">
          <Link href="/admin" className="text-sm font-semibold text-[#666666] hover:text-[#222222] transition-colors tracking-wide uppercase">
            Admin
          </Link>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-[#666666] hover:text-[#222222] transition-colors tracking-wide uppercase">Log In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-semibold px-4 py-2 bg-[#222222] text-white rounded-full hover:bg-[#b5955b] transition-colors tracking-wide uppercase">Sign Up</button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link href="/profile" className="text-sm font-semibold text-[#666666] hover:text-[#222222] transition-colors tracking-wide uppercase">
              Profile
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-[#f8f8f8] transition-colors group">
            <ShoppingCart className="w-6 h-6 text-[#222222] group-hover:text-[#b5955b] transition-colors" />
            {mounted && totalItems > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-[#b5955b] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
