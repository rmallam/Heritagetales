'use client';

import { useCartStore } from '@/lib/store';
import { ShoppingCart, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { checkIsAdmin } from '@/lib/actions';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';

export default function Navbar() {
  const { items, toggleCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { userId } = useAuth();
  
  useEffect(() => {
    setMounted(true);
    if (userId) {
      checkIsAdmin().then(res => setIsAdmin(!!res));
    } else {
      setIsAdmin(false);
    }
  }, [userId]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-[#222222] tracking-tighter font-serif">
            HERITAGE <span className="text-[#b5955b]">TALES</span>
          </h1>
        </Link>
        <nav className="flex space-x-3 md:space-x-6 items-center">
          <form action="/" className="hidden md:flex relative mr-4">
            <input 
              name="q"
              type="text" 
              placeholder="Search brassware..." 
              className="pl-4 pr-10 py-2 rounded-full border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-[#b5955b] outline-none text-sm w-64 transition-all"
            />
            <button type="submit" className="absolute right-3 top-2.5">
              <Search className="w-4 h-4 text-neutral-400 hover:text-[#b5955b] transition-colors" />
            </button>
          </form>

          {isAdmin && (
            <Link href="/admin" className="text-sm font-semibold text-[#666666] hover:text-[#222222] transition-colors tracking-wide uppercase hidden sm:block">
              Admin
            </Link>
          )}
          <SignedIn>
            <Link href="/orders" className="text-sm font-semibold text-[#666666] hover:text-[#b5955b] transition-colors tracking-wide uppercase hidden sm:block">
              Orders
            </Link>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-[#666666] hover:text-[#222222] transition-colors tracking-wide uppercase hidden sm:block">Log In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-semibold px-4 py-2 bg-[#222222] text-white rounded-full hover:bg-[#b5955b] transition-colors tracking-wide uppercase text-xs sm:text-sm">Sign Up</button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link href="/profile" className="text-sm font-semibold text-[#666666] hover:text-[#222222] transition-colors tracking-wide uppercase hidden sm:block">
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
