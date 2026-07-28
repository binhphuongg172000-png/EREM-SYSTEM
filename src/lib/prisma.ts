import { PrismaClient } from '@prisma/client'

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL;
  // Append connection pool settings for faster queries
  const optimizedUrl = url && !url.includes('connection_limit')
    ? `${url}${url.includes('?') ? '&' : '?'}connection_limit=10&pool_timeout=10&connect_timeout=5`
    : url;

  return new PrismaClient({
    datasources: optimizedUrl ? { db: { url: optimizedUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? [] : [],
  });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof createPrismaClient>
}

const prisma = globalThis.prismaGlobal ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// Eager connect to avoid cold-start latency on first request
prisma.$connect().catch(() => {});

export default prisma
