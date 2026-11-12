import { useEffect, useState } from "react";

const PHONE_QUERY = "(max-width: 640px)";

/**
 * True on phone-width screens, where the room switches to its tall layout.
 * Null until the browser has been asked, so the room is not drawn in one
 * layout and then redrawn in the other.
 */
export function useCompactRoom(): boolean | null {
  const [compact, setCompact] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}
