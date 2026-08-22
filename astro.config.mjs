import { defineConfig } from 'astro/config';
import { resolvePublicSiteUrl } from './src/lib/seo.ts';

const publicSiteUrl = resolvePublicSiteUrl(process.env.PUBLIC_SITE_URL);

export default defineConfig({
  output: 'static',
  site: publicSiteUrl?.href,
});
