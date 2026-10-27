import { Experiment } from './experiment';
import { Sample } from './sample';
import { SensorReading } from './sensor';
import { ManualAssessment } from './assessment';

export interface ProjectBackupMetadata {
  totalExperiments: number;
  totalSamples: number;
  totalReadings: number;
  totalAssessments: number;
}

export interface ProjectBackupData {
  version: string;
  application: 'NoseNet';
  exportedAt: string;
  metadata: ProjectBackupMetadata;
  experiments: Experiment[];
  samples: Sample[];
  sensorReadings: SensorReading[];
  manualAssessments: ManualAssessment[];
}
