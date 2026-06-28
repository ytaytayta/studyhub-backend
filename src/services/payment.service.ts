import Stripe from 'stripe';
import { Plan, PaymentStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';
import type { CreateCheckoutInput } from '../validators/payment.validator';

const PLAN_PRICES: Record<string, number> = {
  PRO: 9.99,
  CLASSROOM: 29.99,
};

function getStripe(): Stripe {
  if (!config.stripeSecretKey) {
    throw new ApiError(503, 'Stripe is not configured');
  }
  return new Stripe(config.stripeSecretKey);
}

export class PaymentService {
  async createCheckout(userId: string, input: CreateCheckoutInput) {
    const stripe = getStripe();
    let amount = 0;
    let description = '';
    let metadata: Record<string, string> = { userId, method: input.method };

    if (input.courseId) {
      const course = await prisma.course.findUnique({ where: { id: input.courseId } });
      if (!course) throw new ApiError(404, 'Course not found');
      amount = course.price;
      description = `Enrollment: ${course.title}`;
      metadata.courseId = course.id;
    } else if (input.plan) {
      amount = PLAN_PRICES[input.plan] || 0;
      description = `Plan upgrade: ${input.plan}`;
      metadata.plan = input.plan;
    }

    if (amount <= 0) {
      throw new ApiError(400, 'Invalid payment amount');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: description },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${config.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/payment/cancel`,
      metadata,
    });

    await prisma.payment.create({
      data: {
        userId,
        courseId: input.courseId,
        plan: input.plan as Plan | undefined,
        amount,
        status: PaymentStatus.PENDING,
        method: input.method,
        stripeSessionId: session.id,
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const stripe = getStripe();

    if (!config.stripeWebhookSecret) {
      throw new ApiError(503, 'Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);
    } catch (err) {
      throw new ApiError(400, `Webhook signature verification failed: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await prisma.payment.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.PAID },
        });

        if (payment.courseId) {
          await prisma.enrollment.upsert({
            where: {
              userId_courseId: { userId: payment.userId, courseId: payment.courseId },
            },
            update: { paymentStatus: PaymentStatus.PAID },
            create: {
              userId: payment.userId,
              courseId: payment.courseId,
              paymentStatus: PaymentStatus.PAID,
            },
          });
        }

        if (payment.plan) {
          await prisma.user.update({
            where: { id: payment.userId },
            data: { plan: payment.plan },
          });
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return { received: true };
  }
}

export const paymentService = new PaymentService();
