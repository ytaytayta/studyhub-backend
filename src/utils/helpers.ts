import { Role } from '@prisma/client';

export function omitPassword<T extends { passwordHash?: string | null }>(
  user: T
): Omit<T, 'passwordHash'> {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export function isInstructorOrAdmin(role: Role): boolean {
  return role === Role.INSTRUCTOR || role === Role.ADMIN;
}

export const VARK_TYPES = ['V', 'A', 'R', 'K', 'VA', 'VR', 'VK', 'AR', 'AK', 'RK', 'VAR', 'VAK', 'ARK', 'VARK'] as const;

export function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export function paginate(page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit,
  };
}
