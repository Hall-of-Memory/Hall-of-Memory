import { z } from 'astro/zod';

export const eventTypes = [
  'Hochzeit',
  'Geburtstag',
  'Firmenveranstaltung',
  'Sonstige Veranstaltung',
] as const;

export const inquirySchema = z.object({
  offerId: z.string().min(1).max(80),
  packageId: z.string().max(80).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventType: z.enum(eventTypes),
  location: z.string().trim().min(2).max(180),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(254).pipe(z.email()),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  privacyConsent: z.literal(true),
});

export type InquiryDraft = z.infer<typeof inquirySchema>;

export const inquiryLimits = {
  location: 180,
  name: 120,
  email: 254,
  phone: 40,
  message: 2000,
} as const;
