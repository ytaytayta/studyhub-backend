import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.chat(req.user!.id, req.body);
  res.json({ success: true, data: result });
});

export const generateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await aiService.generateQuiz(req.user!.id, req.body);
  res.status(201).json({ success: true, data: quiz });
});

export const speechToText = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Audio file is required');
  }
  const result = await aiService.speechToText(req.file.buffer, req.file.mimetype);
  res.json({ success: true, data: result });
});
