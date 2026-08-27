'use client';

import { addBlogPost } from '@/lib/actions';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slugInput = document.getElementById('slug') as HTMLInputElement;
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = generateSlug(e.target.value);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await addBlogPost(formData);
        router.push('/admin/blog');
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to publish post');
      }
    });
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl">
      <Link href="/admin/blog" className="inline-flex items-center text-sm font-semibold text-neutral-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Journal
      </Link>

      <div className="mb-8 border-b border-neutral-100 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Write New Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium">{error}</div>}

        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-neutral-700 mb-2">Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required
              onChange={handleTitleChange}
              placeholder="e.g. The Lost Art of Brass Crafting" 
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-lg font-serif"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-bold text-neutral-700 mb-2">URL Slug</label>
            <div className="flex items-center">
              <span className="text-neutral-400 bg-neutral-50 px-4 py-3 border border-r-0 border-neutral-300 rounded-l-xl">/journal/</span>
              <input 
                type="text" 
                id="slug" 
                name="slug" 
                required
                onChange={(e) => e.target.dataset.manual = 'true'}
                placeholder="the-lost-art" 
                className="w-full px-4 py-3 rounded-r-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-bold text-neutral-700 mb-2">Excerpt (Optional)</label>
            <textarea 
              id="excerpt" 
              name="excerpt" 
              rows={2}
              placeholder="A brief summary for the blog preview card..." 
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label htmlFor="cover_image" className="block text-sm font-bold text-neutral-700 mb-2">Cover Image</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-neutral-400" />
              </div>
              <input 
                type="file" 
                id="cover_image" 
                name="cover_image"
                accept="image/*"
                className="flex-1 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 file:cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-bold text-neutral-700 mb-2">Content (Markdown supported)</label>
            <textarea 
              id="content" 
              name="content" 
              required
              rows={15}
              placeholder="Write your story here..." 
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isPending}
            className="px-8 py-3 bg-black text-white rounded-xl font-bold flex items-center hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-lg"
          >
            {isPending ? 'Publishing...' : <><Save className="w-5 h-5 mr-2" /> Publish Post</>}
          </button>
        </div>
      </form>
    </div>
  );
}
