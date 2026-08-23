'use client';

import { useCartStore } from '@/lib/store';
import { Item } from '@/lib/db';

import Link from 'next/link';

export default function ProductCard({ item, discount = 0 }: { item: Item, discount?: number }) {
  const addItem = useCartStore((state) => state.addItem);

  const finalPrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e5e5e5] flex flex-col transform hover:-translate-y-1">
      <Link href={`/product/${item.id}`} className="aspect-square bg-[#f8f8f8] relative overflow-hidden block">
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow-sm">
            {discount}% OFF
          </div>
        )}
        {item.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
        )}
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/product/${item.id}`}>
          <h4 className="font-bold text-xl text-[#222222] mb-2 font-serif hover:text-[#b5955b] transition-colors">{item.title}</h4>
        </Link>
        <p className="text-sm text-[#666666] line-clamp-2 mb-6 flex-grow leading-relaxed">{item.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <div>
            {discount > 0 ? (
              <div className="flex flex-col">
                <span className="font-bold text-xl text-red-600">${finalPrice.toFixed(2)}</span>
                <span className="text-sm text-neutral-400 line-through">${item.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-bold text-xl text-[#b5955b]">${item.price.toFixed(2)}</span>
            )}
          </div>
          <button 
            disabled={!item.in_stock}
            onClick={() => item.in_stock && addItem(item)}
            className={`px-6 py-2.5 text-white text-sm font-semibold rounded-full transition-colors shadow-md ${!item.in_stock ? 'bg-neutral-400 cursor-not-allowed' : 'bg-[#222222] hover:bg-[#b5955b]'}`}
          >
            {!item.in_stock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
