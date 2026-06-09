import { useState, useEffect } from "react";

// SSR-safe hook for the `prefers-reduced-motion: reduce` media query.
// Returns false during render (server and first client paint), then updates
// from the media query after mount and on changes.
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}
