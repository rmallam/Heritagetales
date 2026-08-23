import { addItem } from '@/lib/actions';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminItemsPage() {
  async function handleSubmit(formData: FormData) {
    'use server';
    await addItem(formData);
    redirect('/'); // Redirect back to storefront after adding
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl">
      <div className="mb-8 border-b border-neutral-100 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Add New Item</h1>
        <p className="text-neutral-500 mt-2">Publish a new brass artifact to your storefront catalog.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-neutral-900 mb-2">Item Title</label>
            <input type="text" id="title" name="title" required className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="e.g. Solid Brass Urli (12 inch)" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-neutral-900 mb-2">Price (AUD)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-neutral-500">$</span>
              <input type="number" id="price" name="price" step="0.01" required className="w-full pl-8 pr-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="85.00" />
            </div>
          </div>
          <div>
            <label htmlFor="image_url" className="block text-sm font-semibold text-neutral-900 mb-2">Primary Image URL</label>
            <input type="url" id="image_url" name="image_url" className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="https://example.com/image.jpg" />
          </div>
          <div>
            <label htmlFor="additional_images" className="block text-sm font-semibold text-neutral-900 mb-2">Additional Images (Comma Separated URLs)</label>
            <textarea id="additional_images" name="additional_images" rows={2} className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none" placeholder="https://img1.jpg, https://img2.jpg"></textarea>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-neutral-900 mb-2">Description</label>
            <textarea id="description" name="description" rows={4} className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none" placeholder="Describe the quality, weight, and usage..."></textarea>
          </div>
          <button type="submit" className="w-full flex items-center justify-center py-4 px-6 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors active:scale-[0.98]">
            <Plus className="w-5 h-5 mr-2" />
            Publish Item
          </button>
        </form>
      </div>
    </div>
  );
}
