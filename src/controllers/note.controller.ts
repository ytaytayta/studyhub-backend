import { Request, Response } from 'express';
import { noteService } from '../services/note.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/helpers';

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = req.query.lessonId as string | undefined;
  const notes = await noteService.list(req.user!.id, lessonId);
  res.json({ success: true, data: notes });
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.create(req.user!.id, req.body);
  res.status(201).json({ success: true, data: note });
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.update(paramId(req.params.id), req.user!.id, req.body);
  res.json({ success: true, data: note });
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const result = await noteService.delete(paramId(req.params.id), req.user!.id);
  res.json({ success: true, data: result });
});
