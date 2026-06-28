import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  lessonId: z.string().uuid().optional().nullable(),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

export const noteIdParamSchema = z.object({
  id: z.string().uuid('Invalid note ID'),
});

export const noteQuerySchema = z.object({
  lessonId: z.string().uuid().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
