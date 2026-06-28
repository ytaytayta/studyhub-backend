import { Request, Response } from 'express';
import { statsService } from '../services/stats.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await statsService.getDashboard(req.user!.id, req.user!.role);
  res.json({ success: true, data: stats });
});
