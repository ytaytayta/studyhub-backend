import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { setTokenCookies } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setTokenCookies(res, result.accessToken, result.refreshToken);
  res.status(201).json({ success: true, data: { user: result.user } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setTokenCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, data: { user: result.user } });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.googleAuth(req.body);
  setTokenCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, data: { user: result.user } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  const result = await authService.refresh(refreshToken);
  setTokenCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, data: { user: result.user } });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body);
  res.json({ success: true, data: result });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  res.json({ success: true, data: result });
});
