'use client';

import { Review } from '@/lib/db';
import { toggleReviewApproval, deleteReview } from '@/lib/actions';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useTransition } from 'react';

type AdminReview = Review & { item_title: string };

export default function AdminReviewsList({ initialReviews }: { initialReviews: AdminReview[] }) {
  const [isPending, startTransition] = useTransition();

  if (initialReviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
        <p className="text-neutral-500 font-medium">No reviews submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="p-4 font-semibold text-neutral-600 text-sm">Product</th>
              <th className="p-4 font-semibold text-neutral-600 text-sm">Reviewer</th>
              <th className="p-4 font-semibold text-neutral-600 text-sm">Rating</th>
              <th className="p-4 font-semibold text-neutral-600 text-sm">Comment</th>
              <th className="p-4 font-semibold text-neutral-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {initialReviews.map((review) => (
              <tr key={review.id} className={`hover:bg-neutral-50/50 transition-colors ${!review.is_approved ? 'bg-orange-50/30' : ''}`}>
                <td className="p-4">
                  <span className="font-medium text-neutral-900">{review.item_title}</span>
                </td>
                <td className="p-4 text-sm text-neutral-600">
                  {review.user_name}
                </td>
                <td className="p-4">
                  <div className="flex text-[#b5955b]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                </td>
                <td className="p-4 text-sm text-neutral-600 max-w-xs truncate" title={review.comment}>
                  {review.comment || <span className="italic text-neutral-400">No comment</span>}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => startTransition(() => toggleReviewApproval(review.id, review.is_approved))}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center disabled:opacity-50 transition-colors ${
                      review.is_approved 
                        ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {review.is_approved ? (
                      <><XCircle className="w-3.5 h-3.5 mr-1" /> Unapprove</>
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve</>
                    )}
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this review?')) {
                        startTransition(() => deleteReview(review.id));
                      }
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
