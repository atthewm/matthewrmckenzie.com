"use client";

import React from "react";
import { findFSItem } from "@/data/fs";
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

// ============================================================================
// WINDOW CONTENT RESOLVER
// ============================================================================
// Resolves the correct component to render inside a window based on the
// file system item type and configuration.
// ============================================================================

interface WindowContentProps {
  windowState: WindowState;
  contentMap: Record<string, string>; // fsItemId -> HTML content
}

const appComponents: Record<string, React.ComponentType<{ contentHtml?: string }>> = {
  AboutApp,
  ProjectsApp,
  ContactApp,
  GalleryApp,
  SettingsApp,
  SoundCloudPlayer,
  YouTubeWinampPlayer,
  AppleMusicFolder,
};

export default function WindowContent({ windowState, contentMap }: WindowContentProps) {
  const fsItem = findFSItem(windowState.fsItemId);
  if (!fsItem) {
    return (
      <div className="p-5 text-sm text-desktop-text-secondary">
        Item not found: {windowState.fsItemId}
      </div>
    );
  }

  // Folder → show children as icons
  if (fsItem.type === "folder") {
    return <FolderView item={fsItem} />;
  }

  // App → render the associated component
  if (fsItem.type === "app" && fsItem.appComponent) {
    const Component = appComponents[fsItem.appComponent];
    if (Component) {
      return <Component contentHtml={contentMap[fsItem.id]} />;
    }
  }

  // Document → render markdown
  if (fsItem.type === "document") {
    const html = contentMap[fsItem.id];
    if (html) {
      return <MarkdownViewer html={html} />;
    }
    return (
      <div className="p-5 text-sm text-desktop-text-secondary">
        No content found for "{fsItem.name}".
        {fsItem.contentPath && (
          <span> Create <code className="text-xs bg-desktop-border/50 px-1 py-0.5 rounded">src/content/{fsItem.contentPath}</code> to add content.</span>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 text-sm text-desktop-text-secondary">
      Unknown item type.
    </div>
  );
}
