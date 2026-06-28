import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/helpers';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.id);
  res.json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateMe(req.user!.id, req.body);
  res.json({ success: true, data: user });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(paramId(req.params.id));
  res.json({ success: true, data: user });
});

export const updateLanguage = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateLanguage(req.user!.id, req.body);
  res.json({ success: true, data: user });
});

export const updateLearningType = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateLearningType(req.user!.id, req.body);
  res.json({ success: true, data: user });
});
