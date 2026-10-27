import { IStorageAdapter } from './storage-adapter';
import { Experiment } from '@/types/experiment';
import { Sample } from '@/types/sample';
import { SensorReading } from '@/types/sensor';
import { ManualAssessment } from '@/types/assessment';
import { DemoSession } from '@/types/auth';

const STORAGE_KEYS = {
  SESSION: 'nosenet_demo_session',
  EXPERIMENTS: 'nosenet_experiments',
  SAMPLES: 'nosenet_samples',
  SENSOR_READINGS: 'nosenet_sensor_readings',
  ASSESSMENTS: 'nosenet_assessments',
} as const;

export class LocalStorageAdapter implements IStorageAdapter {
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const test = '__nosenet_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) return defaultValue;
    try {
      const data = window.localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`[LocalStorageAdapter] Failed to parse key ${key}:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[LocalStorageAdapter] Failed to set key ${key}:`, e);
      throw new Error(
        'Browser local storage quota exceeded or storage unavailable. Export data to free up space.'
      );
    }
  }

  async getSession(): Promise<DemoSession | null> {
    return this.getItem<DemoSession | null>(STORAGE_KEYS.SESSION, null);
  }

  async setSession(session: DemoSession | null): Promise<void> {
    if (session === null) {
      if (this.isAvailable()) window.localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      this.setItem(STORAGE_KEYS.SESSION, session);
    }
  }

  async getExperiments(): Promise<Experiment[]> {
    return this.getItem<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, []);
  }

  async saveExperiments(experiments: Experiment[]): Promise<void> {
    this.setItem(STORAGE_KEYS.EXPERIMENTS, experiments);
  }

  async getSamples(): Promise<Sample[]> {
    return this.getItem<Sample[]>(STORAGE_KEYS.SAMPLES, []);
  }

  async saveSamples(samples: Sample[]): Promise<void> {
    this.setItem(STORAGE_KEYS.SAMPLES, samples);
  }

  async getSensorReadings(): Promise<SensorReading[]> {
    return this.getItem<SensorReading[]>(STORAGE_KEYS.SENSOR_READINGS, []);
  }

  async saveSensorReadings(readings: SensorReading[]): Promise<void> {
    this.setItem(STORAGE_KEYS.SENSOR_READINGS, readings);
  }

  async getAssessments(): Promise<ManualAssessment[]> {
    return this.getItem<ManualAssessment[]>(STORAGE_KEYS.ASSESSMENTS, []);
  }

  async saveAssessments(assessments: ManualAssessment[]): Promise<void> {
    this.setItem(STORAGE_KEYS.ASSESSMENTS, assessments);
  }

  async clearAll(): Promise<void> {
    if (!this.isAvailable()) return;
    Object.values(STORAGE_KEYS).forEach((k) => {
      window.localStorage.removeItem(k);
    });
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
