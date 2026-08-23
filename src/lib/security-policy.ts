export const REFERRER_POLICY = 'strict-origin-when-cross-origin';
export const FRAME_ANCESTORS_POLICY = "frame-ancestors 'none'";
export const X_CONTENT_TYPE_OPTIONS = 'nosniff';
export const X_FRAME_OPTIONS = 'DENY';
export const PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), payment=()';

interface DocumentSecurityPolicyInput {
  formActionSource: "'self'" | "'none'";
  apiConnectSource: string;
}

export function buildDocumentSecurityPolicy(input: DocumentSecurityPolicyInput): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `form-action ${input.formActionSource}`,
    "script-src 'self' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' https://challenges.cloudflare.com ${input.apiConnectSource}`,
    "frame-src https://challenges.cloudflare.com",
  ].join('; ');
}
