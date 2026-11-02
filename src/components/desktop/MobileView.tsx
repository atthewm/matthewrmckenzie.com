"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar, Contact } from "lucide-react";
import { getRootItems, findFSItem, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { profile } from "@/config/profile";
import { PantherIcon } from "./PantherIcons";
import WindowContent from "./WindowContent";

// ============================================================================
// MOBILE VIEW
// ============================================================================
// Phone layout: a home screen of apps, and each opened item full screen.
// Shares the desktop store, so anything that calls openItem (Spotlight, Start
// Here, folder lists, ?open= links) shows up here. Back closes the top window.
// ============================================================================

interface MobileViewProps {
  contentMap: Record<string, string>;
}

export default function MobileView({ contentMap }: MobileViewProps) {
  const { state, openItem, closeWindow, dispatch } = useDesktop();
  const rootItems = getRootItems();
  const startedRef = useRef(false);

  // Start every phone visit on the home screen; honor ?open=<id> deep links.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    dispatch({ type: "CLOSE_ALL_WINDOWS" });
    const id = new URLSearchParams(window.location.search).get("open");
    const item = id ? findFSItem(id) : undefined;
    if (item) {
      openItem(item);
      window.history.replaceState({}, "", "/");
    }
  }, [dispatch, openItem]);

  const top = useMemo(
    () =>
      [...state.windows]
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0],
    [state.windows],
  );
  const currentItem = top ? findFSItem(top.fsItemId) : undefined;

  function open(item: FSItem) {
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    openItem(item);
  }

  if (top && currentItem) {
    return (
      <div className="fixed inset-0 bg-desktop-surface flex flex-col z-50">
        <div className="flex items-center h-12 px-2 border-b border-desktop-border shrink-0 safe-area-top">
          <button
            onClick={() => closeWindow(top.id)}
            className="flex items-center gap-1 text-desktop-accent text-sm px-2 py-2"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex-1 text-center text-sm font-semibold text-desktop-text truncate px-2">
            {currentItem.name}
          </div>
          <div className="w-16" />
        </div>
        <div className="flex-1 overflow-auto overscroll-contain">
          {currentItem.type === "folder" ? (
            <MobileFolderView item={currentItem} onOpen={open} />
          ) : (
            <WindowContent windowState={top} contentMap={contentMap} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: "#151619", color: "#ecebe7" }}>
      <div className="safe-area-top px-5 pt-10 pb-10 max-w-md mx-auto">
        <p style={{ color: "#cfae6b" }} className="font-mono text-[11px] uppercase tracking-[0.16em]">
          {profile.company} &middot; {profile.primaryCity}
        </p>
        <h1 className="text-[34px] leading-[1.05] mt-3" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          {profile.fullName}
        </h1>
        <p className="text-[15px] mt-2 leading-snug" style={{ color: "#a3a4aa" }}>
          {profile.title}. Private wealth, family offices, and RIAs.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-6">
          <QuickAction href="/card" label="Save contact" icon={<Contact size={16} />} />
          <QuickAction href="/contact" label="Email" icon={<Mail size={16} />} />
          <QuickAction href={profile.scheduleUrl} label="Schedule" icon={<Calendar size={16} />} external />
        </div>

        <div className="mt-9 flex items-baseline justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#a3a4aa" }}>
            McKenzie OS
          </p>
          <Link href="/about" className="text-[12px] underline underline-offset-4" style={{ color: "#a3a4aa" }}>
            Reading view
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-y-5 gap-x-2 mt-4">
          {rootItems.map((item) => (
            <button
              key={item.id}
              onClick={() => open(item)}
              className="flex flex-col items-center gap-1.5 min-w-0"
              aria-label={`Open ${item.name}`}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border active:scale-95 transition-transform"
                   style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.08)" }}>
                <PantherIcon itemId={item.id} size={36} />
              </div>
              <span className="text-[11px] text-center leading-tight w-full truncate" style={{ color: "#ecebe7" }}>
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label, icon, external = false }: { href: string; label: string; icon: React.ReactNode; external?: boolean }) {
  const cls = "flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border text-[12px] active:scale-[0.98] transition-transform";
  const style = { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#ecebe7" };
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
      {icon}
      {label}
    </a>
  ) : (
    <Link href={href} className={cls} style={style}>
      {icon}
      {label}
    </Link>
  );
}

function MobileFolderView({ item, onOpen }: { item: FSItem; onOpen: (item: FSItem) => void }) {
  if (!item.children?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-desktop-text-secondary text-sm">
        This folder is empty.
      </div>
    );
  }
  return (
    <div className="p-2">
      {item.children.filter((c) => !c.hidden).map((child) => (
        <button
          key={child.id}
          onClick={() => onOpen(child)}
          className="w-full flex items-center gap-3 p-3 rounded-xl active:bg-desktop-border/60 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <PantherIcon itemId={child.id} size={32} />
          </div>
          <div className="text-left min-w-0">
            <div className="text-[15px] font-medium text-desktop-text truncate">{child.name}</div>
            {child.description && (
              <div className="text-[13px] text-desktop-text-secondary line-clamp-1">{child.description}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
