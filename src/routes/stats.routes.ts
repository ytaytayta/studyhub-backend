import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.get('/dashboard', statsController.getDashboard);

export default router;
