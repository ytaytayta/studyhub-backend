import { z } from 'zod';

export const createLessonSchema = z.object({
  title: z.string().min(3),
  content: z.string().default(''),
  videoUrl: z.string().url().optional().nullable(),
  order: z.number().int().min(0).default(0),
});

export const updateLessonSchema = createLessonSchema.partial();

export const lessonIdParamSchema = z.object({
  id: z.string().uuid('Invalid lesson ID'),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
