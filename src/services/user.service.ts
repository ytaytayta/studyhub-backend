import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { omitPassword } from '../utils/helpers';
import type {
  UpdateUserInput,
  UpdateLanguageInput,
  UpdateLearningTypeInput,
} from '../validators/user.validator';

export class UserService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');
    return omitPassword(user);
  }

  async updateMe(userId: string, input: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
    });
    return omitPassword(user);
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        githubUsername: true,
        language: true,
        learningType: true,
        plan: true,
        createdAt: true,
      },
    });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async updateLanguage(userId: string, input: UpdateLanguageInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { language: input.language },
    });
    return omitPassword(user);
  }

  async updateLearningType(userId: string, input: UpdateLearningTypeInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { learningType: input.learningType },
    });
    return omitPassword(user);
  }
}

export const userService = new UserService();
