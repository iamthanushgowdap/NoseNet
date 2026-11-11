// Real-time synchronization layer for NoseNet (BroadcastChannel for 0ms local tabs + Supabase DB)

export type ChamberMaterialType =
  | 'cake'
  | 'dry_tissue'
  | 'dry_sponge'
  | 'wet_tissue'
  | 'wet_sponge';

export interface MaterialGuideInfo {
  id: ChamberMaterialType;
  label: string;
  shortLabel: string;
  recommendedVerdict: 'Fresh' | 'Fairly Fresh' | 'Stale' | 'Spoiled';
  alternateVerdict?: 'Fresh' | 'Fairly Fresh' | 'Stale' | 'Spoiled';
  assessorHint: string;
  expectedPhysics: string;
}

export const MATERIAL_GUIDE: Record<ChamberMaterialType, MaterialGuideInfo> = {
  cake: {
    id: 'cake',
    label: 'Cake Specimen',
    shortLabel: 'Cake',
    recommendedVerdict: 'Fresh',
    assessorHint: 'Standard bakery freshness grading (Fresh: +10%..-5% | Fairly Fresh: -5%..-15% | Stale: -15%..-35% | Spoiled: < -35%).',
    expectedPhysics: 'Volatile alcohols, acetic acid, and diacetyl concentration drives MOX R_gas drop.',
  },
  dry_tissue: {
    id: 'dry_tissue',
    label: 'Dry Tissue (Normal)',
    shortLabel: 'Dry Tissue',
    recommendedVerdict: 'Fresh',
    assessorHint: 'Inert dry cellulose (RH flat, R_gas steady near R₀). Tap Fresh (Grade A).',
    expectedPhysics: 'Minimal moisture and zero fermentation volatiles; sensor remains at clean O₂ baseline equilibrium.',
  },
  dry_sponge: {
    id: 'dry_sponge',
    label: 'Dry Sponge',
    shortLabel: 'Dry Sponge',
    recommendedVerdict: 'Fairly Fresh',
    alternateVerdict: 'Fresh',
    assessorHint: 'Dry porous foam: RH stays flat. Tap Fairly Fresh (if slight foam odor) or Fresh (if completely odorless).',
    expectedPhysics: 'Dry non-food matrix with negligible microbial decay; possible minor polymer baseline offset.',
  },
  wet_tissue: {
    id: 'wet_tissue',
    label: 'Wet Tissue',
    shortLabel: 'Wet Tissue',
    recommendedVerdict: 'Stale',
    alternateVerdict: 'Spoiled',
    assessorHint: 'Plain water wet tissue (RH spikes +10–25%, moderate R_gas drop) → Tap Stale. Alcohol/scented wipe (R_gas plunges) → Tap Spoiled.',
    expectedPhysics: 'Water vapor (H₂O) forms OH⁻ on SnO₂ reducing raw R_gas alongside steep RH rise; ethanol wipes saturate VOC response.',
  },
  wet_sponge: {
    id: 'wet_sponge',
    label: 'Wet Sponge',
    shortLabel: 'Wet Sponge',
    recommendedVerdict: 'Stale',
    alternateVerdict: 'Spoiled',
    assessorHint: 'High evaporative moisture load saturates chamber RH quickly → Tap Stale (clean water) or Spoiled (strong R_gas plunge / detergent).',
    expectedPhysics: 'Rapid chamber humidity saturation depresses MOX resistance via moisture adsorption on the 320°C SnO₂ surface.',
  },
};

export function encodeAssessorMeta(
  assessorLabel: string,
  material: ChamberMaterialType,
  durationSeconds: number
): string {
  const safeLabel = (assessorLabel || 'Phone Assessor').replace(/\|/g, '').slice(0, 40);
  return `${safeLabel}|m:${material}|d:${Math.max(1, Math.round(durationSeconds))}`;
}

export function decodeAssessorMeta(raw: string | null | undefined): {
  label: string;
  material: ChamberMaterialType;
  durationSeconds: number | null;
} {
  if (!raw) return { label: 'Phone Assessor', material: 'cake', durationSeconds: null };
  const matMatch = raw.match(/\|m:([a-z_]+)/);
  const durMatch = raw.match(/\|d:(\d+)/);
  const label = raw.split('|')[0] || 'Phone Assessor';
  const matCandidate = matMatch?.[1] as ChamberMaterialType | undefined;
  const material: ChamberMaterialType =
    matCandidate && matCandidate in MATERIAL_GUIDE ? matCandidate : 'cake';
  const durationSeconds = durMatch ? Number(durMatch[1]) : null;
  return { label, material, durationSeconds };
}

export interface LiveSyncEvent {
  type:
    | 'CAKE_SELECTED'
    | 'TEST_STARTING'
    | 'TEST_RUNNING'
    | 'VERDICT_SUBMITTED'
    | 'TEST_STOPPED'
    | 'TEST_RESET'
    | 'TRY_AGAIN';
  cakeType?: string | null;
  testId?: string | null;
  verdict?: 'Fresh' | 'Fairly Fresh' | 'Stale' | 'Spoiled' | 'Not Fresh' | null;
  score?: number | null;
  durationSeconds?: number | null;
  startedAt?: string | null;
  timestamp?: string;
  assessorName?: string | null;
  materialType?: ChamberMaterialType | null;
}

// 1. Broadcast an event to all connected tabs/windows via BroadcastChannel
export function broadcastLiveSync(event: LiveSyncEvent): void {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // Channel: BroadcastChannel (Instant 0ms multi-tab sync)
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('nosenet_live_channel');
      bc.postMessage(payload);
      bc.close();
    } catch {}
  }
}
