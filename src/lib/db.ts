import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In development: log slow queries (>500ms) and errors to the console.
// In production: only log errors to avoid log spam.
function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// In dev, reuse the same client across HMR (Hot Module Replacement) reloads
// to prevent Supabase connection pool exhaustion.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
