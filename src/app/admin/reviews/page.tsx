import { getAllReviewsAdmin } from '@/lib/actions';
import AdminReviewsList from '@/components/AdminReviewsList';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsAdmin();

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8 border-b border-neutral-100 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Customer Reviews</h1>
        <p className="text-neutral-500 mt-2">Moderate and manage reviews submitted by your customers.</p>
      </div>
      
      <AdminReviewsList initialReviews={reviews} />
    </div>
  );
}
