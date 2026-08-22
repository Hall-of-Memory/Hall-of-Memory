import type { APIRoute } from 'astro';
import siteContent from '../content/site.json';
import { renderRobotsTxt, resolveSeoState } from '../lib/seo';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const launchStatus = siteContent[0]?.launchStatus === 'production' ? 'production' : 'draft';
  const state = resolveSeoState(site?.href, launchStatus);
  return new Response(renderRobotsTxt(state), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
