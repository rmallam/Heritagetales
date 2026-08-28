import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/lib/store';

// Initialize stripe with a dummy key if env var is missing to avoid crashing during dev
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-07-29.dahlia',
});

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      // In dev mode without a key, just mock the success redirect
      console.warn('No Stripe API key found. Mocking checkout success.');
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      return NextResponse.json({ url: `${origin}/success` });
    }

    const { items, userId, email, shippingCost, postcode }: { items: CartItem[], userId?: string | null, email?: string | null, shippingCost?: number | null, postcode?: string | null } = await request.json();

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const line_items = items.map((item) => {
      let imageUrl = item.image_url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${origin}${imageUrl}`;
      }

      return {
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.title,
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      };
    });

    if (shippingCost && postcode) {
      line_items.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: `Shipping (Postcode: ${postcode})`,
            images: [],
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const { getStoreSettings } = await import('@/lib/actions');
    const settings = await getStoreSettings();

    let discounts = undefined;
    if (settings.is_sale_active && settings.global_discount > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: settings.global_discount,
        duration: 'once',
      });
      discounts = [{ coupon: coupon.id }];
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      metadata: {
        userId: userId || 'guest',
        items_json: JSON.stringify(items.map(i => ({ 
          id: i.id, 
          quantity: i.quantity, 
          price: i.price,
          title: i.title,
          image_url: i.image_url
        }))),
      }
    };

    if (discounts) {
      sessionConfig.discounts = discounts;
    } else {
      sessionConfig.allow_promotion_codes = true;
    }

    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
