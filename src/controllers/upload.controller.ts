import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'File is required');
  }
  const result = await uploadService.uploadFile(req.file);
  res.json({ success: true, data: result });
});
