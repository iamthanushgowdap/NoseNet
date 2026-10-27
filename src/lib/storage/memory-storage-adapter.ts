import { IStorageAdapter } from './storage-adapter';
import { Experiment } from '@/types/experiment';
import { Sample } from '@/types/sample';
import { SensorReading } from '@/types/sensor';
import { ManualAssessment } from '@/types/assessment';
import { DemoSession } from '@/types/auth';

export class MemoryStorageAdapter implements IStorageAdapter {
  private session: DemoSession | null = null;
  private experiments: Experiment[] = [];
  private samples: Sample[] = [];
  private sensorReadings: SensorReading[] = [];
  private assessments: ManualAssessment[] = [];

  async getSession(): Promise<DemoSession | null> {
    return this.session ? { ...this.session } : null;
  }

  async setSession(session: DemoSession | null): Promise<void> {
    this.session = session ? { ...session } : null;
  }

  async getExperiments(): Promise<Experiment[]> {
    return [...this.experiments];
  }

  async saveExperiments(experiments: Experiment[]): Promise<void> {
    this.experiments = [...experiments];
  }

  async getSamples(): Promise<Sample[]> {
    return [...this.samples];
  }

  async saveSamples(samples: Sample[]): Promise<void> {
    this.samples = [...samples];
  }

  async getSensorReadings(): Promise<SensorReading[]> {
    return [...this.sensorReadings];
  }

  async saveSensorReadings(readings: SensorReading[]): Promise<void> {
    this.sensorReadings = [...readings];
  }

  async getAssessments(): Promise<ManualAssessment[]> {
    return [...this.assessments];
  }

  async saveAssessments(assessments: ManualAssessment[]): Promise<void> {
    this.assessments = [...assessments];
  }

  async clearAll(): Promise<void> {
    this.session = null;
    this.experiments = [];
    this.samples = [];
    this.sensorReadings = [];
    this.assessments = [];
  }
}
