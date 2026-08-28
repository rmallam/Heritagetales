'use client';

import { useCartStore } from '@/lib/store';
import { Item, DiscountRule } from '@/lib/db';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AddToCartButton({ 
  item, 
  globalDiscount = 0, 
  isSaleActive = false, 
  discountRules = [] 
}: { 
  item: Item, 
  globalDiscount?: number, 
  isSaleActive?: boolean, 
  discountRules?: DiscountRule[] 
}) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  const variants = item.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);

  const price = selectedVariant ? selectedVariant.price : item.price;
  const stockCount = selectedVariant ? selectedVariant.stock_count : item.stock_count;
  const inStock = stockCount > 0;

  // Find if current selection is in cart
  const cartItemId = selectedVariant ? `${item.id}-${selectedVariant.name}` : `${item.id}`;
  const cartItem = cartItems.find((i) => i.cart_item_id === cartItemId);

  // Calculate best discount
  let bestDiscount = isSaleActive ? globalDiscount : 0;
  if (!isSaleActive && item.tags && item.tags.length > 0) {
    const activeRules = discountRules.filter(r => r.is_active);
    for (const tag of item.tags) {
      const match = activeRules.find(r => r.tag.toLowerCase() === tag.toLowerCase());
      if (match && match.discount_percentage > bestDiscount) {
        bestDiscount = match.discount_percentage;
      }
    }
  }
  
  const displayPrice = price * (bestDiscount > 0 ? (100 - bestDiscount) / 100 : 1);

  const handleAdd = () => {
    if (!inStock) return;
    addItem(item, selectedVariant?.name, displayPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {variants.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-900">Select Option</label>
          <select 
            className="w-full text-base border border-neutral-300 rounded-xl bg-white p-4 focus:ring-2 focus:ring-[#b5955b] focus:border-[#b5955b] outline-none transition-all"
            value={selectedVariant?.name || ''}
            onChange={(e) => setSelectedVariant(variants.find(v => v.name === e.target.value) || null)}
          >
            {variants.map((v) => {
              const vPrice = v.price * (bestDiscount > 0 ? (100 - bestDiscount) / 100 : 1);
              return (
                <option key={v.name} value={v.name} disabled={v.stock_count <= 0}>
                  {v.name} - ${vPrice.toFixed(2)} {v.stock_count <= 0 && '(Out of Stock)'}
                </option>
              );
            })}
          </select>
        </div>
      )}
      
      {inStock && stockCount <= 5 && (
        <div className="text-sm font-semibold text-orange-600 flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          Hurry! Only {stockCount} left in stock.
        </div>
      )}
      
      {mounted && cartItem ? (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between border-2 border-[#222222] rounded-full p-2 h-[68px] shadow-sm bg-white">
            <button 
              onClick={() => cartItem.quantity > 1 ? updateQuantity(cartItem.cart_item_id, cartItem.quantity - 1) : removeItem(cartItem.cart_item_id)}
              className="w-12 h-12 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-colors text-[#222222]"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-[#222222] leading-none">{cartItem.quantity}</span>
              <span className="text-[10px] uppercase font-bold text-neutral-500 mt-1 tracking-widest">In Cart</span>
            </div>
            <button 
              onClick={() => cartItem.quantity < stockCount ? updateQuantity(cartItem.cart_item_id, cartItem.quantity + 1) : null}
              disabled={cartItem.quantity >= stockCount}
              className="w-12 h-12 flex items-center justify-center hover:bg-neutral-100 rounded-full transition-colors text-[#222222] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={toggleCart}
            className="w-full py-3 text-sm font-bold text-[#666666] hover:text-[#222222] underline transition-colors"
          >
            View Cart
          </button>
        </div>
      ) : (
        <button 
          disabled={!inStock}
          onClick={handleAdd}
          className={`w-full py-5 rounded-full font-bold text-lg flex justify-center items-center transition-all shadow-md active:scale-[0.98] mt-2 ${
            !inStock ? 'bg-neutral-400 cursor-not-allowed text-white' :
            added 
            ? 'bg-[#529330] text-white hover:bg-[#467d29]' 
            : 'bg-[#222222] text-white hover:bg-[#b5955b]'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mr-3" />
          {!inStock ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      )}
    </div>
  );
}
