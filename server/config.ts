import { z } from "zod";

const optionalUrl = z.string().url().optional();

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(3).optional(),
  APP_URL: optionalUrl,
});

export type ServerEnvironment = z.infer<typeof environmentSchema>;

export function getServerEnvironment(): ServerEnvironment {
  return environmentSchema.parse(process.env);
}
