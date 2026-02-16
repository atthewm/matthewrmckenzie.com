"use client";

import React, { useEffect } from "react";
import { useOpenInBrowser } from "@/lib/browserStore";

// ============================================================================
// SCHEDULE APP - Opens Cal.com in the in-OS Browser
// ============================================================================

export default function ScheduleApp() {
  const openInBrowser = useOpenInBrowser();

  useEffect(() => {
    openInBrowser("https://cal.com/mattmck/site", "Schedule");
  }, [openInBrowser]);

  return (
    <div className="flex items-center justify-center h-full text-[11px] text-desktop-text-secondary">
      Opening Schedule in Browser...
    </div>
  );
}
