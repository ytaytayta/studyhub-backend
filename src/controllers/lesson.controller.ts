import { Request, Response } from 'express';
import { lessonService } from '../services/lesson.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/helpers';

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await lessonService.create(
    paramId(req.params.courseId),
    req.user!.id,
    req.user!.role,
    req.body
  );
  res.status(201).json({ success: true, data: lesson });
});

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await lessonService.getById(paramId(req.params.id));
  res.json({ success: true, data: lesson });
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await lessonService.update(paramId(req.params.id), req.user!.id, req.user!.role, req.body);
  res.json({ success: true, data: lesson });
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  const result = await lessonService.delete(paramId(req.params.id), req.user!.id, req.user!.role);
  res.json({ success: true, data: result });
});
