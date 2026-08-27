'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toggleWishlist } from '@/lib/actions';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function WishlistButton({ itemId, initialWishlisted = false }: { itemId: number, initialWishlisted?: boolean }) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if this is inside a Link
    
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);
    // Optimistic update
    setIsWishlisted(!isWishlisted);

    try {
      const result = await toggleWishlist(itemId);
      if (result.error) {
        setIsWishlisted(isWishlisted); // revert on error
      } else {
        setIsWishlisted(result.added || false);
      }
    } catch {
      setIsWishlisted(isWishlisted);
    }
    
    setIsLoading(false);
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md transition-all shadow-sm
        ${isWishlisted ? 'bg-white text-red-500' : 'bg-white/80 text-neutral-500 hover:bg-white hover:text-red-500 hover:scale-110'}
      `}
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );
}
