import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://heritagetales.com.au';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/orders', '/profile', '/success'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
