import OpenAI from 'openai';
import { Sender } from '@prisma/client';
import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';
import type { AiChatInput, GenerateQuizInput } from '../validators/ai.validator';

const openai = config.openaiApiKey
  ? new OpenAI({ apiKey: config.openaiApiKey })
  : null;

export class AiService {
  private ensureOpenAI() {
    if (!openai) {
      throw new ApiError(503, 'OpenAI is not configured');
    }
    return openai;
  }

  async chat(userId: string, input: AiChatInput) {
    const client = this.ensureOpenAI();

    let sessionId = input.sessionId;
    let context = '';

    if (sessionId) {
      const session = await prisma.aIChatSession.findFirst({
        where: { id: sessionId, userId },
      });
      if (!session) throw new ApiError(404, 'Chat session not found');
      context = session.context || '';
    } else {
      if (input.courseId) {
        const course = await prisma.course.findUnique({
          where: { id: input.courseId },
          include: {
            lessons: { select: { title: true, content: true }, orderBy: { order: 'asc' } },
          },
        });
        if (course) {
          context = `Course: ${course.title}\n${course.description}\n\nLessons:\n` +
            course.lessons.map((l) => `## ${l.title}\n${l.content}`).join('\n\n');
        }
      }

      const session = await prisma.aIChatSession.create({
        data: {
          userId,
          courseId: input.courseId,
          context,
        },
      });
      sessionId = session.id;
    }

    await prisma.aIChatMessage.create({
      data: { sessionId, sender: Sender.USER, message: input.message },
    });

    const history = await prisma.aIChatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      take: 20,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are StudyHub AI, a helpful educational assistant. Answer questions clearly and concisely based on the course context when available.' +
          (context ? `\n\nCourse Context:\n${context}` : ''),
      },
      ...history.map((m) => ({
        role: (m.sender === Sender.USER ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.message,
      })),
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    await prisma.aIChatMessage.create({
      data: { sessionId, sender: Sender.AI, message: aiMessage },
    });

    return { sessionId, message: aiMessage };
  }

  async generateQuiz(_userId: string, input: GenerateQuizInput) {
    const client = this.ensureOpenAI();

    const lesson = await prisma.lesson.findUnique({
      where: { id: input.lessonId },
      include: { course: true, quizzes: true },
    });
    if (!lesson) throw new ApiError(404, 'Lesson not found');

    const prompt = `Generate ${input.questionCount} multiple choice quiz questions based on this lesson content.
Return ONLY valid JSON array with format:
[{"text":"question","options":["A","B","C","D"],"correctOptionIndex":0}]

Lesson Title: ${lesson.title}
Content:
${lesson.content}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a quiz generator. Return only valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{"questions":[]}';
    let questions: Array<{ text: string; options: string[]; correctOptionIndex: number }>;

    try {
      const parsed = JSON.parse(raw);
      questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch {
      throw new ApiError(500, 'Failed to parse AI-generated quiz');
    }

    if (questions.length === 0) {
      throw new ApiError(500, 'AI did not generate any questions');
    }

    const quiz = await prisma.quiz.create({
      data: {
        lessonId: input.lessonId,
        title: `AI Quiz: ${lesson.title}`,
        passingScore: 70,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
          })),
        },
      },
      include: { questions: true },
    });

    return quiz;
  }

  async speechToText(audioBuffer: Buffer, mimeType: string): Promise<{ transcription: string }> {
    if (!config.nvidiaApiKey) {
      throw new ApiError(503, 'Nvidia Riva is not configured');
    }

    const base64Audio = audioBuffer.toString('base64');

    const response = await fetch(config.nvidiaRivaUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.nvidiaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: {
          content: base64Audio,
          encoding: mimeType.includes('wav') ? 'LINEAR_PCM' : 'OGG_OPUS',
          sample_rate_hertz: 16000,
        },
        config: {
          language_code: 'en-US',
          enable_automatic_punctuation: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(502, `Nvidia Riva transcription failed: ${errorText}`);
    }

    const data = (await response.json()) as { results?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
    const transcription =
      data.results?.[0]?.alternatives?.[0]?.transcript || '';

    if (!transcription) {
      throw new ApiError(422, 'Could not transcribe audio');
    }

    return { transcription };
  }
}

export const aiService = new AiService();
