import { z } from 'zod';

export const CakeCategorySchema = z.enum(['Normal Cake', 'Pastry Cake']);
export const StorageConditionSchema = z.enum(['Unfrozen', 'Frozen']);
export const SampleTestStatusSchema = z.enum(['Planned', 'Testing', 'Completed', 'Invalid']);

export const SampleSchema = z.object({
  id: z
    .string()
    .trim()
    .min(3, 'Sample ID must be at least 3 characters')
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'Sample ID can only contain alphanumeric, hyphen, or underscore characters'),
  experimentId: z.string().trim().min(1, 'Experiment ID is required'),
  category: CakeCategorySchema,
  storageCondition: StorageConditionSchema,
  replicateNumber: z.string().trim().min(1, 'Replicate number is required').default('Sample 1'),
  testDateTime: z.string().min(1, 'Test date/time is required'),
  massGrams: z.number().positive('Mass must be positive').max(5000).optional(),
  notes: z.string().trim().max(1000).optional(),
  status: SampleTestStatusSchema.default('Planned'),
  createdAt: z.string().datetime().or(z.string().min(10)),
  updatedAt: z.string().datetime().or(z.string().min(10)),
});

export const CreateSampleInputSchema = SampleSchema.omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().trim().min(3).max(40).optional(),
});

export type SampleInput = z.infer<typeof CreateSampleInputSchema>;
