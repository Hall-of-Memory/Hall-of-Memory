import type { APIRoute } from 'astro';
import siteContent from '../content/site.json';
import { renderSitemapXml, resolveSeoState } from '../lib/seo';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const launchStatus = siteContent[0]?.launchStatus === 'production' ? 'production' : 'draft';
  const state = resolveSeoState(site?.href, launchStatus);
  return new Response(renderSitemapXml(state), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
