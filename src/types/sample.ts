export type CakeCategory = 'Normal Cake' | 'Pastry Cake';
export type StorageCondition = 'Unfrozen' | 'Frozen';
export type SampleTestStatus = 'Planned' | 'Testing' | 'Completed' | 'Invalid';

export type CakeCombination =
  | 'Normal Cake — Unfrozen'
  | 'Normal Cake — Frozen'
  | 'Pastry Cake — Unfrozen'
  | 'Pastry Cake — Frozen';

export interface Sample {
  id: string; // e.g. "SMP-001"
  experimentId: string;
  category: CakeCategory;
  storageCondition: StorageCondition;
  replicateNumber: string; // e.g. "Sample 1", "Sample 2"
  testDateTime: string; // ISO
  massGrams?: number;
  notes?: string;
  status: SampleTestStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
