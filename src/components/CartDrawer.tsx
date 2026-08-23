'use client';

import { useCartStore } from '@/lib/store';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@clerk/nextjs';

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { userId } = useAuth();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, userId }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity" 
        onClick={toggleCart}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Your Cart
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-semibold text-neutral-900 line-clamp-1">{item.title}</h3>
                      <p className="text-neutral-500 font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200 rounded-full">
                        <button 
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                          className="p-1 hover:bg-neutral-100 rounded-l-full text-neutral-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-100 rounded-r-full text-neutral-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-sm text-red-600 hover:underline font-medium">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-100 bg-neutral-50">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-neutral-600">Subtotal</span>
              <span className="text-xl font-bold text-neutral-900">${subtotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-4 bg-[#b5955b] hover:bg-[#a3844f] disabled:bg-[#d4c3a3] text-white rounded-full font-bold text-lg shadow-md transition-all active:scale-[0.98] flex justify-center items-center"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout Securely'}
            </button>
            <p className="text-center text-xs text-neutral-400 mt-4">Shipping & taxes calculated at checkout</p>
          </div>
        )}
      </div>
    </>
  );
}
