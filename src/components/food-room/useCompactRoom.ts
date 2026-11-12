import { useEffect, useState } from "react";

const PHONE_QUERY = "(max-width: 640px)";

/** True on phone-width screens, where the room switches to its tall layout. */
export function useCompactRoom(): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}
