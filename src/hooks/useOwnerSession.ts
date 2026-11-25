"use client";

import { useEffect, useState } from "react";

// ============================================================================
// OWNER SESSION (client)
// ============================================================================
// Tells the desktop whether this browser is signed in as Matt, so owner-only
// things (the Life and Nutrition apps, the full WHOOP feed, guestbook
// moderation) can show.
//
// The real cookies are httpOnly and invisible here. Signing in at /gate also
// sets a readable hint cookie; only browsers that carry it ask /api/auth who
// they are, so ordinary visitors never make that request. The hint grants
// nothing: every protected route checks the httpOnly cookies itself.
// ============================================================================

export interface OwnerSession {
  /** Carries the admin cookie: guestbook moderation, private Notion fields. */
  admin: boolean;
  /** Carries the owner cookie: Life, Nutrition, the full WHOOP feed, WHOOP controls. */
  owner: boolean;
}

const SESSION_HINT_COOKIE = "mmck_session";
const SIGNED_OUT: OwnerSession = { admin: false, owner: false };

let pending: Promise<OwnerSession> | null = null;

const GATE_CHANGE = "mmck_gate_changed";

/** A full navigation drops owner-only data held by open windows in this document. */
export function finishGateChange(destination: string) {
  try { localStorage.setItem(GATE_CHANGE, crypto.randomUUID()); } catch { /* Storage can be disabled. */ }
  window.location.replace(destination);
}

function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${SESSION_HINT_COOKIE}=`));
}

/** Who this browser is. One request per page load, and none without the hint. */
export function fetchOwnerSession(): Promise<OwnerSession> {
  if (!hasSessionHint()) return Promise.resolve(SIGNED_OUT);
  pending ??= fetch("/api/auth", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : SIGNED_OUT))
    .then((body: Partial<OwnerSession>) => ({ admin: body.admin === true, owner: body.owner === true }))
    .catch(() => SIGNED_OUT);
  return pending;
}

export interface OwnerSessionState extends OwnerSession {
  /** False until the answer is in. Treat "not ready" as signed out. */
  ready: boolean;
}

export function useOwnerSession(): OwnerSessionState {
  const [state, setState] = useState<OwnerSessionState>({ ...SIGNED_OUT, ready: false });

  useEffect(() => {
    let alive = true;
    fetchOwnerSession().then((session) => {
      if (alive) setState({ ...session, ready: true });
    });
    function refreshOnGateChange(event: StorageEvent) {
      if (event.key === GATE_CHANGE) window.location.reload();
    }
    function refreshOnRestore(event: PageTransitionEvent) {
      if (event.persisted && (pending || hasSessionHint())) window.location.reload();
    }
    window.addEventListener("storage", refreshOnGateChange);
    window.addEventListener("pageshow", refreshOnRestore);
    return () => {
      window.removeEventListener("storage", refreshOnGateChange);
      window.removeEventListener("pageshow", refreshOnRestore);
      alive = false;
    };
  }, []);

  return state;
}
