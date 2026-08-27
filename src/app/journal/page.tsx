import { getBlogPosts } from '@/lib/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-[#fcfcfc] py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 border-b border-[#e5e5e5] pb-8 text-center">
          <h1 className="text-5xl font-bold text-[#222222] font-serif mb-4">The Journal</h1>
          <p className="text-neutral-500 text-lg">Stories of heritage, craftsmanship, and the artisans behind our brassware.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-[#e5e5e5]">
            <p className="text-[#666666] text-lg mb-4">No stories published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {posts.map(post => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100 flex flex-col">
                {post.cover_image && (
                  <div className="relative h-64 overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-xs font-bold text-[#b5955b] uppercase tracking-wider mb-3">
                    {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="text-2xl font-bold text-neutral-900 font-serif mb-3 group-hover:text-[#b5955b] transition-colors">{post.title}</h2>
                  <p className="text-neutral-600 leading-relaxed mb-6 flex-1">{post.excerpt || post.content.substring(0, 150) + '...'}</p>
                  <span className="text-sm font-semibold text-black uppercase tracking-wider">Read Story &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
