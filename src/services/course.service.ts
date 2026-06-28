import { Role, PaymentStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { paginate } from '../utils/helpers';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CourseQueryInput,
} from '../validators/course.validator';

export class CourseService {
  async list(query: CourseQueryInput) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const where: Record<string, unknown> = { isPublished: true };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.level) where.level = query.level;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        include: {
          instructor: {
            select: { id: true, name: true, avatarUrl: true },
          },
          _count: { select: { enrollments: true, lessons: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { id: true, name: true, avatarUrl: true, email: true },
        },
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  }

  async create(instructorId: string, input: CreateCourseInput) {
    return prisma.course.create({
      data: { ...input, instructorId },
      include: {
        instructor: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, userId: string, userRole: Role, input: UpdateCourseInput) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new ApiError(404, 'Course not found');

    if (course.instructorId !== userId && userRole !== Role.ADMIN) {
      throw new ApiError(403, 'Only the course owner can update this course');
    }

    return prisma.course.update({
      where: { id },
      data: input,
      include: { instructor: { select: { id: true, name: true } } },
    });
  }

  async delete(id: string, userId: string, userRole: Role) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new ApiError(404, 'Course not found');

    if (course.instructorId !== userId && userRole !== Role.ADMIN) {
      throw new ApiError(403, 'Only the course owner or admin can delete this course');
    }

    await prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }

  async enroll(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new ApiError(404, 'Course not found');
    if (!course.isPublished) throw new ApiError(400, 'Course is not published');

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new ApiError(409, 'Already enrolled in this course');

    const paymentStatus =
      course.price > 0 ? PaymentStatus.PENDING : PaymentStatus.PAID;

    return prisma.enrollment.create({
      data: { userId, courseId, paymentStatus },
      include: { course: { select: { id: true, title: true, price: true } } },
    });
  }

  async getEnrolled(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments;
  }
}

export const courseService = new CourseService();
