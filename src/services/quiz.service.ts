import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import type { CreateQuizInput, QuizAttemptInput } from '../validators/quiz.validator';

export class QuizService {
  async create(lessonId: string, userId: string, userRole: Role, input: CreateQuizInput) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });
    if (!lesson) throw new ApiError(404, 'Lesson not found');

    if (lesson.course.instructorId !== userId && userRole !== Role.ADMIN) {
      throw new ApiError(403, 'Only the course owner can create quizzes');
    }

    const { questions, ...quizData } = input;

    return prisma.quiz.create({
      data: {
        ...quizData,
        lessonId,
        questions: questions
          ? { create: questions }
          : undefined,
      },
      include: { questions: true },
    });
  }

  async getById(id: string, userRole: Role) {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        lesson: { select: { id: true, title: true, courseId: true } },
      },
    });

    if (!quiz) throw new ApiError(404, 'Quiz not found');

    const isPrivileged = userRole === Role.INSTRUCTOR || userRole === Role.ADMIN;

    if (!isPrivileged) {
      return {
        ...quiz,
        questions: quiz.questions.map(({ correctOptionIndex: _, ...q }) => q),
      };
    }

    return quiz;
  }

  async submitAttempt(quizId: string, userId: string, input: QuizAttemptInput) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { id: 'asc' } } },
    });

    if (!quiz) throw new ApiError(404, 'Quiz not found');
    if (input.answers.length !== quiz.questions.length) {
      throw new ApiError(400, `Expected ${quiz.questions.length} answers`);
    }

    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (input.answers[i] === q.correctOptionIndex) correct++;
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
        answers: input.answers,
      },
    });

    return { attempt, score, passed, totalQuestions: quiz.questions.length, correctAnswers: correct };
  }

  async getAttempts(quizId: string, userId: string, userRole: Role) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { lesson: { include: { course: true } } },
    });
    if (!quiz) throw new ApiError(404, 'Quiz not found');

    const isOwner =
      quiz.lesson.course.instructorId === userId || userRole === Role.ADMIN;

    const where = isOwner ? { quizId } : { quizId, userId };

    return prisma.quizAttempt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { attemptedAt: 'desc' },
    });
  }
}

export const quizService = new QuizService();
