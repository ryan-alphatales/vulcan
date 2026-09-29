import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL must be configured before database access.");
  // Railway's public PostgreSQL proxy requires TLS. Keep certificate
  // verification enabled and make TLS an explicit deployment setting so
  // local Postgres continues to work without it.
  const ssl = process.env.DATABASE_SSL === "true";
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, ...(ssl ? { ssl: true } : {}) }) });
}

export function getPrisma(): PrismaClient {
  const client = globalForPrisma.prisma ?? createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
