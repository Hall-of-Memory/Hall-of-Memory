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
  if (/^https?:\/\//i.test(src) || src.startsWith('//')) return src;
  const base = assetBase.endsWith('/') ? assetBase : `${assetBase}/`;
  return `${base}${src.replace(/^\/+/, '')}`;
}
