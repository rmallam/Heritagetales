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
            
            // Format Shipping Address nicely
            let formattedAddress = 'N/A';
            if (addressObj && addressObj.address) {
              const { line1, line2, city, state, postal_code, country } = addressObj.address;
              formattedAddress = `
                ${addressObj.name || customer_name}<br/>
                ${line1}<br/>
                ${line2 ? line2 + '<br/>' : ''}
                ${city}, ${state} ${postal_code}<br/>
                ${country}
              `;
            }

            // Format Items nicely using Stripe line items
            let itemsHtml = '';
            try {
              const lineItemsList = await stripe.checkout.sessions.listLineItems(session.id);
              itemsHtml = '<ul>' + lineItemsList.data.map((item) => 
                `<li style="margin-bottom: 8px;"><strong>${item.quantity}x ${item.description}</strong> - $${(item.amount_total / 100).toFixed(2)}</li>`
              ).join('') + '</ul>';
            } catch (err) {
              console.error('Error fetching line items:', err);
              itemsHtml = '<p>Items enclosed in your order.</p>';
            }

            const { data, error } = await resend.emails.send({
              from: fromEmail,
              to: customer_email,
              subject: 'Order Confirmation - Heritage Tales',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
                  <h1 style="color: #b5955b;">Thank you for your order, ${customer_name}!</h1>
                  <p style="font-size: 16px;">Your order <strong>#${orderId}</strong> has been successfully placed.</p>
                  
                  <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 24px 0;">
                    <h3 style="margin-top: 0;">Order Summary</h3>
                    ${itemsHtml}
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
                    <p style="font-size: 18px; margin: 0;"><strong>Total Paid:</strong> $${((session.amount_total || 0) / 100).toFixed(2)}</p>
                  </div>

                  <div style="margin-bottom: 32px;">
                    <h3>Shipping To:</h3>
                    <p style="background-color: #fff; padding: 16px; border: 1px solid #eee; border-radius: 8px;">
                      ${formattedAddress}
                    </p>
                  </div>

                  <p style="font-size: 15px; color: #666;">We are preparing your premium brassware for shipment. You will receive another email with a tracking number once your order has shipped.</p>
                </div>
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

        // Decrement Inventory Stock
        try {
          const parsedItems = JSON.parse(items_json);
          for (const item of parsedItems) {
            if (item.id) {
              await sql`
                UPDATE items 
                SET stock_count = GREATEST(stock_count - ${item.quantity || 1}, 0)
                WHERE id = ${item.id}
              `;
            }
          }
        } catch (e) {
          console.error('Failed to decrement inventory:', e);
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
