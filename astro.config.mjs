import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const wranglerToml = readFileSync(new URL('./wrangler.toml', import.meta.url), 'utf8');
const varsBlock = wranglerToml.split(/^\[vars\]\s*$/m)[1]?.split(/\n\[/ )[0] ?? '';

for (const secret of ['RESEND_API_KEY', 'TURNSTILE_SECRET_KEY']) {
  if (new RegExp(`^\\s*${secret}\\s*=`, 'm').test(varsBlock)) {
    throw new Error(
      `${secret} is set in wrangler.toml [vars] and would shadow the Cloudflare dashboard secret. Remove it.`,
    );
  }
}

const siteKeyFromFile = varsBlock.match(/^\s*TURNSTILE_SITE_KEY\s*=\s*"([^"]*)"/m)?.[1] ?? '';
if (!process.env.TURNSTILE_SITE_KEY && siteKeyFromFile) {
  process.env.TURNSTILE_SITE_KEY = siteKeyFromFile;
}

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
