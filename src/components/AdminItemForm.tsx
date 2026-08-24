'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { addItem } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function AdminItemForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variants, setVariants] = useState<{ name: string, price: number, stock_count: number }[]>([]);

  const addVariant = () => {
    setVariants([...variants, { name: '', price: 0, stock_count: 10 }]);
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append('variants_json', JSON.stringify(variants));
    
    try {
      await addItem(formData);
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-neutral-900 mb-2">Item Title</label>
        <input type="text" id="title" name="title" required className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="e.g. Solid Brass Urli" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-neutral-900 mb-2">Base Price (AUD)</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-neutral-500">$</span>
            <input type="number" id="price" name="price" step="0.01" required className="w-full pl-8 pr-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="85.00" />
          </div>
        </div>
        <div>
          <label htmlFor="stock_count" className="block text-sm font-semibold text-neutral-900 mb-2">Base Stock Quantity</label>
          <input type="number" id="stock_count" name="stock_count" required defaultValue="10" min="0" className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
        </div>
      </div>
      <div>
        <label htmlFor="image_file" className="block text-sm font-semibold text-neutral-900 mb-2">Primary Image (Upload File)</label>
        <input type="file" id="image_file" name="image_file" accept="image/*" className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all bg-white" />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-semibold text-neutral-900 mb-2">Tags (comma separated)</label>
        <input type="text" id="tags" name="tags" className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="e.g. Urli, Decor, Gift" />
        <p className="text-xs text-neutral-500 mt-2">These tags are used for automatic discounts.</p>
      </div>
      
      {/* Variants Section */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-neutral-900">Product Variants (Optional)</label>
          <button type="button" onClick={addVariant} className="text-sm font-bold text-[#b5955b] hover:text-[#a3844f] flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add Variant
          </button>
        </div>
        {variants.length > 0 && (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-neutral-200">
                <input 
                  type="text" 
                  placeholder="Name (e.g. Small)" 
                  value={v.name} 
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded focus:border-black outline-none text-sm"
                  required
                />
                <div className="relative w-24">
                  <span className="absolute left-3 top-2 text-neutral-500 text-sm">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={v.price} 
                    onChange={(e) => updateVariant(i, 'price', parseFloat(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 border border-neutral-300 rounded focus:border-black outline-none text-sm"
                    required
                  />
                </div>
                <div className="relative w-24">
                  <input 
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={v.stock_count} 
                    onChange={(e) => updateVariant(i, 'stock_count', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-black outline-none text-sm"
                    required
                  />
                </div>
                <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <p className="text-xs text-neutral-500 mt-2">Note: If variants are added, the base price and stock above are ignored on the product card.</p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-neutral-900 mb-2">Description</label>
        <textarea id="description" name="description" rows={4} className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none" placeholder="Describe the quality, weight, and usage..."></textarea>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center py-4 px-6 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors active:scale-[0.98]">
        {isSubmitting ? 'Publishing...' : <><Plus className="w-5 h-5 mr-2" /> Publish Item</>}
      </button>
    </form>
  );
}
