'use client';

import { Item, Variant } from '@/lib/db';
import { useCartStore } from '@/lib/store';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ item, globalDiscount = 0, isSaleActive = false }: { item: Item, globalDiscount?: number, isSaleActive?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(item.variants && item.variants.length > 0 ? item.variants[0] : null);

  const price = selectedVariant ? selectedVariant.price : item.price;
  const inStock = selectedVariant ? selectedVariant.in_stock : item.in_stock;
  
  const discountMultiplier = isSaleActive ? (100 - globalDiscount) / 100 : 1;
  const displayPrice = price * discountMultiplier;

  return (
    <div className="group relative bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      <Link href={`/product/${item.id}`} className="block relative aspect-square bg-neutral-100 overflow-hidden">
        {item.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-neutral-300" />
          </div>
        )}
        {!inStock && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-500 rounded-full">
            Out of Stock
          </div>
        )}
        {isSaleActive && inStock && (
          <div className="absolute top-4 left-4 bg-[#b5955b] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
            Sale -{globalDiscount}%
          </div>
        )}
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4 flex-1">
          <Link href={`/product/${item.id}`}>
            <h3 className="font-bold text-lg text-neutral-900 group-hover:text-[#b5955b] transition-colors line-clamp-1">{item.title}</h3>
          </Link>
          <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{item.description}</p>
        </div>
        
        {item.variants && item.variants.length > 0 && (
          <div className="mb-4">
            <select 
              className="w-full text-sm border-neutral-200 rounded-lg bg-neutral-50 p-2 focus:ring-[#b5955b] focus:border-[#b5955b]"
              value={selectedVariant?.name || ''}
              onChange={(e) => setSelectedVariant(item.variants.find(v => v.name === e.target.value) || null)}
            >
              {item.variants.map((v) => (
                <option key={v.name} value={v.name} disabled={!v.in_stock}>
                  {v.name} {!v.in_stock && '(Out of Stock)'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-neutral-900">${displayPrice.toFixed(2)}</span>
            {isSaleActive && (
              <span className="text-xs text-neutral-400 line-through">${price.toFixed(2)}</span>
            )}
          </div>
          <button 
            disabled={!inStock}
            onClick={() => inStock && addItem(item, selectedVariant?.name, price)}
            className={`px-6 py-2.5 text-white text-sm font-semibold rounded-full transition-colors shadow-md ${!inStock ? 'bg-neutral-400 cursor-not-allowed' : 'bg-[#222222] hover:bg-[#b5955b]'}`}
          >
            {!inStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
