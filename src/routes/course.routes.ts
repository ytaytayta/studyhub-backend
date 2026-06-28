import { Router } from 'express';
import * as courseController from '../controllers/course.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate';
import { Role } from '@prisma/client';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  courseIdParamSchema,
} from '../validators/course.validator';

const router = Router();

router.get('/', validateQuery(courseQuerySchema), courseController.listCourses);
router.get('/enrolled', protect, courseController.getEnrolledCourses);
router.get('/:id', validateParams(courseIdParamSchema), courseController.getCourse);

router.post(
  '/',
  protect,
  restrictTo(Role.INSTRUCTOR, Role.ADMIN),
  validateBody(createCourseSchema),
  courseController.createCourse
);

router.patch(
  '/:id',
  protect,
  restrictTo(Role.INSTRUCTOR, Role.ADMIN),
  validateParams(courseIdParamSchema),
  validateBody(updateCourseSchema),
  courseController.updateCourse
);

router.delete(
  '/:id',
  protect,
  restrictTo(Role.INSTRUCTOR, Role.ADMIN),
  validateParams(courseIdParamSchema),
  courseController.deleteCourse
);

router.post(
  '/:id/enroll',
  protect,
  restrictTo(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
  validateParams(courseIdParamSchema),
  courseController.enrollCourse
);

export default router;
