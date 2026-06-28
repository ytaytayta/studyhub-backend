import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import type { CreateNoteInput, UpdateNoteInput } from '../validators/note.validator';

export class NoteService {
  async list(userId: string, lessonId?: string) {
    const where: { userId: string; lessonId?: string } = { userId };
    if (lessonId) where.lessonId = lessonId;

    return prisma.note.findMany({
      where,
      include: {
        lesson: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(userId: string, input: CreateNoteInput) {
    if (input.lessonId) {
      const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });
      if (!lesson) throw new ApiError(404, 'Lesson not found');
    }

    return prisma.note.create({
      data: {
        userId,
        content: input.content,
        lessonId: input.lessonId,
      },
      include: { lesson: { select: { id: true, title: true } } },
    });
  }

  async update(id: string, userId: string, input: UpdateNoteInput) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new ApiError(404, 'Note not found');
    if (note.userId !== userId) throw new ApiError(403, 'Not authorized to update this note');

    return prisma.note.update({
      where: { id },
      data: { content: input.content },
    });
  }

  async delete(id: string, userId: string) {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) throw new ApiError(404, 'Note not found');
    if (note.userId !== userId) throw new ApiError(403, 'Not authorized to delete this note');

    await prisma.note.delete({ where: { id } });
    return { message: 'Note deleted successfully' };
  }
}

export const noteService = new NoteService();
