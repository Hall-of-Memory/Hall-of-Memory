export type LaunchStatus = 'draft' | 'production';

export interface SeoState {
  canonicalUrl?: string;
  indexable: boolean;
  siteUrl?: string;
}

interface StructuredOffer {
  description: string;
  slug: string;
  title: string;
}

interface StructuredDataInput {
  canonicalUrl?: string;
  description: string;
  name: string;
  offers: StructuredOffer[];
}

export function resolvePublicSiteUrl(value?: string): URL | undefined {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('PUBLIC_SITE_URL must be an absolute HTTPS origin.');
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('PUBLIC_SITE_URL must be an HTTPS origin without credentials, path, query, or fragment.');
  }

  return new URL(url.origin);
}

export function resolveSeoState(
  publicSiteUrl: string | undefined,
  launchStatus: LaunchStatus,
  pathname = '/',
): SeoState {
  const site = resolvePublicSiteUrl(publicSiteUrl);
  const indexable = launchStatus === 'production' && site !== undefined;
  return {
    indexable,
    siteUrl: site?.href,
    canonicalUrl: indexable ? new URL(pathname, site).href : undefined,
  };
}

export function buildStructuredData(input: StructuredDataInput): Record<string, unknown> {
  const page: Record<string, unknown> = {
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    inLanguage: 'de-DE',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Event-Angebote',
      numberOfItems: input.offers.length,
      itemListElement: input.offers.map((offer, index) => {
        const service: Record<string, unknown> = {
          '@type': 'Service',
          name: offer.title,
          description: offer.description,
        };
        if (input.canonicalUrl) {
          service.url = new URL(`#angebot-${offer.slug}`, input.canonicalUrl).href;
        }
        return { '@type': 'ListItem', position: index + 1, item: service };
      }),
    },
  };

  if (input.canonicalUrl) {
    page['@id'] = input.canonicalUrl;
    page.url = input.canonicalUrl;
  }

  return { '@context': 'https://schema.org', ...page };
}

export function serializeStructuredData(value: Record<string, unknown>): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

export function renderRobotsTxt(state: SeoState): string {
  if (!state.indexable || !state.siteUrl) return 'User-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', state.siteUrl).href}\n`;
}

export function renderSitemapXml(state: SeoState): string {
  const entry = state.indexable && state.canonicalUrl
    ? `<url><loc>${state.canonicalUrl.replaceAll('&', '&amp;')}</loc></url>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entry}</urlset>\n`;
}
