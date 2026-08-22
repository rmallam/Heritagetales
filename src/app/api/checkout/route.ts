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

    const { items }: { items: CartItem[] } = await request.json();

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.title,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
      shipping_address_collection: {
        allowed_countries: ['AU'],
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe Checkout Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
