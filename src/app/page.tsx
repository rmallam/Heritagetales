import { getItems } from '@/lib/actions';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const items = await getItems();

  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      {/* Hero Section */}
      <section className="bg-[#111111] text-[#f8f8f8] py-32 px-6 text-center border-b-[8px] border-[#b5955b]">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 font-serif tracking-tight">Authentic Heritage</h2>
        <p className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl mx-auto font-light leading-relaxed">
          Premium, heavy-duty brassware curated by Heritage Tales. Designed for generations.
        </p>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12 border-b border-[#e5e5e5] pb-6">
          <h3 className="text-3xl font-bold text-[#222222] font-serif">The Collection</h3>
          <span className="text-[#666666] font-medium tracking-wide uppercase text-sm">{items.length} artifacts</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-[#e5e5e5]">
            <p className="text-[#666666] text-lg">Our collection is currently being curated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
