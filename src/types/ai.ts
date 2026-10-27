export type AIModelStatus =
  | 'Not Configured'
  | 'Not Validated'
  | 'Ready for Validation'
  | 'Validated and Enabled'
  | 'Unavailable';

export interface AIReadinessMetrics {
  status: AIModelStatus;
  statusMessage: string;
  totalSamples: number;
  labeledSamples: number;
  sensorReadingsCount: number;
  pairedSamplesCount: number;
  minimumRequiredForTraining: number;
  isReadyForValidation: boolean;
}
