import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resend, fromEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Check authorization header for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find carts that are 'active', have an email, and haven't been updated in 24 hours
    const { rows } = await sql`
      SELECT id, email, items_json FROM carts
      WHERE status = 'active' 
      AND email IS NOT NULL 
      AND updated_at < NOW() - INTERVAL '24 hours'
    `;

    if (rows.length === 0) {
      return NextResponse.json({ status: 'no abandoned carts found' });
    }

    let emailsSent = 0;

    for (const cart of rows) {
      if (!cart.email) continue;
      
      const items = JSON.parse(cart.items_json);
      if (items.length === 0) {
        // Mark empty abandoned carts as ignored
        await sql`UPDATE carts SET status = 'ignored' WHERE id = ${cart.id}`;
        continue;
      }

      // Send the email
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: cart.email,
            subject: 'You left something behind! - Heritage Tales',
            html: `
              <h1>Still thinking about it?</h1>
              <p>We noticed you left some beautiful brassware in your cart.</p>
              <p>These pieces are handcrafted and tend to sell out quickly. Come back and complete your order before they are gone!</p>
              <br/>
              <a href="https://yourdomain.com/" style="padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Return to Checkout</a>
            `
          });
          emailsSent++;
        } catch (e) {
          console.error('Failed to send abandoned cart email to:', cart.email, e);
        }
      } else {
        console.log(`[MOCK CRON] Would send abandoned cart email to ${cart.email}`);
        emailsSent++;
      }

      // Mark cart as abandoned so we don't email them again
      await sql`UPDATE carts SET status = 'abandoned' WHERE id = ${cart.id}`;
    }

    return NextResponse.json({ status: 'success', emailsSent });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
