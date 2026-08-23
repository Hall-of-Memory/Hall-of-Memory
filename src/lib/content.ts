import { getCollection } from 'astro:content';

export async function loadSiteContent() {
  const [siteEntry] = await getCollection('site');
  if (!siteEntry) {
    throw new Error('Hall of Memory site settings are missing.');
  }

  const byOrder = <T extends { data: { sortOrder: number } }>(a: T, b: T) =>
    a.data.sortOrder - b.data.sortOrder;

  const [offers, packages, benefits, steps, faqs, gallery] = await Promise.all([
    getCollection('offers'),
    getCollection('packages'),
    getCollection('benefits'),
    getCollection('steps'),
    getCollection('faqs'),
    getCollection('gallery'),
  ]);

  return {
    site: siteEntry.data,
    offers: offers.sort(byOrder).map((entry) => entry.data),
    packages: packages.sort(byOrder).map((entry) => entry.data),
    benefits: benefits.sort(byOrder).map((entry) => entry.data),
    steps: steps.sort(byOrder).map((entry) => entry.data),
    faqs: faqs.sort(byOrder).map((entry) => entry.data),
    gallery: gallery.sort(byOrder).map((entry) => entry.data),
  };
}
