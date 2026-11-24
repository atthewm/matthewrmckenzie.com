import "server-only";
import { hasGatePermission } from "./gate-session";
export { ADMIN_COOKIE, GUEST_COOKIE, SESSION_HINT_COOKIE, GATE_MAX_AGE } from "./gate-session";
export const MIN_ADMIN_PASSWORD_LENGTH = 16;

export function isAdminRequest(request: Request) {
  return hasGatePermission(request, "admin");
}

export function isGuestRequest(request: Request) {
  return hasGatePermission(request, "guest");
}
