'use client';

import { Review } from '@/lib/db';
import { addReview } from '@/lib/actions';
import { Star, UserCircle2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useState, useTransition } from 'react';

export default function ReviewSection({ itemId, reviews }: { itemId: number, reviews: Review[] }) {
  const { isSignedIn } = useAuth();
  const [rating, setRating] = useState(5);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('item_id', itemId.toString());
    formData.append('rating', rating.toString());

    startTransition(async () => {
      try {
        const result = await addReview(formData);
        if (result.error) {
          setError(result.error);
        } else {
          setSubmitted(true);
          (e.target as HTMLFormElement).reset();
          setRating(5);
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="mt-24 pt-16 border-t border-neutral-200" id="reviews">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Reviews List */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-neutral-900 font-serif mb-8">Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <p className="text-neutral-500 italic">No reviews yet. Be the first to review this artifact!</p>
          ) : (
            <div className="space-y-8">
              {reviews.map(review => (
                <div key={review.id} className="pb-8 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="w-10 h-10 text-neutral-300" />
                      <div>
                        <p className="font-bold text-neutral-900">{review.user_name}</p>
                        <p className="text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-[#b5955b]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-neutral-600 leading-relaxed pl-13">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a Review Form */}
        <div className="md:w-1/3">
          <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200 sticky top-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Write a Review</h3>
            
            {!isSignedIn ? (
              <div className="text-center">
                <p className="text-neutral-500 mb-4 text-sm">You must be logged in to leave a review.</p>
                <a href="/sign-in" className="inline-block px-6 py-2 bg-black text-white rounded-lg font-semibold w-full">
                  Sign In
                </a>
              </div>
            ) : submitted ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
                <p className="font-bold mb-1">Thank You!</p>
                <p className="text-sm">Your review has been submitted and is pending approval.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs underline font-semibold">Write another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 focus:outline-none transition-transform hover:scale-110 ${star <= rating ? 'text-[#b5955b]' : 'text-neutral-300'}`}
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="user_name" className="block text-sm font-semibold text-neutral-900 mb-2">Display Name</label>
                  <input type="text" id="user_name" name="user_name" required placeholder="John D." className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black outline-none bg-white" />
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-semibold text-neutral-900 mb-2">Review (Optional)</label>
                  <textarea id="comment" name="comment" rows={4} placeholder="What did you think about this piece?" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black outline-none bg-white resize-none"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
