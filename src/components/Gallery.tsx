'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Gallery({ images }: { images: string[] }) {
  const [mainImage, setMainImage] = useState(images[0]);

  if (!images || images.length === 0) return (
    <div className="aspect-square bg-[#f8f8f8] flex items-center justify-center rounded-2xl border border-[#e5e5e5]">
      <span className="text-neutral-400">No Image Available</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-4 border border-neutral-200">
        <Image 
          src={mainImage} 
          alt="Product image" 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300" 
        />
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setMainImage(img)}
              className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img ? 'border-[#b5955b] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <Image 
                src={img} 
                fill
                sizes="100px"
                className="object-cover" 
                alt={`Thumbnail ${idx + 1}`} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
