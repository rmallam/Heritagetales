'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function Gallery({ images }: { images: string[] }) {
  const [mainImage, setMainImage] = useState(images[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) return (
    <div className="aspect-square bg-[#f8f8f8] flex items-center justify-center rounded-2xl border border-[#e5e5e5]">
      <span className="text-neutral-400">No Image Available</span>
    </div>
  );

  const currentIndex = images.indexOf(mainImage);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMainImage(images[(currentIndex + 1) % images.length]);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMainImage(images[(currentIndex - 1 + images.length) % images.length]);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div 
          className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-4 border border-neutral-200 cursor-zoom-in group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image 
            src={mainImage} 
            alt="Product image" 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
          </div>
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

      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          {images.length > 1 && (
            <button 
              onClick={prevImage}
              className="absolute left-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="relative w-full max-w-5xl h-full max-h-[80vh] mx-16">
            <Image 
              src={mainImage} 
              alt="Enlarged product image" 
              fill
              sizes="100vw"
              className="object-contain" 
            />
          </div>

          {images.length > 1 && (
            <button 
              onClick={nextImage}
              className="absolute right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
