import { z } from 'zod';

export const TestRunConfigSchema = z.object({
  sampleId: z
    .string()
    .min(1, 'Sample ID is required')
    .max(50, 'Sample ID too long')
    .regex(/^[a-zA-Z0-9_\-\.\s]+$/, 'Sample ID contains invalid characters'),
  cakeCategory: z.enum(['Normal cake', 'Pastry cake']),
  storageCondition: z.enum(['Frozen', 'Unfrozen']),
  stage: z.enum(['Room control', 'Empty-container control', 'Cake sample']),
  plannedDurationSeconds: z
    .number()
    .int('Duration must be an integer')
    .min(10, 'Minimum duration is 10 seconds')
    .max(3600, 'Maximum duration is 3600 seconds')
    .default(360),
  operatorNotes: z.string().max(500, 'Notes too long').optional(),
});

export const InterruptionEventSchema = z.object({
  timestamp: z.string(),
  reason: z.string(),
});

export const TestRunSchema = z.object({
  id: z.string().min(1),
  sampleId: z.string().min(1),
  cakeCategory: z.enum(['Normal cake', 'Pastry cake']),
  storageCondition: z.enum(['Frozen', 'Unfrozen']),
  stage: z.enum(['Room control', 'Empty-container control', 'Cake sample']),
  operatorNotes: z.string().optional(),
  status: z.enum(['Preparing', 'Running', 'Paused', 'Completed', 'Interrupted', 'Invalid']),
  plannedDurationSeconds: z.number().int().positive(),
  actualDurationSeconds: z.number().nonnegative(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  readingsCount: z.number().int().nonnegative(),
  validReadingsCount: z.number().int().nonnegative(),
  errorReadingsCount: z.number().int().nonnegative(),
  interruptionEvents: z.array(InterruptionEventSchema).default([]),
  assessmentToken: z.string(),
  assessmentStatus: z.enum(['Pending', 'Submitted', 'Expired']).default('Pending'),
  assessmentSubmittedAt: z.string().optional(),
});
