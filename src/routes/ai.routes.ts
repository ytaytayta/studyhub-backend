import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { protect } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { aiLimiter } from '../middlewares/rateLimiter';
import { uploadAudio } from '../middlewares/upload';
import { aiChatSchema, generateQuizSchema } from '../validators/ai.validator';

const router = Router();

router.use(protect);
router.use(aiLimiter);

router.post('/chat', validateBody(aiChatSchema), aiController.chat);
router.post('/generate-quiz', validateBody(generateQuizSchema), aiController.generateQuiz);
router.post('/speech-to-text', uploadAudio, aiController.speechToText);

export default router;
