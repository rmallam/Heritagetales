'use client';

import { Item, Variant, DiscountRule } from '@/lib/db';
import { useCartStore } from '@/lib/store';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import WishlistButton from './WishlistButton';

export default function ProductCard({ item, globalDiscount = 0, isSaleActive = false, discountRules = [], isWishlisted = false }: { item: Item, globalDiscount?: number, isSaleActive?: boolean, discountRules?: DiscountRule[], isWishlisted?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(item.variants && item.variants.length > 0 ? item.variants[0] : null);

  const price = selectedVariant ? selectedVariant.price : item.price;
  const stockCount = selectedVariant ? selectedVariant.stock_count : item.stock_count;
  const inStock = stockCount > 0;
  
  // Calculate best discount
  let bestDiscount = isSaleActive ? globalDiscount : 0;
  let saleReason = isSaleActive ? 'Sale' : '';

  if (!isSaleActive && item.tags && item.tags.length > 0) {
    const activeRules = discountRules.filter(r => r.is_active);
    for (const tag of item.tags) {
      const match = activeRules.find(r => r.tag.toLowerCase() === tag.toLowerCase());
      if (match && match.discount_percentage > bestDiscount) {
        bestDiscount = match.discount_percentage;
        saleReason = `${match.tag} Sale`;
      }
    }
  }

  const isDiscounted = bestDiscount > 0;
  const discountMultiplier = isDiscounted ? (100 - bestDiscount) / 100 : 1;
  const displayPrice = price * discountMultiplier;

  return (
    <div className="group relative bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        <WishlistButton itemId={item.id} initialWishlisted={isWishlisted} />
        <Link href={`/product/${item.id}`} className="block relative w-full h-full">
          {item.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-neutral-300" />
            </div>
          )}
          {!inStock && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-500 rounded-full">
              Out of Stock
            </div>
          )}
          {inStock && stockCount <= 5 && (
            <div className="absolute top-4 left-4 bg-orange-100/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700 rounded-full">
              Only {stockCount} left!
            </div>
          )}
          {isDiscounted && inStock && (
            <div className="absolute bottom-4 left-4 bg-[#b5955b] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
              {saleReason} -{bestDiscount}%
            </div>
          )}
        </Link>
      </div>
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
                <option key={v.name} value={v.name} disabled={v.stock_count <= 0}>
                  {v.name} {v.stock_count <= 0 && '(Out of Stock)'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-neutral-900">${displayPrice.toFixed(2)}</span>
            {isDiscounted && (
              <span className="text-xs text-neutral-400 line-through">${price.toFixed(2)}</span>
            )}
          </div>
          <button 
            disabled={!inStock}
            onClick={() => inStock && addItem(item, selectedVariant?.name, displayPrice)}
            className={`px-6 py-2.5 text-white text-sm font-semibold rounded-full transition-colors shadow-md ${!inStock ? 'bg-neutral-400 cursor-not-allowed' : 'bg-[#222222] hover:bg-[#b5955b]'}`}
          >
            {!inStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
