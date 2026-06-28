import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, signRefreshToken, JwtPayload } from '../utils/jwt';
import { omitPassword } from '../utils/helpers';
import { config } from '../config';
import type {
  RegisterInput,
  LoginInput,
  GoogleAuthInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator';

const googleClient = new OAuth2Client(config.googleClientId);

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const role = input.role === 'INSTRUCTOR' ? Role.INSTRUCTOR : Role.STUDENT;

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role,
      },
    });

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    return {
      user: omitPassword(user),
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    return {
      user: omitPassword(user),
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async googleAuth(input: GoogleAuthInput) {
    if (!config.googleClientId) {
      throw new ApiError(503, 'Google OAuth is not configured');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: input.idToken,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new ApiError(401, 'Invalid Google token');
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: payload.sub }, { email: payload.email }],
      },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            avatarUrl: user.avatarUrl || payload.picture,
          },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          googleId: payload.sub,
          avatarUrl: payload.picture,
          role: Role.STUDENT,
        },
      });
    }

    const jwtPayload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    return {
      user: omitPassword(user),
      accessToken: signAccessToken(jwtPayload),
      refreshToken: signRefreshToken(jwtPayload),
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    const { verifyRefreshToken } = await import('../utils/jwt');
    let decoded: JwtPayload;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    return {
      user: omitPassword(user),
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExp },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset token for ${user.email}: ${resetToken}`);
      }
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: input.token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return { message: 'Password reset successfully' };
  }
}

export const authService = new AuthService();
