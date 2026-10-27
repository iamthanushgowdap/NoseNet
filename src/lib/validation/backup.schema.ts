import { z } from 'zod';
import { ExperimentSchema } from './experiment.schema';
import { SampleSchema } from './sample.schema';
import { SensorReadingSchema } from './sensor.schema';
import { ManualAssessmentSchema } from './assessment.schema';

export const ProjectBackupMetadataSchema = z.object({
  totalExperiments: z.number().int().nonnegative(),
  totalSamples: z.number().int().nonnegative(),
  totalReadings: z.number().int().nonnegative(),
  totalAssessments: z.number().int().nonnegative(),
});

export const ProjectBackupDataSchema = z.object({
  version: z.string(),
  application: z.literal('NoseNet'),
  exportedAt: z.string(),
  metadata: ProjectBackupMetadataSchema,
  experiments: z.array(ExperimentSchema),
  samples: z.array(SampleSchema),
  sensorReadings: z.array(SensorReadingSchema),
  manualAssessments: z.array(ManualAssessmentSchema),
});

export type ProjectBackupDataInput = z.infer<typeof ProjectBackupDataSchema>;
