import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import type { CreateLessonInput, UpdateLessonInput } from '../validators/lesson.validator';

export class LessonService {
  private async verifyCourseOwnership(courseId: string, userId: string, userRole: Role) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new ApiError(404, 'Course not found');
    if (course.instructorId !== userId && userRole !== Role.ADMIN) {
      throw new ApiError(403, 'Only the course owner can manage lessons');
    }
    return course;
  }

  async create(courseId: string, userId: string, userRole: Role, input: CreateLessonInput) {
    await this.verifyCourseOwnership(courseId, userId, userRole);

    return prisma.lesson.create({
      data: { ...input, courseId },
    });
  }

  async getById(id: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, instructorId: true } },
        quizzes: { select: { id: true, title: true, passingScore: true } },
      },
    });

    if (!lesson) throw new ApiError(404, 'Lesson not found');
    return lesson;
  }

  async update(id: string, userId: string, userRole: Role, input: UpdateLessonInput) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!lesson) throw new ApiError(404, 'Lesson not found');

    if (lesson.course.instructorId !== userId && userRole !== Role.ADMIN) {
      throw new ApiError(403, 'Only the course owner can update this lesson');
    }

    return prisma.lesson.update({ where: { id }, data: input });
  }

  async delete(id: string, userId: string, userRole: Role) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!lesson) throw new ApiError(404, 'Lesson not found');

    if (lesson.course.instructorId !== userId && userRole !== Role.ADMIN) {
      throw new ApiError(403, 'Only the course owner can delete this lesson');
    }

    await prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted successfully' };
  }
}

export const lessonService = new LessonService();
