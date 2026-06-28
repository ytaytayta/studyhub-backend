import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import lessonRoutes from './lesson.routes';
import quizRoutes from './quiz.routes';
import aiRoutes from './ai.routes';
import paymentRoutes from './payment.routes';
import githubRoutes from './github.routes';
import statsRoutes from './stats.routes';
import noteRoutes from './note.routes';
import uploadRoutes from './upload.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/quizzes', quizRoutes);
router.use('/ai', aiRoutes);
router.use('/payments', paymentRoutes);
router.use('/github', githubRoutes);
router.use('/stats', statsRoutes);
router.use('/notes', noteRoutes);
router.use('/upload', uploadRoutes);

export default router;
