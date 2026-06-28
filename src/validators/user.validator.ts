import { z } from 'zod';
import { VARK_TYPES } from '../utils/helpers';

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  githubUsername: z.string().min(1).optional().nullable(),
});

export const updateLanguageSchema = z.object({
  language: z.string().min(2).max(10),
});

export const updateLearningTypeSchema = z.object({
  learningType: z.enum(VARK_TYPES as unknown as [string, ...string[]]),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
export type UpdateLearningTypeInput = z.infer<typeof updateLearningTypeSchema>;
