import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';
import {
  updateUserSchema,
  updateLanguageSchema,
  updateLearningTypeSchema,
  userIdParamSchema,
} from '../validators/user.validator';

const router = Router();

router.use(protect);

router.get('/me', userController.getMe);
router.patch('/me', validateBody(updateUserSchema), userController.updateMe);
router.patch('/me/language', validateBody(updateLanguageSchema), userController.updateLanguage);
router.patch('/me/learning-type', validateBody(updateLearningTypeSchema), userController.updateLearningType);
router.get('/:id', validateParams(userIdParamSchema), userController.getById);

export default router;
