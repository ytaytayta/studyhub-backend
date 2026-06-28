import { Router } from 'express';
import * as githubController from '../controllers/github.controller';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.get('/repos', githubController.getRepos);

export default router;
