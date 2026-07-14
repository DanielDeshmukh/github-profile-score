import { buildApp } from '../src/server.js';

let app: Awaited<ReturnType<typeof buildApp>> | null = null;

async function getApp() {
  if (!app) {
    app = await buildApp();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const expressApp = await getApp();
  return expressApp(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
