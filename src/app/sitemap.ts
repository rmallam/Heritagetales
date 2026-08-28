import { MetadataRoute } from 'next';
import { getItems, getBlogPosts } from '@/lib/actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://heritagetales.com.au';

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const items = await getItems();
    const productRoutes: MetadataRoute.Sitemap = items.map((item) => ({
      url: `${baseUrl}/product/${item.slug || item.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    const posts = await getBlogPosts();
    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/journal/${post.slug}`,
      lastModified: new Date(post.created_at || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Failed to generate sitemap dynamically:', error);
    return staticRoutes;
  }
}
