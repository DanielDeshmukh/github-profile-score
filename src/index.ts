import { buildApp, startServer } from './server.js';

async function main(): Promise<void> {
  try {
    const app = await buildApp();
    startServer(app);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
