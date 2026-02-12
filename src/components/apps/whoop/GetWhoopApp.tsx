"use client";

import React, { useState, useCallback } from "react";
import { whoopReferral } from "@/data/whoop/dashboard";

export default function GetWhoopApp() {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(whoopReferral.communityCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }, []);

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-6 text-center"
      style={{
        background: "linear-gradient(180deg, #0d1b2a 0%, #091219 100%)",
        color: "#e0e0e0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg, #00f19b 0%, #00b4e6 100%)",
          boxShadow: "0 4px 20px rgba(0,241,155,0.2)",
        }}
      >
        <span className="text-black font-black text-lg tracking-tighter">W</span>
      </div>
      <h2 className="text-base font-bold text-white mb-1">Try WHOOP</h2>
      <p className="text-xs text-gray-400 max-w-[240px] mb-5">
        The wearable that tracks your recovery, strain, and sleep so you can optimize your performance.
      </p>
      
        href={whoopReferral.joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-[220px] py-2.5 rounded-md text-sm font-medium text-center text-black transition-all hover:brightness-110 mb-4"
        style={{
          background: "linear-gradient(180deg, #00f19b 0%, #00c77d 100%)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        Join WHOOP
      </a>
      <div
        className="rounded-lg px-4 py-3 w-full max-w-[220px]"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Community Code</p>
        <button
          onClick={handleCopyCode}
          className="text-sm font-mono font-bold text-[#00f19b] hover:text-[#00f19b]/80 transition-colors"
          title="Click to copy"
        >
          {copiedCode ? "Copied!" : whoopReferral.communityCode}
        </button>
      </div>
    </div>
  );
}
