import { z } from 'zod';

export const DemoRoleSchema = z.enum(['researcher', 'assessor']);

export const DemoLoginSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be under 50 characters'),
  role: DemoRoleSchema,
});

export type DemoLoginInput = z.infer<typeof DemoLoginSchema>;
