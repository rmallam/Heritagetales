'use client';

import { useCartStore } from '@/lib/store';
import { Item } from '@/lib/db';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function AddToCartButton({ item }: { item: Item }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  
  // Need to use item.variants, which might be a string if not parsed properly by Postgres, 
  // but DB returns it as parsed JSON if column is JSONB. Let's assume it's an array.
  const variants = item.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);

  const price = selectedVariant ? selectedVariant.price : item.price;
  const inStock = selectedVariant ? selectedVariant.in_stock : item.in_stock;

  const handleAdd = () => {
    if (!inStock) return;
    addItem(item, selectedVariant?.name, price);
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
            {variants.map((v) => (
              <option key={v.name} value={v.name} disabled={!v.in_stock}>
                {v.name} - ${v.price.toFixed(2)} {!v.in_stock && '(Out of Stock)'}
              </option>
            ))}
          </select>
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
