export const LOCAL_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
export const LOCAL_INQUIRY_API_URL = 'http://127.0.0.1:8791/api/inquiries';
const TURNSTILE_TEST_SITE_KEYS = new Set([
  LOCAL_TURNSTILE_SITE_KEY,
  '2x00000000000000000000AB',
  '1x00000000000000000000BB',
  '2x00000000000000000000BB',
  '3x00000000000000000000FF',
]);

interface InquiryConfigInput {
  apiUrl?: string;
  siteKey?: string;
  development: boolean;
}

export interface InquiryPublicConfig {
  apiUrl: string;
  siteKey: string;
  configured: boolean;
  apiConnectSource: string;
}

function normalizeApiUrl(value: string, development: boolean): string {
  if (value.startsWith('/') && !value.startsWith('//')) return value;

  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url.toString();
    if (
      development &&
      url.protocol === 'http:' &&
      (url.hostname === '127.0.0.1' || url.hostname === 'localhost')
    ) {
      return url.toString();
    }
  } catch {
    // An invalid endpoint keeps the public form fail-closed.
  }

  return '';
}

function connectSource(apiUrl: string): string {
  if (apiUrl.startsWith('/')) return "'self'";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "'self'";
  }
}

export function resolveInquiryPublicConfig(input: InquiryConfigInput): InquiryPublicConfig {
  const rawApiUrl = input.apiUrl?.trim() || (input.development ? LOCAL_INQUIRY_API_URL : '');
  const requestedSiteKey = input.siteKey?.trim() || '';
  const siteKey = input.development
    ? requestedSiteKey
      ? TURNSTILE_TEST_SITE_KEYS.has(requestedSiteKey)
        ? requestedSiteKey
        : ''
      : LOCAL_TURNSTILE_SITE_KEY
    : requestedSiteKey;
  const apiUrl = rawApiUrl ? normalizeApiUrl(rawApiUrl, input.development) : '';

  return {
    apiUrl,
    siteKey,
    configured: apiUrl.length > 0 && siteKey.length > 0,
    apiConnectSource: connectSource(apiUrl),
  };
}
