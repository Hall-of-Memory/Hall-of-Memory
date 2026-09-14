export interface PackageBinding {
  id: string;
  offerId: string;
}

export interface ProjectablePackage extends PackageBinding {
  name: string;
  summary: string;
  priceLabel: string | null;
  features: string[];
  sortOrder: number;
}

export interface ProjectableGalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  sortOrder: number;
}

export interface PackageSelectionProjection {
  availableIds: string[];
  selectedPackageId: string;
}

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export function projectPackages(entries: readonly ProjectablePackage[]) {
  return [...entries].sort(bySortOrder).map((item) => ({
    id: item.id,
    offerId: item.offerId,
    name: item.name,
    summary: item.summary,
    priceLabel: item.priceLabel,
    features: [...item.features],
  }));
}

export function projectGallery(entries: readonly ProjectableGalleryItem[]) {
  return [...entries].sort(bySortOrder).map((item) => ({
    id: item.id,
    src: item.src,
    alt: item.alt,
    caption: item.caption,
  }));
}

export function packagesForOffer<T extends PackageBinding>(
  packages: readonly T[],
  offerId: string,
): T[] {
  if (!offerId) return [];
  return packages.filter((item) => item.offerId === offerId);
}

export function reconcilePackageSelection(
  packages: readonly PackageBinding[],
  offerId: string,
  selectedPackageId: string,
): PackageSelectionProjection {
  const availableIds = packagesForOffer(packages, offerId).map(({ id }) => id);
  return {
    availableIds,
    selectedPackageId:
      selectedPackageId && availableIds.includes(selectedPackageId) ? selectedPackageId : '',
  };
}

export function resolveGalleryAssetSrc(src: string, assetBase: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) {
    throw new Error('Gallery assets must use local paths allowed by the site CSP.');
  }

  const normalized = src.replace(/^\/+/, '');
  if (!normalized) {
    throw new Error('Gallery assets must use non-empty local paths without traversal segments.');
  }

  let decoded = normalized;
  for (let pass = 0; pass <= normalized.length; pass += 1) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      throw new Error('Gallery assets must use valid local paths without encoded traversal.');
    }
    if (next === decoded) break;
    decoded = next;
    if (pass === normalized.length) {
      throw new Error('Gallery assets must use bounded local path encoding.');
    }
  }

  if (decoded.split(/[\\/]/).some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Gallery assets must use non-empty local paths without traversal segments.');
  }

  const base = assetBase.endsWith('/') ? assetBase : `${assetBase}/`;
  const origin = 'https://gallery.local';
  const baseUrl = new URL(base, origin);
  if (baseUrl.origin !== origin) {
    throw new Error('Gallery asset base must remain same-origin.');
  }
  for (const candidate of [normalized, decoded]) {
    const candidateUrl = new URL(candidate, baseUrl);
    if (candidateUrl.origin !== baseUrl.origin || !candidateUrl.pathname.startsWith(baseUrl.pathname)) {
      throw new Error('Gallery assets must remain beneath the configured local asset base.');
    }
  }

  return `${base}${normalized}`;
}
