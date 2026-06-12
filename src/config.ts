import { z } from 'zod';

const envSchema = z.object({
  GITHUB_TOKEN: z.string().min(1, 'GITHUB_TOKEN is required'),
  REDIS_URL: z.string().optional(),
  NVIDIA_API_KEY: z.string().min(1).optional(),
  NVIDIA_MODEL: z.string().default('meta/llama-3.1-8b-instruct'),
  PORT: z.coerce.number().int().positive().default(3000),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(21600),
  SCORE_THRESHOLD: z.coerce.number().int().min(0).max(20).default(14),
});

export type Config = z.infer<typeof envSchema>;

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  cachedConfig = result.data;
  return cachedConfig;
}
