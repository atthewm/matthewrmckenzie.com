"use client";

import React, { useEffect } from "react";
import { useOpenInBrowser } from "@/lib/browserStore";

// ============================================================================
// LINKTREE APP - Opens Linktree in the in-OS Browser
// ============================================================================

export default function LinktreeApp() {
  const openInBrowser = useOpenInBrowser();

  useEffect(() => {
    openInBrowser("https://mckm.at/", "Linktree");
  }, [openInBrowser]);

  return (
    <div className="flex items-center justify-center h-full text-[11px] text-desktop-text-secondary">
      Opening Linktree in Browser...
    </div>
  );
}
