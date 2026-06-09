"use client";

import React, { createContext, useContext } from "react";

// ---------------------------------------------------------------------------
// Shutdown context. Lets any component trigger a shutdown sequence.
// Extracted into its own module so consumers like MenuBar do not import from
// DesktopShell, which would otherwise create a render cycle.
// ---------------------------------------------------------------------------

const ShutdownContext = createContext<(() => void) | null>(null);

export function ShutdownProvider({
  value,
  children,
}: {
  value: () => void;
  children: React.ReactNode;
}) {
  return (
    <ShutdownContext.Provider value={value}>{children}</ShutdownContext.Provider>
  );
}

export function useShutdown(): () => void {
  const fn = useContext(ShutdownContext);
  return fn || (() => {});
}
