import { z } from 'zod';

export const eventTypes = [
  'Hochzeit',
  'Geburtstag',
  'Firmenveranstaltung',
  'Sonstige Veranstaltung',
] as const;

export const inquiryStatuses = ['new', 'contacted', 'quoted', 'closed', 'rejected'] as const;

export const inquiryLimits = {
  offerId: 80,
  packageId: 80,
  location: 180,
  name: 120,
  email: 254,
  phone: 40,
  message: 2000,
  turnstileToken: 4096,
} as const;

// This is the production inquiry allow-list. Demo data remains isolated in src/data/demo.ts.
export const productionInquiryCatalog = [
  { offerId: 'fotobox', packageIds: [] },
  { offerId: 'fotospiegel', packageIds: [] },
  { offerId: 'magazinbox', packageIds: [] },
] as const;

export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year === 0 || month < 1 || month > 12 || day < 1) return false;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

export const inquiryDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isCalendarDate, { message: 'Datum muss ein gültiges Kalenderdatum sein.' });

export const inquirySchema = z.object({
  offerId: z.string().min(1).max(inquiryLimits.offerId),
  packageId: z.string().max(inquiryLimits.packageId).optional(),
  date: inquiryDateSchema,
  eventType: z.enum(eventTypes),
  location: z.string().trim().min(2).max(inquiryLimits.location),
  name: z.string().trim().min(2).max(inquiryLimits.name),
  email: z.string().trim().max(inquiryLimits.email).pipe(z.email()),
  phone: z.string().trim().max(inquiryLimits.phone).optional(),
  message: z.string().trim().max(inquiryLimits.message).optional(),
  privacyConsent: z.literal(true),
});

function normalizeOptionalFields(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value;

  const normalized = { ...value } as Record<string, unknown>;
  for (const field of ['packageId', 'phone', 'message']) {
    if (typeof normalized[field] === 'string' && normalized[field].trim() === '') {
      delete normalized[field];
    }
  }
  return normalized;
}

export const inquirySubmissionSchema = z.preprocess(
  normalizeOptionalFields,
  inquirySchema.extend({ turnstileToken: z.string().min(1).max(inquiryLimits.turnstileToken) }),
);

export const inquiryStatusSchema = z.enum(inquiryStatuses);
export const inquiryStatusUpdateSchema = z.object({ status: inquiryStatusSchema });

export type InquiryDraft = z.infer<typeof inquirySchema>;
export type InquirySubmission = z.input<typeof inquirySubmissionSchema>;
export type ValidatedInquirySubmission = z.output<typeof inquirySubmissionSchema>;
export type InquiryEventType = (typeof eventTypes)[number];
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;

export function parseInquirySubmission(value: unknown) {
  return inquirySubmissionSchema.safeParse(value);
}

export function isKnownProductionOffer(offerId: string): boolean {
  return productionInquiryCatalog.some((entry) => entry.offerId === offerId);
}

export function isKnownProductionPackage(offerId: string, packageId: string): boolean {
  const entry = productionInquiryCatalog.find((candidate) => candidate.offerId === offerId);
  return (entry?.packageIds as readonly string[] | undefined)?.includes(packageId) ?? false;
}
