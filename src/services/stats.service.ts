import { Role, PaymentStatus } from '@prisma/client';
import prisma from '../utils/prisma';

export class StatsService {
  async getDashboard(userId: string, role: Role) {
    if (role === Role.INSTRUCTOR || role === Role.ADMIN) {
      return this.getInstructorStats(userId);
    }
    return this.getStudentStats(userId);
  }

  private async getStudentStats(userId: string) {
    const [enrolledCount, completedCount, quizAttempts, avgScore] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.enrollment.count({ where: { userId, progress: 100 } }),
      prisma.quizAttempt.findMany({
        where: { userId },
        select: { score: true, passed: true },
      }),
      prisma.quizAttempt.aggregate({
        where: { userId },
        _avg: { score: true },
      }),
    ]);

    const passedQuizzes = quizAttempts.filter((a) => a.passed).length;

    return {
      role: 'STUDENT',
      enrolledCount,
      completedCount,
      totalQuizAttempts: quizAttempts.length,
      passedQuizzes,
      averageQuizScore: Math.round(avgScore._avg.score || 0),
    };
  }

  private async getInstructorStats(userId: string) {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    const [courseCount, totalStudents, revenue] = await Promise.all([
      prisma.course.count({ where: { instructorId: userId } }),
      courseIds.length > 0
        ? prisma.enrollment.count({ where: { courseId: { in: courseIds } } })
        : 0,
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          courseId: { in: courseIds },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      role: 'INSTRUCTOR',
      courseCount,
      totalStudents,
      totalRevenue: revenue._sum.amount || 0,
    };
  }
}

export const statsService = new StatsService();
