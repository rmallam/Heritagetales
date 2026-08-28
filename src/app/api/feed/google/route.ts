import { NextResponse } from 'next/server';
import { getItems } from '@/lib/actions';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://heritagetales.com.au';

  try {
    const items = await getItems();

    const itemsXml = items.map((item) => {
      const productUrl = `${baseUrl}/product/${item.slug || item.id}`;
      const imageUrl = item.image_url.startsWith('http') 
        ? item.image_url 
        : `${baseUrl}${item.image_url}`;
      
      const availability = item.stock_count > 0 ? 'in stock' : 'out of stock';
      const cleanDescription = (item.description || item.title || '').replace(/[\r\n]+/g, ' ').trim();

      return `
    <item>
      <g:id>${item.id}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(cleanDescription)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:brand>Heritage Tales</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${item.price.toFixed(2)} AUD</g:price>
      <g:google_product_category>Home &amp; Garden &gt; Decor</g:google_product_category>
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Heritage Tales Products</title>
    <link>${baseUrl}</link>
    <description>Authentic Handcrafted Brassware &amp; Heritage Decor</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate Google Merchant feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
