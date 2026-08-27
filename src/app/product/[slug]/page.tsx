import { getItemBySlug, getItem, getStoreSettings, getDiscountRules, getApprovedReviews } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import AddToCartButton from '@/components/AddToCartButton';
import RelatedProducts from '@/components/RelatedProducts';
import ReviewSection from '@/components/ReviewSection';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let item = await getItemBySlug(params.slug);
  
  // Fallback for old integer IDs or if setup hasn't been run
  if (!item && !isNaN(Number(params.slug))) {
    item = await getItem(Number(params.slug));
  }

  const settings = await getStoreSettings();
  const rules = await getDiscountRules();

  if (!item) {
    notFound();
  }
  
  const reviews = await getApprovedReviews(item.id);

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

  // Calculate best discount
  let bestDiscount = settings.is_sale_active ? settings.global_discount : 0;
  let saleReason = settings.is_sale_active ? 'Sale' : '';

  if (!settings.is_sale_active && item.tags && item.tags.length > 0) {
    const activeRules = rules.filter(r => r.is_active);
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
  const displayPrice = item.price * discountMultiplier;

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[#666666] hover:text-[#222222] mb-12 transition-colors uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collection
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {/* Gallery Side */}
          <div className="w-full relative">
            {isDiscounted && (
              <div className="absolute top-4 left-4 z-10 bg-[#b5955b] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-full shadow-lg">
                {saleReason} -{bestDiscount}%
              </div>
            )}
            <Gallery images={allImages} />
          </div>

          {/* Details Side */}
          <div className="flex flex-col pt-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#222222] font-serif mb-4 leading-tight">{item.title}</h1>
            <div className="mb-8 flex items-end gap-3">
              <span className="text-3xl font-bold text-[#b5955b]">${displayPrice.toFixed(2)} AUD</span>
              {isDiscounted && (
                <span className="text-xl text-neutral-400 line-through mb-1">${item.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="prose prose-neutral mb-10">
              <p className="text-lg text-[#666666] leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>

            <div className="mb-8 p-6 bg-[#f8f8f8] rounded-xl border border-[#e5e5e5]">
              <h3 className="font-semibold text-[#222222] mb-2">Authentic Brassware Guarantee</h3>
              <p className="text-sm text-[#666666]">
                All our items are sourced directly from traditional artisans in India. Weight and dimensions may vary slightly due to the handcrafted nature of these premium artifacts.
              </p>
            </div>

            <AddToCartButton 
              item={item} 
              globalDiscount={settings.global_discount} 
              isSaleActive={settings.is_sale_active} 
              discountRules={rules} 
            />
          </div>
        </div>

        <ReviewSection itemId={item.id} reviews={reviews} />
        <RelatedProducts item={item} />
      </div>
    </div>
  );
}
