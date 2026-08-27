import { Item } from '@/lib/db';
import { getRelatedItems, getStoreSettings, getDiscountRules, getUserWishlists } from '@/lib/actions';
import ProductCard from './ProductCard';

export default async function RelatedProducts({ item }: { item: Item }) {
  if (!item.tags || item.tags.length === 0) {
    return null;
  }

  const relatedItems = await getRelatedItems(item.id, item.tags);
  
  if (relatedItems.length === 0) {
    return null;
  }

  const settings = await getStoreSettings();
  const rules = await getDiscountRules();
  const userWishlists = await getUserWishlists();

  return (
    <div className="mt-24 pt-16 border-t border-neutral-200">
      <h2 className="text-3xl font-bold text-neutral-900 font-serif mb-10 text-center">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedItems.map(relatedItem => (
          <ProductCard 
            key={relatedItem.id} 
            item={relatedItem}
            globalDiscount={settings.global_discount}
            isSaleActive={settings.is_sale_active}
            discountRules={rules}
            isWishlisted={userWishlists.includes(relatedItem.id)}
          />
        ))}
      </div>
    </div>
  );
}
