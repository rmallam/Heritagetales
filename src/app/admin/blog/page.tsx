import { getBlogPosts, deleteBlogPost } from '@/lib/actions';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  async function handleDelete(id: number) {
    'use server';
    await deleteBlogPost(id);
    revalidatePath('/admin/blog');
  }

  return (
    <div className="p-6 md:p-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-neutral-100 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Journal</h1>
          <p className="text-neutral-500 mt-2">Manage your brand&apos;s stories and blog posts.</p>
        </div>
        <Link href="/admin/blog/new" className="px-5 py-2.5 bg-black text-white rounded-xl font-semibold flex items-center hover:bg-neutral-800 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Write Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
          <p className="text-neutral-500 font-medium">No posts written yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="p-4 font-semibold text-neutral-600 text-sm">Title</th>
                <th className="p-4 font-semibold text-neutral-600 text-sm">Published</th>
                <th className="p-4 font-semibold text-neutral-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-neutral-900">{post.title}</span>
                    <span className="block text-xs text-neutral-400 mt-0.5">/{post.slug}</span>
                  </td>
                  <td className="p-4 text-sm text-neutral-600">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <form action={async () => { 'use server'; await handleDelete(post.id); }}>
                      <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Post">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
