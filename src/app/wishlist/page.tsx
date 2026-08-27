import { getWishlistedItems, getStoreSettings, getDiscountRules, getUserWishlists } from '@/lib/actions';
import ProductCard from '@/components/ProductCard';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const items = await getWishlistedItems();
  const settings = await getStoreSettings();
  const rules = await getDiscountRules();
  const userWishlists = await getUserWishlists();

  return (
    <main className="min-h-screen bg-[#fcfcfc] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-[#e5e5e5] pb-6">
          <h1 className="text-4xl font-bold text-[#222222] font-serif">Your Wishlist</h1>
          <p className="text-neutral-500 mt-2">Items you&apos;ve saved for later.</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-[#e5e5e5]">
            <p className="text-[#666666] text-lg mb-4">Your wishlist is currently empty.</p>
            <a href="/" className="inline-block px-8 py-3 bg-[#b5955b] text-white rounded-full font-semibold hover:bg-[#a0824b] transition-colors">
              Explore Collection
            </a>
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
                isWishlisted={userWishlists.includes(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
