import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { protect } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { createCheckoutSchema } from '../validators/payment.validator';

const router = Router();

router.post(
  '/create-checkout',
  protect,
  validateBody(createCheckoutSchema),
  paymentController.createCheckout
);

export default router;
