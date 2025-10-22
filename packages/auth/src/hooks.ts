/**
 * React hooks for authentication
 * Client and server-side auth helpers
 */

import { useSession as useNextAuthSession } from "next-auth/react";

/**
 * Client-side hook to get current session
 * Use in Client Components
 */
export function useSession() {
  return useNextAuthSession();
}
