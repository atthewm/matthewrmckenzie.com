"use client";

import React, { useState } from "react";
import {
  whoopStats,
  whoopScreenshots,
  statGroups,
  type WhoopScreenshot,
} from "@/data/whoop/dashboard";
import * as Icons from "lucide-react";

const iconMap = Icons as unknown as Record
  string,
  React.ComponentType<{ size?: number; className?: string }>
>;

function StatIcon({ name, size = 14, className = "" }: { name: string; size?: number; className?: string }) {
  const Comp = iconMap[name];
  if (!Comp) return null;
  return <Comp size={size} className={className} />;
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 text-white/70 hover:text-white text-sm"
        >
          Close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
        />
      </div>
    </div>
  );
}

function ScreenshotCollage({
  screenshots,
  onSelect,
}: {
  screenshots: WhoopScreenshot[];
  onSelect: (s: WhoopScreenshot) => void;
}) {
  const [loadErrors, setLoadErrors] = useState<Set<string>>(new Set());

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {screenshots.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className="relative aspect-[9/16] rounded-lg overflow-hidden bg-[#1a2332] hover:ring-2 hover:ring-[#00f19b]/50 transition-all group"
          title={s.label}
        >
          {!loadErrors.has(s.id) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={s.path}
              alt={s.label}
              className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity"
              onError={() => setLoadErrors((prev) => new Set(prev).add(s.id))}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-500 p-1 text-center">
              {s.label}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, unit, iconKey }: { label: string; value: string; unit?: string; iconKey: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
      style={{
        background: "linear-gradient(135deg, rgba(0,241,155,0.06) 0%, rgba(0,180,230,0.04) 100%)",
        border: "1px solid rgba(0,241,155,0.1)",
      }}
    >
      <div className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-[#00f19b]/10">
        <StatIcon name={iconKey} size={14} className="text-[#00f19b]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 leading-tight truncate">{label}</p>
        <p className="text-sm font-bold text-white leading-tight">
          {value}
          {unit && <span className="text-[10px] font-normal text-gray-400 ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export default function WhoopDashboardApp() {
  const [lightboxImg, setLightboxImg] = useState<WhoopScreenshot | null>(null);

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0d1b2a 0%, #0b1622 50%, #091219 100%)",
        color: "#e0e0e0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {lightboxImg && (
        <Lightbox src={lightboxImg.path} alt={lightboxImg.label} onClose={() => setLightboxImg(null)} />
      )}
      <div className="p-4 space-y-5 max-w-[680px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00f19b 0%, #00b4e6 100%)" }}>
            <StatIcon name="Activity" size={18} className="text-black" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">WHOOP Dashboard</h1>
            <p className="text-[10px] text-gray-500 tracking-wide uppercase">@atthewm</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Screenshots</p>
          <ScreenshotCollage screenshots={whoopScreenshots} onSelect={(s) => setLightboxImg(s)} />
          <p className="text-[8px] text-gray-600 mt-1 text-center">Click to enlarge</p>
        </div>
        {statGroups.map((group) => {
          const stats = whoopStats.filter((s) => s.group === group.key);
          if (stats.length === 0) return null;
          return (
            <div key={group.key}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{group.label}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {stats.map((stat) => (
                  <StatCard key={stat.label} label={stat.label} value={stat.value} unit={stat.unit} iconKey={stat.iconKey} />
                ))}
              </div>
            </div>
          );
        })}
        <p className="text-[9px] text-gray-600 text-center pt-2 pb-4">Source: WHOOP app screenshots (Feb 2026)</p>
      </div>
    </div>
  );
}
