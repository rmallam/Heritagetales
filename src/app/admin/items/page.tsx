import { getAllAdminItems } from '@/lib/actions';
import AdminItemsList from '@/components/AdminItemsList';
import AdminItemForm from '@/components/AdminItemForm';

export const dynamic = 'force-dynamic';

export default async function AdminItemsPage() {
  const items = await getAllAdminItems();

  return (
    <div className="p-6 md:p-12 max-w-3xl">
      <div className="mb-8 border-b border-neutral-100 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Add New Item</h1>
        <p className="text-neutral-500 mt-2">Publish a new brass artifact to your storefront catalog.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <AdminItemForm />
      </div>

      <div className="mt-16 mb-8 border-b border-neutral-100 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Manage Inventory</h2>
          <p className="text-neutral-500 mt-2">Update stock, upload new photos, or archive products.</p>
        </div>
      </div>

      <AdminItemsList items={items} />
    </div>
  );
}
