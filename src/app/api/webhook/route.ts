import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-07-29.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In dev mode without webhook secret, just trust the payload (DANGEROUS IN PROD)
      console.warn('No Stripe webhook secret found. Bypassing signature verification.');
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`⚠️  Webhook signature verification failed.`, msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId || 'guest';
      const itemsJson = session.metadata?.items_json || '[]';
      const amountTotal = (session.amount_total || 0) / 100;
      const status = 'paid';
      
      try {
        await sql`
          INSERT INTO orders (user_id, stripe_session_id, amount_total, status, items_json)
          VALUES (${userId}, ${session.id}, ${amountTotal}, ${status}, ${itemsJson})
          ON CONFLICT (stripe_session_id) DO NOTHING;
        `;
        console.log(`✅ Order saved for session: ${session.id}`);
      } catch (err) {
        console.error('Error saving order to database:', err);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
