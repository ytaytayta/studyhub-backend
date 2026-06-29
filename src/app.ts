import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { generalLimiter } from './middlewares/rateLimiter';
import { webhook } from './controllers/payment.controller';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

// ✅ CORS terbuka untuk development (semua origin diizinkan)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  webhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(generalLimiter);
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;