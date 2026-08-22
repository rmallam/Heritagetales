'use client';

import { useCartStore } from '@/lib/store';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear the cart when they hit the success page
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-10 text-center">
        <div className="w-20 h-20 bg-[#f0faeb] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#529330]" />
        </div>
        <h1 className="text-3xl font-bold text-[#222222] font-serif mb-4">Order Confirmed!</h1>
        <p className="text-[#666666] mb-8 leading-relaxed">
          Thank you for your purchase. We are preparing your premium brassware for local pickup/delivery. 
          You will receive an email receipt shortly.
        </p>
        <Link 
          href="/" 
          className="inline-block w-full py-4 bg-[#222222] text-white rounded-full font-bold text-lg hover:bg-[#b5955b] transition-colors shadow-md"
        >
          Return to Store
        </Link>
      </div>
    </div>
  );
}
