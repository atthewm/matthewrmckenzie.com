import { useSyncExternalStore } from "react";

const PHONE = "(max-width: 767px)";

function subscribe(listener: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function snapshot(): "phone" | "desktop" {
  return window.matchMedia(PHONE).matches ? "phone" : "desktop";
}

/** Null during SSR and initial hydration; the static CSS layout already matches this viewport. */
export function useViewport() {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export function useIsMobile(): boolean {
  return useViewport() === "phone";
}
