'use client';

import { useCartStore } from '@/lib/store';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { syncCart } from '@/lib/actions';

export default function CartDrawer({ storeSettings }: { storeSettings?: { is_sale_active: boolean, global_discount: number } }) {
  const { items, isOpen, toggleCart, removeItem, updateQuantity } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [postcode, setPostcode] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const { userId } = useAuth();
  const { user } = useUser();
  
  const email = user?.primaryEmailAddress?.emailAddress || null;

  // Sync cart to database when items change, if we have an email/userId
  useEffect(() => {
    if (userId || email) {
      const itemsJson = JSON.stringify(items);
      syncCart(userId || null, email, itemsJson).catch(console.error);
    }
  }, [items, userId, email]);

  useEffect(() => {
    if (postcode.length >= 4) {
      const code = parseInt(postcode, 10);
      if (!isNaN(code)) {
        if (code >= 3000 && code <= 3207) {
          setShippingCost(10); // Melbourne Metro
        } else if (code >= 3208 && code <= 3999) {
          setShippingCost(15); // VIC Regional
        } else {
          setShippingCost(25); // Rest of Australia
        }
      } else {
        setShippingCost(null);
      }
    } else {
      setShippingCost(null);
    }
  }, [postcode]);

  // Reset auth prompt if drawer closes or user logs in
  useEffect(() => {
    if (!isOpen || userId) {
      setShowAuthPrompt(false);
    }
  }, [isOpen, userId]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isSaleActive = storeSettings?.is_sale_active && storeSettings.global_discount > 0;
  const discountMultiplier = isSaleActive ? (100 - storeSettings.global_discount) / 100 : 1;
  const discountedSubtotal = subtotal * discountMultiplier;
  const finalTotal = discountedSubtotal + (shippingCost || 0);

  const handleCheckoutClick = () => {
    if (!userId && !showAuthPrompt) {
      setShowAuthPrompt(true);
    } else {
      handleCheckout();
    }
  };

  const handleCheckout = async () => {
    if (!shippingCost && postcode.length < 4) {
      alert("Please enter a valid postcode to calculate shipping.");
      return;
    }
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, userId, email, shippingCost, postcode }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity" 
        onClick={toggleCart}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Your Cart
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {showAuthPrompt ? (
          <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
            <h3 className="text-2xl font-bold mb-3 font-serif">Almost there!</h3>
            <p className="text-neutral-500 mb-8">Create an account to track your orders, or continue checking out as a guest.</p>
            <SignInButton mode="modal">
              <button className="w-full py-3 mb-4 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors">
                Sign In / Register
              </button>
            </SignInButton>
            <button 
              onClick={handleCheckout} 
              disabled={isCheckingOut}
              className="w-full py-3 border border-neutral-300 text-neutral-700 rounded-full font-bold hover:bg-neutral-50 transition-colors"
            >
              {isCheckingOut ? 'Processing...' : 'Continue as Guest'}
            </button>
            <button onClick={() => setShowAuthPrompt(false)} className="mt-8 text-sm text-neutral-400 hover:text-neutral-700 underline underline-offset-4 transition-colors">
              Back to Cart
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => {
                    const discountedPrice = item.price * discountMultiplier;
                    return (
                      <div key={item.cart_item_id} className="flex gap-4">
                        <div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="font-semibold text-neutral-900 line-clamp-1">
                              {item.title}
                              {item.variant_name && <span className="text-neutral-500 font-normal ml-1">({item.variant_name})</span>}
                            </h3>
                            <div className="flex items-center gap-2">
                              <p className="text-neutral-900 font-medium">${discountedPrice.toFixed(2)}</p>
                              {isSaleActive && (
                                <p className="text-neutral-400 text-sm line-through">${item.price.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-neutral-200 rounded-full">
                              <button 
                                onClick={() => item.quantity > 1 ? updateQuantity(item.cart_item_id, item.quantity - 1) : removeItem(item.cart_item_id)}
                                className="p-1 hover:bg-neutral-100 rounded-l-full text-neutral-600"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                className="p-1 hover:bg-neutral-100 rounded-r-full text-neutral-600"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.cart_item_id)} className="text-sm text-red-600 hover:underline font-medium">Remove</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-4">
                
                {/* Shipping Calculator */}
                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <label htmlFor="postcode" className="block text-sm font-semibold text-neutral-700 mb-2">Estimate Shipping</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="postcode"
                      placeholder="Enter Postcode (e.g. 3000)"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-[#b5955b] outline-none text-sm"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    />
                  </div>
                  {shippingCost !== null && (
                    <p className="text-sm text-green-700 mt-2 font-medium">
                      Shipping to {postcode}: ${shippingCost.toFixed(2)}
                    </p>
                  )}
                </div>

                {isSaleActive && (
                  <div className="flex justify-between items-center text-sm text-neutral-500">
                    <span>Original Subtotal</span>
                    <span className="line-through">${subtotal.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-neutral-600">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-medium">${discountedSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-neutral-600 border-b border-neutral-200 pb-4">
                  <span className="font-semibold">Shipping</span>
                  <span className="font-medium">{shippingCost !== null ? `$${shippingCost.toFixed(2)}` : '---'}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-neutral-800 text-lg">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-neutral-900">${finalTotal.toFixed(2)}</span>
                    {isSaleActive && (
                      <span className="block text-xs font-bold text-green-600 mt-1 uppercase tracking-wider">
                        {storeSettings.global_discount}% Off Applied!
                      </span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckoutClick}
                  disabled={isCheckingOut || shippingCost === null}
                  className="w-full py-4 bg-[#222222] hover:bg-[#111111] disabled:bg-[#a3a3a3] text-white rounded-full font-bold text-lg shadow-md transition-all active:scale-[0.98] flex justify-center items-center mt-4"
                >
                  {isCheckingOut ? 'Processing...' : 'Checkout Securely'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
