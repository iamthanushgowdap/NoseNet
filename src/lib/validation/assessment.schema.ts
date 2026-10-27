import { z } from 'zod';

export const FreshnessLabelSchema = z.enum(['Fresh', 'Average', 'Not Good']);

export const ManualAssessmentSchema = z.object({
  id: z.string(),
  experimentId: z.string().trim().min(1, 'Experiment ID is required'),
  sampleId: z.string().trim().min(1, 'Sample ID is required'),
  assessorName: z.string().trim().min(2, 'Assessor name is required'),
  assessorId: z.string().trim().min(1, 'Assessor ID is required'),
  label: FreshnessLabelSchema,
  confidenceRating: z.number().int().min(1).max(5).optional(),
  notes: z.string().trim().max(1000).optional(),
  createdAt: z.string().datetime().or(z.string().min(10)),
});

export const CreateAssessmentInputSchema = z.object({
  experimentId: z.string().trim().min(1, 'Experiment ID is required'),
  sampleId: z.string().trim().min(1, 'Sample ID is required'),
  assessorName: z.string().trim().min(2, 'Assessor name is required'),
  assessorId: z.string().trim().min(1, 'Assessor ID is required'),
  label: FreshnessLabelSchema,
  confidenceRating: z.number().int().min(1).max(5).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateAssessmentInput = z.infer<typeof CreateAssessmentInputSchema>;
