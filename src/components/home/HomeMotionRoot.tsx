"use client";

import { useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";

// ============================================================================
// HOME MOTION ROOT (Client Component)
// ============================================================================
// Wraps the server-rendered homepage sections and gives the motion layer a
// scope. GSAP lives in HomeMotion, which is loaded with a dynamic import after
// hydration, so it is never part of the first bundle and never blocks paint.
// ============================================================================

const HomeMotion = dynamic(() => import("./HomeMotion"), { ssr: false });

export default function HomeMotionRoot({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scopeRef} className="home">
      {children}
      <HomeMotion scope={scopeRef} />
    </div>
  );
}
