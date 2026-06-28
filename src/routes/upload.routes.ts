import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { protect } from '../middlewares/auth';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

router.use(protect);
router.post('/', uploadSingle, uploadController.uploadFile);

export default router;
