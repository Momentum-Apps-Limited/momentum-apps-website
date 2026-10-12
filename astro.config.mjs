import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://momentum-apps.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'preserve',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thanks') && !page.includes('/form-error'),
    }),
  ],
});
