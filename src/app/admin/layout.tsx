import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, PlusCircle, Settings, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

  if (!ADMIN_USER_ID || userId !== ADMIN_USER_ID) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-neutral-200 shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center text-sm font-semibold text-neutral-500 hover:text-black mb-8 transition-colors">
            <Store className="w-4 h-4 mr-2" />
            Exit to Storefront
          </Link>
          
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Admin Dashboard</h2>
          <nav className="space-y-2">
            <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors">
              <Package className="w-5 h-5" />
              Orders Manager
            </Link>
            <Link href="/admin/items" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors">
              <PlusCircle className="w-5 h-5" />
              Add Product
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors">
              <Settings className="w-5 h-5" />
              Store Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
