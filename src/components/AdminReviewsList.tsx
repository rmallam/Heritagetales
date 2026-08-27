'use client';

import { Review } from '@/lib/db';
import { deleteReview, addReviewResponse } from '@/lib/actions';
import { Star, Trash2, MessageSquareReply } from 'lucide-react';
import { useTransition, useState } from 'react';

type AdminReview = Review & { item_title: string };

export default function AdminReviewsList({ initialReviews }: { initialReviews: AdminReview[] }) {
  const [isPending, startTransition] = useTransition();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  if (initialReviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
        <p className="text-neutral-500 font-medium">No reviews submitted yet.</p>
      </div>
    );
  }

  const handleReplySubmit = (e: React.FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = formData.get('response') as string;
    
    startTransition(async () => {
      await addReviewResponse(id, response);
      setReplyingTo(null);
    });
  };

  return (
    <div className="space-y-4">
      {initialReviews.map((review) => (
        <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-neutral-900">{review.item_title}</h3>
                  <p className="text-sm text-neutral-500">by {review.user_name} on {new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex text-[#b5955b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-neutral-700 leading-relaxed mt-4">
                {review.comment || <span className="italic text-neutral-400">No comment</span>}
              </p>
              
              {review.admin_response ? (
                <div className="mt-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Your Response</p>
                  <p className="text-sm text-neutral-700">{review.admin_response}</p>
                  <button 
                    onClick={() => setReplyingTo(review.id)}
                    className="text-xs text-[#b5955b] font-medium mt-2 hover:underline"
                  >
                    Edit Response
                  </button>
                </div>
              ) : replyingTo !== review.id && (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="mt-4 text-sm font-medium text-[#b5955b] flex items-center hover:underline"
                >
                  <MessageSquareReply className="w-4 h-4 mr-1.5" />
                  Add a public response
                </button>
              )}

              {replyingTo === review.id && (
                <form onSubmit={(e) => handleReplySubmit(e, review.id)} className="mt-4">
                  <textarea 
                    name="response"
                    required
                    defaultValue={review.admin_response || ''}
                    placeholder="Write your response to the customer..."
                    className="w-full text-sm p-3 border border-neutral-200 rounded-xl focus:border-[#b5955b] outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button type="submit" disabled={isPending} className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50">
                      {isPending ? 'Saving...' : 'Save Response'}
                    </button>
                    <button type="button" onClick={() => setReplyingTo(null)} className="px-4 py-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6 flex md:flex-col justify-end gap-2 shrink-0">
              <button
                disabled={isPending}
                onClick={() => {
                  if (confirm('Are you sure you want to delete this review?')) {
                    startTransition(() => deleteReview(review.id));
                  }
                }}
                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
