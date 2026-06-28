import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';

describe('Quiz API', () => {
  let cookies: string[];
  let quizId: string;
  let questionCount: number;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@demo.com', password: 'demo1234' });

    cookies = loginRes.headers['set-cookie'] as unknown as string[];

    const quiz = await prisma.quiz.findFirst({
      include: { questions: { orderBy: { id: 'asc' } } },
    });

    if (!quiz) {
      throw new Error('No quiz found in seed data');
    }

    quizId = quiz.id;
    questionCount = quiz.questions.length;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/quizzes/:id', () => {
    it('should return quiz without correctOptionIndex for student', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.questions.length).toBeGreaterThan(0);
      res.body.data.questions.forEach((q: Record<string, unknown>) => {
        expect(q).not.toHaveProperty('correctOptionIndex');
      });
    });
  });

  describe('POST /api/quizzes/:id/attempt', () => {
    it('should score all correct answers as pass', async () => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: { orderBy: { id: 'asc' } } },
      });

      const correctAnswers = quiz!.questions.map((q) => q.correctOptionIndex);

      const res = await request(app)
        .post(`/api/quizzes/${quizId}/attempt`)
        .set('Cookie', cookies)
        .send({ answers: correctAnswers })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(100);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.correctAnswers).toBe(questionCount);
    });

    it('should score all wrong answers as fail', async () => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: { orderBy: { id: 'asc' } } },
      });

      const wrongAnswers = quiz!.questions.map((q) =>
        q.correctOptionIndex === 0 ? 1 : 0
      );

      const res = await request(app)
        .post(`/api/quizzes/${quizId}/attempt`)
        .set('Cookie', cookies)
        .send({ answers: wrongAnswers })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(0);
      expect(res.body.data.passed).toBe(false);
    });

    it('should reject wrong number of answers', async () => {
      const res = await request(app)
        .post(`/api/quizzes/${quizId}/attempt`)
        .set('Cookie', cookies)
        .send({ answers: [0] })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/quizzes/:id/attempts', () => {
    it('should return user attempts', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}/attempts`)
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
