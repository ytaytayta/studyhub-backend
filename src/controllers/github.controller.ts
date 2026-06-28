import { Request, Response } from 'express';
import { githubService } from '../services/github.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getRepos = asyncHandler(async (req: Request, res: Response) => {
  const repos = await githubService.getRepos(req.user!.id);
  res.json({ success: true, data: repos });
});
