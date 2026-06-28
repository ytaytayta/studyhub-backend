import { z } from 'zod';

export const aiChatSchema = z.object({
  sessionId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message is required').max(4000),
});

export const generateQuizSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
  questionCount: z.number().int().min(1).max(20).default(5),
});

export type AiChatInput = z.infer<typeof aiChatSchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
