import "server-only";
import { hasGatePermission } from "./gate-session";
export { OWNER_COOKIE } from "./gate-session";

export function isOwnerRequest(request: Request) {
  return hasGatePermission(request, "owner");
}

export const NO_STORE = { "Cache-Control": "private, no-store" } as const;
