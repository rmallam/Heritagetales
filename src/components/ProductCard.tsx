'use client';

import { useCartStore } from '@/lib/store';
import { Item } from '@/lib/db';

import Link from 'next/link';

export default function ProductCard({ item }: { item: Item }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e5e5e5] flex flex-col transform hover:-translate-y-1">
      <Link href={`/product/${item.id}`} className="aspect-square bg-[#f8f8f8] relative overflow-hidden block">
        {item.image_url ? (
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
          <span className="font-bold text-xl text-[#b5955b]">${item.price.toFixed(2)}</span>
          <button 
            onClick={() => addItem(item)}
            className="px-6 py-2.5 bg-[#222222] text-white text-sm font-semibold rounded-full hover:bg-[#b5955b] transition-colors shadow-md"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
