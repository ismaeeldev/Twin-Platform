import { PrismaClient } from "@prisma/client"

/**
 * Prisma client singleton — reused across hot reloads in dev so we don't
 * exhaust Neon's connection limit by creating a new client per request.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
