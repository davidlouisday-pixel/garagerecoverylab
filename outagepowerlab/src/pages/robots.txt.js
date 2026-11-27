import { SITE_URL } from '../site.config.mjs';
export const GET = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain' } });
