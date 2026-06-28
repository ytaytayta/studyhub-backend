import { Request, Response } from 'express';
import { courseService } from '../services/course.service';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/helpers';

export const listCourses = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.list(req.query as never);
  res.json({ success: true, data: result });
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getById(paramId(req.params.id));
  res.json({ success: true, data: course });
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.create(req.user!.id, req.body);
  res.status(201).json({ success: true, data: course });
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.update(paramId(req.params.id), req.user!.id, req.user!.role, req.body);
  res.json({ success: true, data: course });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.delete(paramId(req.params.id), req.user!.id, req.user!.role);
  res.json({ success: true, data: result });
});

export const enrollCourse = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await courseService.enroll(paramId(req.params.id), req.user!.id);
  res.status(201).json({ success: true, data: enrollment });
});

export const getEnrolledCourses = asyncHandler(async (req: Request, res: Response) => {
  const enrollments = await courseService.getEnrolled(req.user!.id);
  res.json({ success: true, data: enrollments });
});
