import { Router } from 'express';
import * as lessonController from '../controllers/lesson.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';
import { Role } from '@prisma/client';
import {
  createLessonSchema,
  updateLessonSchema,
  lessonIdParamSchema,
} from '../validators/lesson.validator';
import { courseIdNestedParamSchema } from '../validators/course.validator';

const router = Router();

router.post(
  '/courses/:courseId/lessons',
  protect,
  restrictTo(Role.INSTRUCTOR, Role.ADMIN),
  validateParams(courseIdNestedParamSchema),
  validateBody(createLessonSchema),
  lessonController.createLesson
);

router.get('/:id', validateParams(lessonIdParamSchema), lessonController.getLesson);

router.patch(
  '/:id',
  protect,
  restrictTo(Role.INSTRUCTOR, Role.ADMIN),
  validateParams(lessonIdParamSchema),
  validateBody(updateLessonSchema),
  lessonController.updateLesson
);

router.delete(
  '/:id',
  protect,
  restrictTo(Role.INSTRUCTOR, Role.ADMIN),
  validateParams(lessonIdParamSchema),
  lessonController.deleteLesson
);

export default router;
