import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { asyncHandler } from '../utils/asyncHandler';

export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createCheckout(req.user!.id, req.body);
  res.json({ success: true, data: result });
});

export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const result = await paymentService.handleWebhook(req.body, signature);
  res.json(result);
});
