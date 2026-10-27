import { Experiment } from '@/types/experiment';
import { Sample } from '@/types/sample';
import { SensorReading } from '@/types/sensor';
import { ManualAssessment } from '@/types/assessment';
import { DemoSession } from '@/types/auth';

export interface IStorageAdapter {
  // Session
  getSession(): Promise<DemoSession | null>;
  setSession(session: DemoSession | null): Promise<void>;

  // Experiments
  getExperiments(): Promise<Experiment[]>;
  saveExperiments(experiments: Experiment[]): Promise<void>;

  // Samples
  getSamples(): Promise<Sample[]>;
  saveSamples(samples: Sample[]): Promise<void>;

  // Sensor Readings
  getSensorReadings(): Promise<SensorReading[]>;
  saveSensorReadings(readings: SensorReading[]): Promise<void>;

  // Manual Assessments
  getAssessments(): Promise<ManualAssessment[]>;
  saveAssessments(assessments: ManualAssessment[]): Promise<void>;

  // Bulk Operations
  clearAll(): Promise<void>;
}
