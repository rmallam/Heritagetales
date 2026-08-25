import { getItems, getStoreSettings, getDiscountRules, getAvailableTags } from '@/lib/actions';
import ProductCard from '@/components/ProductCard';
import StoreFilterBar from '@/components/StoreFilterBar';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { q?: string, tag?: string, sort?: string } }) {
  const items = await getItems(searchParams.q, searchParams.tag, searchParams.sort);
  const settings = await getStoreSettings();
  const rules = await getDiscountRules();
  const availableTags = await getAvailableTags();

  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <section className="relative bg-[#111111] text-[#f8f8f8] py-40 px-6 text-center border-b-[8px] border-[#b5955b] overflow-hidden flex flex-col justify-center items-center min-h-[60vh]">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40 mix-blend-luminosity pointer-events-none"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay gradient for text readability */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-black/20 pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 font-serif tracking-tight drop-shadow-lg">Authentic Heritage</h2>
          <p className="text-lg md:text-xl text-[#e5e5e5] max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            Premium, heavy-duty brassware curated by Heritage Tales. Designed for generations.
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-[#e5e5e5] pb-6 gap-4">
          <h3 className="text-3xl font-bold text-[#222222] font-serif">The Collection</h3>
          <span className="text-[#666666] font-medium tracking-wide uppercase text-sm">{items.length} artifacts</span>
        </div>

        <StoreFilterBar availableTags={availableTags} />

        {items.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-[#e5e5e5]">
            {(searchParams.q || searchParams.tag) ? (
              <p className="text-[#666666] text-lg">No results found. Try clearing your filters!</p>
            ) : (
              <p className="text-[#666666] text-lg">Our collection is currently being curated.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {items.map((item) => (
              <ProductCard 
                key={item.id} 
                item={item} 
                globalDiscount={settings.global_discount} 
                isSaleActive={settings.is_sale_active} 
                discountRules={rules}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
