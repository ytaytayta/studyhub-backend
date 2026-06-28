import { z } from 'zod';

export const createCheckoutSchema = z.object({
  courseId: z.string().uuid().optional(),
  plan: z.enum(['PRO', 'CLASSROOM']).optional(),
  method: z.enum(['qris', 'card', 'ewallet', 'bank_transfer']).default('card'),
}).refine(
  (data) => data.courseId || data.plan,
  { message: 'Either courseId or plan must be provided' }
);

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
