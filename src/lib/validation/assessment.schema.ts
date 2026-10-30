import { z } from 'zod';

export const AssessmentSubmissionSchema = z.object({
  token: z.string().min(8, 'Invalid assessment token').optional(),
  visualCondition: z.enum(['Normal', 'Changed', 'Unsure', 'normal', 'changed', 'unsure']),
  smellAssessment: z.enum(['Normal', 'Changed', 'Unsure', 'normal', 'changed', 'unsure']),
  humanAssessment: z.enum([
    'Appears normal',
    'Possible change',
    'Cannot determine',
    'appears_normal',
    'possible_change',
    'cannot_determine',
  ]),
  confidence: z.enum(['Low', 'Medium', 'High', 'low', 'medium', 'high']).optional(),
  observations: z.string().max(1000, 'Observations too long').optional(),
  assessorIdentifier: z.string().max(50, 'Identifier too long').optional(),
});

// Legacy assessment schemas preserved for backward compatibility
export const FreshnessLabelSchema = z.enum(['Fresh', 'Average', 'Not Good']);

export const ManualAssessmentSchema = z.object({
  id: z.string().min(1),
  experimentId: z.string().min(1),
  sampleId: z.string().min(1),
  assessorName: z.string().min(1),
  assessorId: z.string().optional(),
  label: FreshnessLabelSchema,
  confidenceRating: z.number().min(1).max(5),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export const CreateAssessmentInputSchema = z.object({
  experimentId: z.string().min(1, 'Experiment ID is required'),
  sampleId: z.string().min(1, 'Sample ID is required'),
  assessorName: z.string().min(1, 'Assessor name is required'),
  assessorId: z.string().optional(),
  label: FreshnessLabelSchema,
  confidenceRating: z.number().min(1).max(5).optional().default(4),
  notes: z.string().optional(),
});
