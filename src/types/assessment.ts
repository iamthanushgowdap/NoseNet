export type FreshnessLabel = 'Fresh' | 'Average' | 'Not Good';

export interface ManualAssessment {
  id: string;
  experimentId: string;
  sampleId: string;
  assessorName: string;
  assessorId: string;
  label: FreshnessLabel;
  confidenceRating?: number; // 1 to 5
  notes?: string;
  createdAt: string; // ISO
}

export interface SampleAssessmentSummary {
  sampleId: string;
  totalAssessments: number;
  latestAssessment?: ManualAssessment;
  hasDisagreement: boolean;
  distinctLabels: FreshnessLabel[];
  allAssessments: ManualAssessment[];
}
