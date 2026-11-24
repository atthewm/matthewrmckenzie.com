"use client";

import { useEffect } from "react";
import { profile } from "@/config/profile";
import { trackEvent } from "@/lib/analytics";

export default function CalEmbed() {
  useEffect(() => {
    trackEvent("cal_embed_viewed", { page: "contact" });
  }, []);

  return (
    <iframe
      title="Schedule an intro meeting with Matthew McKenzie"
      src={profile.scheduleUrl}
      loading="lazy"
      className="block h-[520px] w-full rounded-lg border border-desktop-border sm:h-[560px] lg:h-[640px]"
    />
  );
}
