import { LiveSensorReading } from './serial';
import { IndependentHumanAssessment } from './assessment';

export type CakeCategory = 'Normal cake' | 'Pastry cake';
export type StorageCondition = 'Frozen' | 'Unfrozen';
export type TestStage = 'Room control' | 'Empty-container control' | 'Cake sample';

export type TestStatus =
  | 'Preparing'
  | 'Running'
  | 'Paused'
  | 'Completed'
  | 'Interrupted'
  | 'Invalid'
  | 'completed'
  | 'interrupted'
  | 'testing'
  | 'invalid'
  | 'planned';

export interface InterruptionEvent {
  timestamp: string;
  reason: string;
  type?: string;
  durationSeconds?: number;
}

export interface TestRunConfig {
  sampleId: string;
  cakeCategory: CakeCategory;
  storageCondition: StorageCondition;
  stage: TestStage;
  plannedDurationSeconds: number;
  operatorNotes?: string;
}

export interface TestRun {
  id: string; // e.g. TEST-20261030-001
  sampleId: string;
  cakeCategory: CakeCategory;
  storageCondition: StorageCondition;
  stage: TestStage;
  operatorNotes?: string;
  status: TestStatus;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  startedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  readingsCount: number;
  validReadingsCount: number;
  errorReadingsCount: number;
  interruptionEvents: InterruptionEvent[];
  assessmentToken: string;
  assessmentStatus: 'Pending' | 'Submitted' | 'Expired' | 'pending' | 'submitted' | 'expired';
  assessmentSubmittedAt?: string;
  humanAssessment?: IndependentHumanAssessment | null;
}

export interface MetricSummary {
  min: number;
  max: number;
  mean: number;
  start: number;
  end: number;
  delta: number;
}

export interface TestReport {
  testRun: TestRun;
  readings: LiveSensorReading[];
  temperature: MetricSummary;
  humidity: MetricSummary;
  pressure: MetricSummary;
  gasResistance: MetricSummary & {
    percentChange: number;
  };
  humanAssessment?: IndependentHumanAssessment | null;
  interpretationNotice: string;
}
