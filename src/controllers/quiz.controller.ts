import { Request, Response } from 'express';
import { quizService } from '../services/quiz.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/helpers';

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizService.create(
    paramId(req.params.lessonId),
    req.user!.id,
    req.user!.role,
    req.body
  );
  res.status(201).json({ success: true, data: quiz });
});

export const getQuiz = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizService.getById(paramId(req.params.id), req.user!.role);
  res.json({ success: true, data: quiz });
});

export const submitAttempt = asyncHandler(async (req: Request, res: Response) => {
  const result = await quizService.submitAttempt(paramId(req.params.id), req.user!.id, req.body);
  res.status(201).json({ success: true, data: result });
});

export const getAttempts = asyncHandler(async (req: Request, res: Response) => {
  const attempts = await quizService.getAttempts(paramId(req.params.id), req.user!.id, req.user!.role);
  res.json({ success: true, data: attempts });
});
