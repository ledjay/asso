/**
 * NextAuth.js v5 setup
 * Main auth export
 */

import NextAuth from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "./config";

const nextAuth = NextAuth(authConfig);

export const handlers: { GET: any; POST: any } = nextAuth.handlers;
export const auth = nextAuth.auth as () => Promise<Session | null>;
export const signIn: any = nextAuth.signIn;
export const signOut = nextAuth.signOut;

// Export middleware wrapper for use in middleware.ts
export const authMiddleware: typeof nextAuth.auth = nextAuth.auth;

export { authConfig } from "./config";
export { useSession } from "./hooks";
