import { IStorageAdapter } from '@/lib/storage/storage-adapter';
import { localStorageAdapter } from '@/lib/storage/local-storage-adapter';
import { AuthService } from './auth-service';
import { ExperimentService } from './experiment-service';
import { SampleService } from './sample-service';
import { SensorService } from './sensor-service';
import { AssessmentService } from './assessment-service';
import { BackupService } from './backup-service';
import { AIService } from './ai-service';

export interface ServiceContainer {
  storage: IStorageAdapter;
  auth: AuthService;
  experiments: ExperimentService;
  samples: SampleService;
  sensor: SensorService;
  assessments: AssessmentService;
  backup: BackupService;
  ai: AIService;
}

export function createServiceContainer(
  storage: IStorageAdapter = localStorageAdapter
): ServiceContainer {
  return {
    storage,
    auth: new AuthService(storage),
    experiments: new ExperimentService(storage),
    samples: new SampleService(storage),
    sensor: new SensorService(storage),
    assessments: new AssessmentService(storage),
    backup: new BackupService(storage),
    ai: new AIService(storage),
  };
}

export const services = createServiceContainer();

export * from './auth-service';
export * from './experiment-service';
export * from './sample-service';
export * from './sensor-service';
export * from './assessment-service';
export * from './backup-service';
export * from './ai-service';
