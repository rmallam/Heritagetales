'use client';

import { useCartStore } from '@/lib/store';
import { Item } from '@/lib/db';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function AddToCartButton({ item }: { item: Item }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd}
      className={`w-full py-5 rounded-full font-bold text-lg flex justify-center items-center transition-all shadow-md active:scale-[0.98] ${
        added 
        ? 'bg-[#529330] text-white hover:bg-[#467d29]' 
        : 'bg-[#222222] text-white hover:bg-[#b5955b]'
      }`}
    >
      <ShoppingBag className="w-5 h-5 mr-3" />
      {added ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  );
}
