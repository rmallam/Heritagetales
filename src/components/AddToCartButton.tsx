'use client';

import { useCartStore } from '@/lib/store';
import { Item, DiscountRule } from '@/lib/db';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

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
  const [added, setAdded] = useState(false);
  
  const variants = item.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);

  const price = selectedVariant ? selectedVariant.price : item.price;
  const stockCount = selectedVariant ? selectedVariant.stock_count : item.stock_count;
  const inStock = stockCount > 0;

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
      
      <button 
        disabled={!inStock}
        onClick={handleAdd}
        className={`w-full py-5 rounded-full font-bold text-lg flex justify-center items-center transition-all shadow-md active:scale-[0.98] ${
          !inStock ? 'bg-neutral-400 cursor-not-allowed text-white' :
          added 
          ? 'bg-[#529330] text-white hover:bg-[#467d29]' 
          : 'bg-[#222222] text-white hover:bg-[#b5955b]'
        }`}
      >
        <ShoppingBag className="w-5 h-5 mr-3" />
        {!inStock ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}
      </button>
    </div>
  );
}
