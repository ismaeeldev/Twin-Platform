import type { DefaultSession } from "next-auth"

/**
 * Module augmentation adding `id` to the session user and JWT token —
 * NextAuth's defaults don't include it, but lib/auth.ts's callbacks set it.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}
