import { getSiteOrigin } from '@/lib/site-origin.mjs';
export default function robots() {
  const origin = getSiteOrigin();
  return { rules: { userAgent: '*', allow: '/' }, ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}) };
}
