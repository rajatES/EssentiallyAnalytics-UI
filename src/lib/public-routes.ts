/**
 * Routes that must render without a login session.
 *
 * Meta's App Review crawls the Privacy Policy, Terms of Service and User Data
 * Deletion URLs anonymously — if any of them redirect to /login the submission
 * is rejected. Keep this list as the single source of truth so the auth check
 * and the layout chrome can never drift apart.
 */
export const PUBLIC_ROUTES = [
  "/login",
  "/privacy",
  "/terms",
  "/data-deletion",
] as const;

export function isPublicRoute(pathname: string | null): boolean {
  return PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]);
}
