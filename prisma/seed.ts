import { PrismaClient, Role, Level, Plan, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const demoEmails = ['student@demo.com', 'instructor@demo.com', 'admin@demo.com'];

  await prisma.user.deleteMany({
    where: { email: { in: demoEmails } },
  });

  const passwordHash = await bcrypt.hash('demo1234', 12);

  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      passwordHash,
      name: 'Demo Student',
      role: Role.STUDENT,
      language: 'en',
      learningType: 'V',
      plan: Plan.FREE,
      githubUsername: 'octocat',
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@demo.com' },
    update: {},
    create: {
      email: 'instructor@demo.com',
      passwordHash,
      name: 'Demo Instructor',
      role: Role.INSTRUCTOR,
      language: 'en',
      plan: Plan.PRO,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash,
      name: 'Demo Admin',
      role: Role.ADMIN,
      language: 'en',
      plan: Plan.CLASSROOM,
    },
  });

  const courseData = [
    {
      title: 'Introduction to JavaScript',
      description: 'Learn the fundamentals of JavaScript programming language.',
      category: 'Programming',
      level: Level.beginner,
      price: 0,
      isPublished: true,
    },
    {
      title: 'Advanced TypeScript',
      description: 'Master TypeScript with advanced patterns and best practices.',
      category: 'Programming',
      level: Level.advanced,
      price: 49.99,
      isPublished: true,
    },
    {
      title: 'Web Development Bootcamp',
      description: 'Full-stack web development from HTML to React and Node.js.',
      category: 'Web Development',
      level: Level.intermediate,
      price: 79.99,
      isPublished: true,
    },
    {
      title: 'Data Structures & Algorithms',
      description: 'Essential CS concepts for technical interviews.',
      category: 'Computer Science',
      level: Level.intermediate,
      price: 39.99,
      isPublished: true,
    },
    {
      title: 'Machine Learning Basics',
      description: 'Introduction to ML concepts, models, and Python libraries.',
      category: 'AI/ML',
      level: Level.beginner,
      price: 59.99,
      isPublished: true,
    },
  ];

  const courses = [];
  for (const data of courseData) {
    const course = await prisma.course.create({
      data: {
        ...data,
        instructorId: instructor.id,
        thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      },
    });
    courses.push(course);
  }

  const lessonTemplates = [
    { title: 'Getting Started', content: '# Getting Started\n\nWelcome to this lesson. We will cover the basics.' },
    { title: 'Core Concepts', content: '# Core Concepts\n\nUnderstanding the fundamental building blocks.' },
  ];

  const allLessons = [];
  for (const course of courses) {
    for (let i = 0; i < 2; i++) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: `${course.title} - ${lessonTemplates[i].title}`,
          content: lessonTemplates[i].content,
          videoUrl: 'https://example.com/video.mp4',
          order: i + 1,
        },
      });
      allLessons.push(lesson);
    }
  }

  let questionCount = 0;
  for (const lesson of allLessons) {
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: lesson.id,
        title: `Quiz: ${lesson.title}`,
        passingScore: 70,
      },
    });

    for (let q = 0; q < 2; q++) {
      questionCount++;
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: `Question ${questionCount}: What is the main topic of this lesson?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOptionIndex: 0,
        },
      });
    }
  }

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: courses[0].id,
      progress: 50,
      paymentStatus: PaymentStatus.PAID,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: courses[1].id,
      progress: 10,
      paymentStatus: PaymentStatus.PAID,
    },
  });

  const firstQuiz = await prisma.quiz.findFirst({ include: { questions: true } });
  if (firstQuiz) {
    await prisma.quizAttempt.create({
      data: {
        userId: student.id,
        quizId: firstQuiz.id,
        score: 100,
        passed: true,
        answers: firstQuiz.questions.map((q) => q.correctOptionIndex),
      },
    });
  }

  await prisma.note.create({
    data: {
      userId: student.id,
      lessonId: allLessons[0].id,
      content: 'Important note: Review the getting started section before the quiz.',
    },
  });

  await prisma.note.create({
    data: {
      userId: student.id,
      content: 'General study note: Practice coding daily for best results.',
    },
  });

  await prisma.payment.create({
    data: {
      userId: student.id,
      courseId: courses[1].id,
      amount: 49.99,
      status: PaymentStatus.PAID,
      method: PaymentMethod.card,
      stripeSessionId: 'cs_test_seed_payment_001',
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Created users: ${student.email}, ${instructor.email}, ${admin.email}`);
  console.log(`Created ${courses.length} courses, ${allLessons.length} lessons, ${questionCount} questions, 2 notes`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
