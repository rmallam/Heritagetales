import { getItem } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);

  if (!item) {
    notFound();
  }

  // Safely parse additional images
  let allImages = item.image_url ? [item.image_url] : [];
  try {
    const additional = JSON.parse(item.additional_images || '[]');
    if (Array.isArray(additional)) {
      allImages = [...allImages, ...additional];
    }
  } catch (e) {
    console.error("Failed to parse additional images", e);
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[#666666] hover:text-[#222222] mb-12 transition-colors uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collection
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {/* Gallery Side */}
          <div className="w-full">
            <Gallery images={allImages} />
          </div>

          {/* Details Side */}
          <div className="flex flex-col pt-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#222222] font-serif mb-4 leading-tight">{item.title}</h1>
            <span className="text-3xl font-bold text-[#b5955b] mb-8">${item.price.toFixed(2)} AUD</span>
            
            <div className="prose prose-neutral mb-10">
              <p className="text-lg text-[#666666] leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>

            <div className="mb-8 p-6 bg-[#f8f8f8] rounded-xl border border-[#e5e5e5]">
              <h3 className="font-semibold text-[#222222] mb-2">Authentic Brassware Guarantee</h3>
              <p className="text-sm text-[#666666]">
                All our items are sourced directly from traditional artisans in India. Weight and dimensions may vary slightly due to the handcrafted nature of these premium artifacts.
              </p>
            </div>

            <AddToCartButton item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
