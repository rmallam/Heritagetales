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
      const metadata = session.metadata || {};
      const items_json = metadata.items_json || '[]';
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = session as any;
      const addressObj = s.shipping_details || s.shipping || s.customer_details;
      const shipping_address = addressObj ? JSON.stringify(addressObj) : null;
      
      const customer_email = session.customer_details?.email || metadata.customer_email || 'unknown@example.com';
      const customer_name = session.customer_details?.name || 'Customer';

      try {
        // Insert order into DB
        const { rows } = await sql`
          INSERT INTO orders (user_id, stripe_session_id, customer_email, amount_total, status, shipping_address, items_json)
          VALUES (
            ${userId},
            ${session.id},
            ${customer_email},
            ${(session.amount_total || 0) / 100},
            'paid',
            ${shipping_address},
            ${items_json}
          ) RETURNING id
        `;
        
        const orderId = rows[0]?.id;

        // Send Order Confirmation Email
        try {
          const { resend, fromEmail } = await import('@/lib/resend');
          if (process.env.RESEND_API_KEY) {
            const { data, error } = await resend.emails.send({
              from: fromEmail,
              to: customer_email,
              subject: 'Order Confirmation - Heritage Tales',
              html: `
                <h1>Thank you for your order, ${customer_name}!</h1>
                <p>Your order #${orderId} has been successfully placed.</p>
                <p>We are preparing your premium brassware for shipment. You will receive another email once your order has shipped.</p>
                <br/>
                <p><strong>Total:</strong> $${((session.amount_total || 0) / 100).toFixed(2)}</p>
                <p><strong>Shipping to:</strong><br/>${shipping_address ? shipping_address.replace(/\\n/g, '<br/>') : 'N/A'}</p>
              `
            });
            if (error) {
              console.error('Resend API Error during Order Confirmation:', error);
            } else {
              console.log('Order confirmation email sent to:', customer_email, 'ID:', data?.id);
            }
          } else {
            console.log('[MOCK] Order confirmation email would be sent here, missing API KEY.');
          }
        } catch (e) {
          console.error('Failed to send order confirmation email:', e);
        }

        // Mark the associated cart as converted
        try {
          await sql`
            UPDATE carts SET status = 'converted', updated_at = CURRENT_TIMESTAMP
            WHERE email = ${customer_email} AND status = 'active'
          `;
        } catch (e) {
          console.error('Failed to update cart status:', e);
        }

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
