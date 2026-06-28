import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';
import { Role } from '@prisma/client';
import {
  createQuizSchema,
  quizAttemptSchema,
  lessonIdParamSchema,
  quizIdParamSchema,
} from '../validators/quiz.validator';

const router = Router();

router.post(
  '/lessons/:lessonId/quizzes',
  protect,
  restrictTo(Role.INSTRUCTOR, Role.ADMIN),
  validateParams(lessonIdParamSchema),
  validateBody(createQuizSchema),
  quizController.createQuiz
);

router.get(
  '/:id',
  protect,
  validateParams(quizIdParamSchema),
  quizController.getQuiz
);

router.post(
  '/:id/attempt',
  protect,
  validateParams(quizIdParamSchema),
  validateBody(quizAttemptSchema),
  quizController.submitAttempt
);

router.get(
  '/:id/attempts',
  protect,
  validateParams(quizIdParamSchema),
  quizController.getAttempts
);

export default router;
