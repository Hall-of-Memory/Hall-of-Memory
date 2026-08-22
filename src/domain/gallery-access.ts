export const opaqueGalleryTokenMinLength = 32;
export const opaqueGalleryTokenMaxLength = 256;
export const opaqueGalleryTokenEntropyBytes = 32;

export interface GalleryAccessGrant {
  galleryId: string;
  tokenHash: string;
  expiresAt?: number | null;
  revokedAt?: number | null;
}

export interface GalleryAssetScope {
  id: string;
  galleryId: string;
}

export type GalleryAccessDecision =
  | { ok: true; galleryId: string }
  | {
      ok: false;
      reason:
        | 'invalid-token'
        | 'invalid-grant'
        | 'invalid-scope'
        | 'revoked'
        | 'expired'
        | 'token-mismatch'
        | 'gallery-mismatch';
    };

export type GalleryAssetDecision =
  | { ok: true; galleryId: string; assetId: string }
  | { ok: false; reason: 'not-authorized' | 'invalid-asset' | 'cross-gallery' };

const tokenPattern = /^[A-Za-z0-9_-]+$/;
const sha256HexPattern = /^[a-f0-9]{64}$/;

function normalizeOpaqueToken(token: string): string | undefined {
  if (
    token.length < opaqueGalleryTokenMinLength ||
    token.length > opaqueGalleryTokenMaxLength ||
    !tokenPattern.test(token)
  ) {
    return undefined;
  }
  return token;
}

function validScopeId(value: string): boolean {
  return value.length > 0 && value.length <= 256 && value.trim() === value;
}

function validOptionalTimestamp(value: number | null | undefined): boolean {
  return value == null || (Number.isFinite(value) && value >= 0);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Generates a 256-bit random opaque bearer token suitable for personal links. */
export function generateOpaqueGalleryToken(): string {
  const bytes = new Uint8Array(opaqueGalleryTokenEntropyBytes);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/** Fixed-length, non-early-exit comparison; JavaScript runtimes do not promise formal constant-time execution. */
function fixedLengthHexEqual(left: string, right: string): boolean {
  if (!sha256HexPattern.test(left) || !sha256HexPattern.test(right)) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

/**
 * Hashes a high-entropy opaque bearer token. This is deliberately not a
 * password/PIN hashing function; a future human-entered code needs its own
 * rate-limited/KDF-backed design before activation.
 */
export async function hashOpaqueGalleryToken(token: string): Promise<string> {
  const normalized = normalizeOpaqueToken(token);
  if (!normalized) throw new Error('gallery-token-invalid');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return bytesToHex(new Uint8Array(digest));
}

export async function authorizeGalleryGrant(
  token: string,
  grant: GalleryAccessGrant,
  requestedGalleryId: string,
  now = Date.now(),
): Promise<GalleryAccessDecision> {
  const normalized = normalizeOpaqueToken(token);
  if (!normalized) return { ok: false, reason: 'invalid-token' };
  if (
    !validScopeId(grant.galleryId) ||
    !sha256HexPattern.test(grant.tokenHash) ||
    !validOptionalTimestamp(grant.expiresAt) ||
    !validOptionalTimestamp(grant.revokedAt) ||
    !Number.isFinite(now) ||
    now < 0
  ) {
    return { ok: false, reason: 'invalid-grant' };
  }
  if (!validScopeId(requestedGalleryId)) return { ok: false, reason: 'invalid-scope' };
  if (grant.revokedAt != null) return { ok: false, reason: 'revoked' };
  if (grant.expiresAt != null && grant.expiresAt <= now) return { ok: false, reason: 'expired' };

  const suppliedHash = await hashOpaqueGalleryToken(normalized);
  if (!fixedLengthHexEqual(suppliedHash, grant.tokenHash)) {
    return { ok: false, reason: 'token-mismatch' };
  }
  if (grant.galleryId !== requestedGalleryId) {
    return { ok: false, reason: 'gallery-mismatch' };
  }
  return { ok: true, galleryId: grant.galleryId };
}

export function authorizeGalleryAsset(
  access: GalleryAccessDecision,
  asset: GalleryAssetScope,
): GalleryAssetDecision {
  if (!access.ok) return { ok: false, reason: 'not-authorized' };
  if (!validScopeId(asset.galleryId) || !asset.id || asset.id.trim() !== asset.id) {
    return { ok: false, reason: 'invalid-asset' };
  }
  if (asset.galleryId !== access.galleryId) return { ok: false, reason: 'cross-gallery' };
  return { ok: true, galleryId: access.galleryId, assetId: asset.id };
}
