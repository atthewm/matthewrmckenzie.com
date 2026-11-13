"use client";

import React from "react";
import { findFSItem, type FSItem } from "@/data/fs";
import type { WindowState } from "@/hooks/useDesktopStore";
import dynamic from "next/dynamic";
import BoardView from "@/components/board/BoardView";
import AquaLoading from "@/components/ui/AquaLoading";

// Each app is its own chunk, loaded when its window first opens.
function Loading() {
  return <AquaLoading label="Opening" lines={3} />;
}

const AboutApp = dynamic(() => import("@/components/apps/AboutApp"), { loading: Loading });
const WorkOverviewApp = dynamic(() => import("@/components/apps/WorkOverviewApp"), { loading: Loading });
const FoodRoomApp = dynamic(() => import("@/components/apps/FoodRoomApp"), { loading: Loading });
const TurntableApp = dynamic(() => import("@/components/apps/TurntableApp"), { loading: Loading });
const ContactApp = dynamic(() => import("@/components/apps/ContactApp"), { loading: Loading });
const GalleryApp = dynamic(() => import("@/components/apps/GalleryApp"), { loading: Loading });
const MarkdownViewer = dynamic(() => import("@/components/apps/MarkdownViewer"), { loading: Loading });
const SettingsApp = dynamic(() => import("@/components/settings/SettingsApp"), { loading: Loading });
const SoundCloudPlayer = dynamic(() => import("@/components/players/SoundCloudPlayer"), { loading: Loading });
const YouTubeWinampPlayer = dynamic(() => import("@/components/players/YouTubeWinampPlayer"), { loading: Loading });
const ZunePlayer = dynamic(() => import("@/components/players/ZunePlayer"), { loading: Loading });
const AppleMusicFolder = dynamic(() => import("@/components/apps/AppleMusicFolder"), { loading: Loading });
const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp"), { loading: Loading });
const RecipeViewer = dynamic(() => import("@/components/apps/RecipeViewer"), { loading: Loading });
const InstagramApp = dynamic(() => import("@/components/apps/InstagramApp"), { loading: Loading });
const BrowserApp = dynamic(() => import("@/components/apps/BrowserApp"), { loading: Loading });
const WhoopDashboardApp = dynamic(() => import("@/components/apps/whoop/WhoopDashboardApp"), { loading: Loading });
const WhoopSplitApp = dynamic(() => import("@/components/apps/whoop/WhoopSplitApp"), { loading: Loading });
const GetWhoopApp = dynamic(() => import("@/components/apps/whoop/GetWhoopApp"), { loading: Loading });
const StartHereApp = dynamic(() => import("@/components/apps/StartHereApp"), { loading: Loading });
const TerminalApp = dynamic(() => import("@/components/apps/TerminalApp"), { loading: Loading });
const StickiesApp = dynamic(() => import("@/components/apps/StickiesApp"), { loading: Loading });
const GuestbookApp = dynamic(() => import("@/components/apps/GuestbookApp"), { loading: Loading });
const LinktreeApp = dynamic(() => import("@/components/apps/LinktreeApp"), { loading: Loading });
const ScheduleApp = dynamic(() => import("@/components/apps/ScheduleApp"), { loading: Loading });
const PhotoBoothApp = dynamic(() => import("@/components/apps/PhotoBoothApp"), { loading: Loading });
const IChatApp = dynamic(() => import("@/components/apps/IChatApp"), { loading: Loading });
const ChessApp = dynamic(() => import("@/components/apps/ChessApp"), { loading: Loading });
const MinesweeperApp = dynamic(() => import("@/components/apps/MinesweeperApp"), { loading: Loading });
const WhatsNewApp = dynamic(() => import("@/components/apps/WhatsNewApp"), { loading: Loading });
const NutritionApp = dynamic(() => import("@/components/apps/NutritionApp"), { loading: Loading });
const MediaShelfApp = dynamic(() => import("@/components/apps/MediaShelfApp"), { loading: Loading });
const TopFoodsApp = dynamic(() => import("@/components/apps/TopFoodsApp"), { loading: Loading });
const RecipesApp = dynamic(() => import("@/components/apps/RecipesApp"), { loading: Loading });
const LifeDashboardApp = dynamic(() => import("@/components/apps/life/LifeDashboardApp"), { loading: Loading });
const BusinessCardApp = dynamic(() => import("@/components/apps/BusinessCardApp"), { loading: Loading });
const HobbiesApp = dynamic(() => import("@/components/apps/HobbiesApp"), { loading: Loading });


interface WindowContentProps {
  windowState: WindowState;
  contentMap: Record<string, string>;
}

const appComponents: Record<string, React.ComponentType<{ contentHtml?: string; fsItem?: FSItem }>> = {
  AboutApp,
  WorkOverviewApp,
  FoodRoomApp,
  TurntableApp,
  ContactApp,
  GalleryApp,
  SettingsApp,
  SoundCloudPlayer,
  YouTubeWinampPlayer,
  ZunePlayer,
  AppleMusicFolder,
  ResumeApp,
  RecipeViewer,
  InstagramApp,
  BrowserApp,
  WhoopDashboardApp,
  WhoopSplitApp,
  GetWhoopApp,
  StartHereApp,
  TerminalApp,
  StickiesApp,
  GuestbookApp,
  LinktreeApp,
  ScheduleApp,
  PhotoBoothApp,
  IChatApp,
  ChessApp,
  MinesweeperApp,
  WhatsNewApp,
  NutritionApp,
  MediaShelfApp,
  TopFoodsApp,
  RecipesApp,
  LifeDashboardApp,
  BusinessCardApp,
  HobbiesApp,
};

export default function WindowContent({ windowState, contentMap }: WindowContentProps) {
  const fsItem = findFSItem(windowState.fsItemId);
  if (!fsItem) {
    return <div className="p-5 text-sm text-desktop-text-secondary">Item not found.</div>;
  }
  if (fsItem.type === "folder") {
    return <BoardView item={fsItem} contentMap={contentMap} windowId={windowState.id} />;
  }
  if (fsItem.type === "app" && fsItem.appComponent) {
    const Component = appComponents[fsItem.appComponent];
    if (Component) {
      return <Component contentHtml={contentMap[fsItem.id]} fsItem={fsItem} />;
    }
  }
  if (fsItem.type === "document") {
    const html = contentMap[fsItem.id];
    if (html) {
      return <MarkdownViewer html={html} title={fsItem.name} />;
    }
    return (
      <div className="p-5 text-sm text-desktop-text-secondary">
        No content found for &ldquo;{fsItem.name}&rdquo;.
      </div>
    );
  }
  return <div className="p-5 text-sm text-desktop-text-secondary">Unknown item type.</div>;
}
