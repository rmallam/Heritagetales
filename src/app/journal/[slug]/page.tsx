import { getBlogPostBySlug } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Very basic markdown parsing: split by newlines for paragraphs
  const paragraphs = post.content.split(/\n\n+/);

  return (
    <main className="min-h-screen bg-[#fcfcfc] py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/journal" className="inline-flex items-center text-sm font-semibold text-neutral-500 hover:text-black mb-12 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Link>
        
        <header className="mb-12 text-center">
          <p className="text-sm font-bold text-[#b5955b] uppercase tracking-wider mb-4">
            {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 font-serif leading-tight mb-6">
            {post.title}
          </h1>
        </header>

        {post.cover_image && (
          <div className="relative w-full h-80 md:h-96 bg-neutral-100 rounded-2xl overflow-hidden mb-16 shadow-md">
            <Image 
              src={post.cover_image} 
              alt={post.title} 
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              className="object-cover" 
            />
          </div>
        )}

        <article className="prose prose-neutral prose-lg mx-auto">
          {paragraphs.map((p, i) => {
            // Check if it's a heading
            if (p.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold font-serif mt-12 mb-6">{p.replace('# ', '')}</h1>;
            if (p.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold font-serif mt-10 mb-5">{p.replace('## ', '')}</h2>;
            if (p.startsWith('### ')) return <h3 key={i} className="text-xl font-bold font-serif mt-8 mb-4">{p.replace('### ', '')}</h3>;
            
            // Check if it's a blockquote
            if (p.startsWith('> ')) return (
              <blockquote key={i} className="border-l-4 border-[#b5955b] pl-6 my-8 italic text-neutral-700 bg-neutral-50 py-4 pr-4 rounded-r-xl">
                {p.replace('> ', '')}
              </blockquote>
            );

            // Regular paragraph
            return <p key={i} className="text-neutral-700 leading-relaxed mb-6">{p}</p>;
          })}
        </article>

        <div className="mt-20 pt-10 border-t border-neutral-200 text-center">
          <p className="text-neutral-500 italic mb-6">Thank you for reading.</p>
          <Link href="/journal" className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors inline-block">
            Read More Stories
          </Link>
        </div>
      </div>
    </main>
  );
}
