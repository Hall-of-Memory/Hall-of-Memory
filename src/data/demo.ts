import benefits from '../content/benefits.json';
import faqs from '../content/faqs.json';
import offers from '../content/offers.json';
import packages from '../content/packages.json';
import steps from '../content/steps.json';

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;
type CanonicalPackage = { id: string; name: string; sortOrder: number };

/**
 * Compatibility projection for the existing preview components.
 *
 * The canonical business/content truth lives under src/content and is validated
 * by Astro Content Collections. T046 keeps this module temporarily so the
 * frame-comparison surface can stay byte/behavior stable while the landing page
 * is moved onto the shared content model.
 */
export const demoOffers = [...offers].sort(bySortOrder).map((offer) => ({
  id: offer.id,
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
