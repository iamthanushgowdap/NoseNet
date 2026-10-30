import { CakeCategory, StorageCondition } from './test-run';

export type VisualCondition = 'Normal' | 'Changed' | 'Unsure' | 'normal' | 'changed' | 'unsure';
export type SmellCondition = 'Normal' | 'Changed' | 'Unsure' | 'normal' | 'changed' | 'unsure';
export type HumanVerdict =
  | 'Appears normal'
  | 'Possible change'
  | 'Cannot determine'
  | 'appears_normal'
  | 'possible_change'
  | 'cannot_determine';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High' | 'low' | 'medium' | 'high';

export interface IndependentHumanAssessment {
  id: string;
  testId: string;
  token: string;
  visualCondition: VisualCondition;
  smellAssessment: SmellCondition;
  humanAssessment: HumanVerdict;
  confidence?: ConfidenceLevel;
  observations?: string;
  assessorIdentifier?: string;
  submittedAt: string; // ISO timestamp
}

export interface AssessmentTokenSession {
  token: string;
  testId: string;
  sampleId: string;
  cakeCategory: CakeCategory;
  storageCondition: StorageCondition;
  createdAt: string;
  expiresAt: string;
  status: 'Pending' | 'Submitted' | 'Expired';
  assessment?: IndependentHumanAssessment;
}

export interface AssessmentSubmissionPayload {
  token?: string;
  visualCondition: VisualCondition;
  smellAssessment: SmellCondition;
  humanAssessment: HumanVerdict;
  confidence?: ConfidenceLevel;
  observations?: string;
  assessorIdentifier?: string;
}

// Legacy Assessment types preserved for backward compatibility
export type FreshnessLabel = 'Fresh' | 'Average' | 'Not Good';

export interface ManualAssessment {
  id: string;
  experimentId: string;
  sampleId: string;
  assessorName: string;
  assessorId?: string;
  label: FreshnessLabel;
  confidenceRating: number;
  notes?: string;
  createdAt: string;
}

export interface SampleAssessmentSummary {
  sampleId: string;
  totalAssessments: number;
  latestAssessment?: ManualAssessment;
  hasDisagreement: boolean;
  distinctLabels: FreshnessLabel[];
  allAssessments: ManualAssessment[];
}
