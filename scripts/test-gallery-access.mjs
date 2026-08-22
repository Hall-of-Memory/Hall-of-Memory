import assert from 'node:assert/strict';
import {
  authorizeGalleryAsset,
  authorizeGalleryGrant,
  generateOpaqueGalleryToken,
  hashOpaqueGalleryToken,
  opaqueGalleryTokenEntropyBytes,
} from '../src/domain/gallery-access.ts';

const tokenA = generateOpaqueGalleryToken();
const tokenB = generateOpaqueGalleryToken();
const now = Date.UTC(2026, 7, 12, 16, 0, 0);

assert.match(tokenA, /^[a-f0-9]{64}$/);
assert.equal(tokenA.length, opaqueGalleryTokenEntropyBytes * 2);
assert.notEqual(tokenA, tokenB);

const hashA = await hashOpaqueGalleryToken(tokenA);
assert.match(hashA, /^[a-f0-9]{64}$/);
assert.equal(hashA, await hashOpaqueGalleryToken(tokenA));
assert.notEqual(hashA, await hashOpaqueGalleryToken(tokenB));
assert.equal(hashA.includes(tokenA), false);
await assert.rejects(() => hashOpaqueGalleryToken('short'), /gallery-token-invalid/);
await assert.rejects(() => hashOpaqueGalleryToken(` ${tokenA}`), /gallery-token-invalid/);

const activeGrant = {
  galleryId: 'event-a',
  tokenHash: hashA,
  expiresAt: now + 60_000,
  revokedAt: null,
};

const access = await authorizeGalleryGrant(tokenA, activeGrant, 'event-a', now);
assert.deepEqual(access, { ok: true, galleryId: 'event-a' });
assert.deepEqual(await authorizeGalleryGrant(tokenB, activeGrant, 'event-a', now), {
  ok: false,
  reason: 'token-mismatch',
});
assert.deepEqual(await authorizeGalleryGrant('short', activeGrant, 'event-a', now), {
  ok: false,
  reason: 'invalid-token',
});
assert.deepEqual(await authorizeGalleryGrant(tokenA, activeGrant, '', now), {
  ok: false,
  reason: 'invalid-scope',
});
assert.deepEqual(await authorizeGalleryGrant(tokenA, activeGrant, 'event-b', now), {
  ok: false,
  reason: 'gallery-mismatch',
});
assert.deepEqual(
  await authorizeGalleryGrant(tokenA, { ...activeGrant, tokenHash: 'broken' }, 'event-a', now),
  { ok: false, reason: 'invalid-grant' },
);
assert.deepEqual(
  await authorizeGalleryGrant(tokenA, { ...activeGrant, galleryId: ' event-a' }, 'event-a', now),
  { ok: false, reason: 'invalid-grant' },
);
assert.deepEqual(
  await authorizeGalleryGrant(tokenA, { ...activeGrant, expiresAt: Number.NaN }, 'event-a', now),
  { ok: false, reason: 'invalid-grant' },
);
assert.deepEqual(
  await authorizeGalleryGrant(tokenA, activeGrant, 'event-a', Number.NaN),
  { ok: false, reason: 'invalid-grant' },
);
assert.deepEqual(
  await authorizeGalleryGrant(tokenA, { ...activeGrant, revokedAt: now - 1 }, 'event-a', now),
  { ok: false, reason: 'revoked' },
);
assert.deepEqual(
  await authorizeGalleryGrant(tokenA, { ...activeGrant, expiresAt: now }, 'event-a', now),
  { ok: false, reason: 'expired' },
);

assert.deepEqual(authorizeGalleryAsset(access, { id: 'asset-a-1', galleryId: 'event-a' }), {
  ok: true,
  galleryId: 'event-a',
  assetId: 'asset-a-1',
});
assert.deepEqual(authorizeGalleryAsset(access, { id: 'asset-b-1', galleryId: 'event-b' }), {
  ok: false,
  reason: 'cross-gallery',
});
assert.deepEqual(authorizeGalleryAsset(access, { id: '', galleryId: 'event-a' }), {
  ok: false,
  reason: 'invalid-asset',
});
assert.deepEqual(
  authorizeGalleryAsset({ ok: false, reason: 'revoked' }, { id: 'asset-a-1', galleryId: 'event-a' }),
  { ok: false, reason: 'not-authorized' },
);

const persistedGrant = JSON.stringify(activeGrant);
assert.equal(persistedGrant.includes(tokenA), false, 'grant persistence must not contain bearer token');
assert.ok(persistedGrant.includes(hashA), 'grant persistence is expected to contain only the token hash');

console.log('gallery-access-domain-ok');
