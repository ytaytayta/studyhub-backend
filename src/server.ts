import app from './app';
import { config } from './config';
import prisma from './utils/prisma';

const server = app.listen(config.port, () => {
  console.log(`StudyHub AI Backend running on port ${config.port} [${config.nodeEnv}]`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
