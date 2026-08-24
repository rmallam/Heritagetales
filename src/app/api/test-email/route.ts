import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const to = searchParams.get('to');

    if (!to) {
      return NextResponse.json({ error: 'Please provide a ?to=your_email@example.com parameter' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY environment variable is missing on this server. Did you remember to hit Redeploy in Vercel after adding it?' 
      }, { status: 500 });
    }

    const { resend, fromEmail } = await import('@/lib/resend');
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: 'Test Email from Heritage Tales',
      html: '<h1>It Works!</h1><p>If you are reading this, the Resend integration is perfectly wired up.</p>'
    });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
