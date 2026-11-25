import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://garagerecoverylab.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
