import { Router } from 'express';
import * as noteController from '../controllers/note.controller';
import { protect } from '../middlewares/auth';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate';
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamSchema,
  noteQuerySchema,
} from '../validators/note.validator';

const router = Router();

router.use(protect);

router.get('/', validateQuery(noteQuerySchema), noteController.listNotes);
router.post('/', validateBody(createNoteSchema), noteController.createNote);
router.patch('/:id', validateParams(noteIdParamSchema), validateBody(updateNoteSchema), noteController.updateNote);
router.delete('/:id', validateParams(noteIdParamSchema), noteController.deleteNote);

export default router;
