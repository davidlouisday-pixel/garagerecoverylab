import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://garagerecoverylab.com',
  trailingSlash: 'always',
  // /links/ is the Instagram bio page: noindex, so it stays out of the sitemap too.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/links/') })],
});
