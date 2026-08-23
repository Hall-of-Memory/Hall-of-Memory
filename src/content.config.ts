import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.enum(['internal-draft', 'customer-provided']);

const site = defineCollection({
  loader: file('src/content/site.json'),
  schema: z.object({
    id: z.string(),
    name: z.string().min(1),
    eyebrow: z.string().min(1),
    description: z.string().min(1),
    source,
    launchStatus: z.enum(['draft', 'production']),
  }),
});

const offers = defineCollection({
  loader: file('src/content/offers.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    kicker: z.string().min(1),
    description: z.string().min(1),
    moreInfo: z.string().min(1),
    motif: z.enum(['flash', 'mirror', 'editorial']),
    highlights: z.array(z.string().min(1)).min(1),
    sortOrder: z.number().int().nonnegative(),
    source,
  }),
});

const packages = defineCollection({
  loader: file('src/content/packages.json'),
  schema: z.object({
    id: z.string(),
    offerId: z.string().min(1),
    name: z.string().min(1),
    summary: z.string().min(1),
    priceLabel: z.string().nullable(),
    features: z.array(z.string()),
    sortOrder: z.number().int().nonnegative(),
    source,
  }),
});

const benefits = defineCollection({
  loader: file('src/content/benefits.json'),
  schema: z.object({
    id: z.string(),
    title: z.string().min(1),
    text: z.string().min(1),
    sortOrder: z.number().int().nonnegative(),
    source,
  }),
});

const steps = defineCollection({
  loader: file('src/content/steps.json'),
  schema: z.object({
    id: z.string(),
    number: z.string().regex(/^\d{2}$/),
    title: z.string().min(1),
    text: z.string().min(1),
    sortOrder: z.number().int().nonnegative(),
    source,
  }),
});

const faqs = defineCollection({
  loader: file('src/content/faqs.json'),
  schema: z.object({
    id: z.string(),
    question: z.string().min(1),
    answer: z.string().min(1),
    sortOrder: z.number().int().nonnegative(),
    source,
  }),
});

const gallery = defineCollection({
  loader: file('src/content/gallery.json'),
  schema: z.object({
    id: z.string(),
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
    sortOrder: z.number().int().nonnegative(),
    source,
  }),
});

export const collections = { site, offers, packages, benefits, steps, faqs, gallery };
