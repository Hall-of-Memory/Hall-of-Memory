import benefits from '../content/benefits.json';
import faqs from '../content/faqs.json';
import offers from '../content/offers.json';
import packages from '../content/packages.json';
import site from '../content/site.json';
import steps from '../content/steps.json';
import type { LaunchStatus } from '../lib/seo';

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;
type OfferMotif = 'flash' | 'mirror' | 'editorial';
type CanonicalOffer = {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  description: string;
  moreInfo: string;
  motif: OfferMotif;
  highlights: string[];
  sortOrder: number;
};
type CanonicalPackage = { id: string; name: string; sortOrder: number };
type CanonicalSite = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  source: 'internal-draft' | 'customer-provided';
  launchStatus: LaunchStatus;
};

/**
 * Compatibility projection for the landing component while T046 converges the
 * preview and production routes. All actual text/business truth remains in the
 * Zod-validated src/content files; this module only adapts their shape.
 */
const siteEntry = site[0] as CanonicalSite | undefined;
if (!siteEntry) throw new Error('Hall of Memory site settings are missing.');
export const demoSite: CanonicalSite = siteEntry;

export const demoOffers = [...(offers as CanonicalOffer[])].sort(bySortOrder).map((offer) => ({
  id: offer.id,
  slug: offer.slug,
  title: offer.title,
  kicker: offer.kicker,
  description: offer.description,
  moreInfo: offer.moreInfo,
  motif: offer.motif,
  highlights: offer.highlights,
}));

export const demoPackages = [...(packages as CanonicalPackage[])].sort(bySortOrder).map((item) => ({
  id: item.id,
  name: item.name,
}));

export const demoBenefits = [...benefits].sort(bySortOrder).map((benefit) => ({
  title: benefit.title,
  text: benefit.text,
}));

export const demoSteps = [...steps].sort(bySortOrder).map((step) => ({
  number: step.number,
  title: step.title,
  text: step.text,
}));

export const demoFaqs = [...faqs].sort(bySortOrder).map((faq) => ({
  question: faq.question,
  answer: faq.answer,
}));
