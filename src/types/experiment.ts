export type ExperimentStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';

export interface ControlRunMetadata {
  roomStageCompleted: boolean;
  roomBaselineResistanceKohm?: number;
  emptyContainerStageCompleted: boolean;
  emptyContainerBaselineResistanceKohm?: number;
  notes?: string;
}

export interface Experiment {
  id: string; // e.g. "EXP-2026-001"
  name: string;
  description: string;
  createdAt: string; // ISO
  testDate: string; // ISO
  protocolNotes: string;
  plannedDurationMinutes: number;
  actualDurationMinutes?: number;
  status: ExperimentStatus;
  sampleIds: string[];
  controls: ControlRunMetadata;
  updatedAt: string; // ISO
}
