"use client";

import React from "react";
import { findFSItem, type FSItem } from "@/data/fs";
import type { WindowState } from "@/hooks/useDesktopStore";
import FolderView from "@/components/apps/FolderView";
import AboutApp from "@/components/apps/AboutApp";
import ProjectsApp from "@/components/apps/ProjectsApp";
import ContactApp from "@/components/apps/ContactApp";
import GalleryApp from "@/components/apps/GalleryApp";
import MarkdownViewer from "@/components/apps/MarkdownViewer";
import SettingsApp from "@/components/settings/SettingsApp";
import SoundCloudPlayer from "@/components/players/SoundCloudPlayer";
import YouTubeWinampPlayer from "@/components/players/YouTubeWinampPlayer";
import AppleMusicFolder from "@/components/apps/AppleMusicFolder";
import ResumeApp from "@/components/apps/ResumeApp";
import RecipeViewer from "@/components/apps/RecipeViewer";
import InstagramApp from "@/components/apps/InstagramApp";
import WhoopDashboardApp from "@/components/apps/whoop/WhoopDashboardApp";
import WhoopSplitApp from "@/components/apps/whoop/WhoopSplitApp";
import GetWhoopApp from "@/components/apps/whoop/GetWhoopApp";

interface WindowContentProps {
  windowState: WindowState;
  contentMap: Record<string, string>;
}

const appComponents: Record<string, React.ComponentType<{ contentHtml?: string; fsItem?: FSItem }>> = {
  AboutApp,
  ProjectsApp,
  ContactApp,
  GalleryApp,
  SettingsApp,
  SoundCloudPlayer,
  YouTubeWinampPlayer,
  AppleMusicFolder,
  ResumeApp,
  RecipeViewer,
  InstagramApp,
  WhoopDashboardApp,
  WhoopSplitApp,
  GetWhoopApp,
};

export default function WindowContent({ windowState, contentMap }: WindowContentProps) {
  const fsItem = findFSItem(windowState.fsItemId);
  if (!fsItem) {
    return <div className="p-5 text-sm text-desktop-text-secondary">Item not found: {windowState.fsItemId}</div>;
  }
  if (fsItem.type === "folder") {
    return <FolderView item={fsItem} />;
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
        {fsItem.contentPath && (
          <span> Create <code className="text-xs bg-desktop-border/50 px-1 py-0.5 rounded">src/content/{fsItem.contentPath}</code> to add content.</span>
        )}
      </div>
    );
  }
  return <div className="p-5 text-sm text-desktop-text-secondary">Unknown item type.</div>;
}
