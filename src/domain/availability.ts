export type AvailabilityMode = 'inquiry-only' | 'capacity-aware';
export interface ResourceUnit { id: string; offerId: string; enabled: boolean; }
export interface AllocationBlock {
  id: string;
  resourceId: string;
  startsAt: string;
  endsAt: string;
  source: 'confirmed-allocation' | 'manual-block' | 'maintenance';
}
export interface AvailabilityState {
  mode: AvailabilityMode;
  inventoryKnown: boolean;
  resources: ResourceUnit[];
  blocks: AllocationBlock[];
}
export interface AvailabilityRequest { offerId: string; startsAt: string; endsAt: string; }
export type AvailabilityDecision =
  | { status: 'requires-review'; reason: 'inventory-unknown' | 'inquiry-only-policy' }
  | { status: 'appears-available'; resourceId: string }
  | { status: 'unavailable'; reason: 'no-enabled-capacity' | 'all-capacity-blocked' };
function asMillis(value: string): number {
  const result = Date.parse(value);
  if (!Number.isFinite(result)) throw new Error(`Invalid ISO date/time: ${value}`);
  return result;
}
export function intervalsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const a0 = asMillis(aStart); const a1 = asMillis(aEnd); const b0 = asMillis(bStart); const b1 = asMillis(bEnd);
  if (a1 <= a0 || b1 <= b0) throw new Error('Availability intervals must have positive duration.');
  return a0 < b1 && b0 < a1;
}
export function evaluateAvailability(request: AvailabilityRequest, state: AvailabilityState): AvailabilityDecision {
  const start = asMillis(request.startsAt); const end = asMillis(request.endsAt);
  if (end <= start) throw new Error('Requested availability window must have positive duration.');
  if (!state.inventoryKnown) return { status: 'requires-review', reason: 'inventory-unknown' };
  if (state.mode === 'inquiry-only') return { status: 'requires-review', reason: 'inquiry-only-policy' };
  const candidates = state.resources.filter((resource) => resource.enabled && resource.offerId === request.offerId);
  if (candidates.length === 0) return { status: 'unavailable', reason: 'no-enabled-capacity' };
  for (const resource of candidates) {
    const blocked = state.blocks.some((block) => block.resourceId === resource.id && intervalsOverlap(request.startsAt, request.endsAt, block.startsAt, block.endsAt));
    if (!blocked) return { status: 'appears-available', resourceId: resource.id };
  }
  return { status: 'unavailable', reason: 'all-capacity-blocked' };
}
