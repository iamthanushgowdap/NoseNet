import { z } from 'zod';

export const ExperimentStatusSchema = z.enum(['Draft', 'Active', 'Completed', 'Archived']);

export const ControlRunMetadataSchema = z.object({
  roomStageCompleted: z.boolean().default(false),
  roomBaselineResistanceKohm: z.number().nonnegative().optional(),
  emptyContainerStageCompleted: z.boolean().default(false),
  emptyContainerBaselineResistanceKohm: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const ExperimentSchema = z.object({
  id: z
    .string()
    .trim()
    .min(3, 'Experiment ID must be at least 3 characters')
    .max(40, 'Experiment ID must be under 40 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'ID can only contain letters, numbers, hyphens, and underscores'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().trim().max(1000).default(''),
  createdAt: z.string().datetime().or(z.string().min(10)),
  testDate: z.string().min(1, 'Test date is required'),
  protocolNotes: z.string().trim().max(2000).default(''),
  plannedDurationMinutes: z
    .number({ message: 'Planned duration must be a number' })
    .int('Duration must be an integer')
    .positive('Planned duration must be greater than 0'),
  actualDurationMinutes: z
    .number()
    .int()
    .nonnegative()
    .optional(),
  status: ExperimentStatusSchema.default('Draft'),
  sampleIds: z.array(z.string()).default([]),
  controls: ControlRunMetadataSchema.default({
    roomStageCompleted: false,
    emptyContainerStageCompleted: false,
  }),
  updatedAt: z.string().datetime().or(z.string().min(10)),
});

export const CreateExperimentInputSchema = ExperimentSchema.omit({
  createdAt: true,
  updatedAt: true,
  sampleIds: true,
}).extend({
  id: z.string().trim().min(3).max(40).optional(),
});

export type ExperimentInput = z.infer<typeof CreateExperimentInputSchema>;
