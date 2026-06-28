import { z } from 'zod';

const questionSchema = z.object({
  text: z.string().min(5),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctOptionIndex: z.number().int().min(0),
});

export const createQuizSchema = z.object({
  title: z.string().min(3),
  passingScore: z.number().int().min(0).max(100).default(70),
  questions: z.array(questionSchema).min(1).optional(),
});

export const quizAttemptSchema = z.object({
  answers: z.array(z.number().int().min(0)),
});

export const lessonIdParamSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
});

export const quizIdParamSchema = z.object({
  id: z.string().uuid('Invalid quiz ID'),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;
