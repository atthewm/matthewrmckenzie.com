"use client";

import React, { memo } from "react";
import type { FSItem } from "@/data/fs";
import { getRecipeBySlug } from "@/content/recipes/index";
import { findSplitByFsId } from "@/data/whoop/splits";
import { PantherIcon } from "@/components/desktop/PantherIcons";
import { CARD_SIZES, type CardKind } from "@/lib/boardLayout";
import type { BoardFastener } from "@/config/boards";

// ============================================================================
// BOARD CARD
// ============================================================================
// One pinned thing on a board. The look depends on what it is: recipes are
// index cards, workouts are taped gym-log sheets, documents are paper,
// everything else is a polaroid of its icon. Pointer handling lives in
// BoardView; this component only renders and handles keyboard input.
// ============================================================================

interface BoardCardProps {
  item: FSItem;
  kind: CardKind;
  x: number;
  y: number;
  rotation: number;
  z: number;
  fastener: BoardFastener;
  pinColor: string;
  isDragging: boolean;
  isOverBackpack: boolean;
  onKeyDown: (e: React.KeyboardEvent, item: FSItem) => void;
}

function Fastener({ type, color }: { type: BoardFastener; color: string }) {
  if (type === "tape") return <span className="board-tape" aria-hidden />;
  return (
    <span className="board-pin" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 22 22">
        <ellipse cx="12" cy="15" rx="7" ry="3" fill="rgba(0,0,0,0.25)" />
        <circle cx="11" cy="10" r="7" fill={color} />
        <circle cx="11" cy="10" r="7" fill="url(#board-pin-shine)" />
        <circle cx="8.5" cy="7.5" r="2" fill="rgba(255,255,255,0.65)" />
      </svg>
    </span>
  );
}

/** First clause of a yield line, so the card never needs an ellipsis. */
function shortYield(y: string): string {
  return y.split(/\s\(|;|,\s(?=[A-Z])/)[0].trim();
}

function RecipeFace({ item }: { item: FSItem }) {
  const meta = getRecipeBySlug(item.id);
  return (
    <div className="card-face card-index" data-tint={meta?.category.toLowerCase()}>
      <p className="card-eyebrow">{meta?.category ?? "Recipe"}</p>
      <h3 className="card-title-display">{meta?.title ?? item.name}</h3>
      {meta?.yield && <p className="card-meta">{shortYield(meta.yield)}</p>}
    </div>
  );
}

function SplitFace({ item }: { item: FSItem }) {
  const split = findSplitByFsId(item.id);
  return (
    <div className="card-face card-gymlog">
      <p className="card-eyebrow">Split</p>
      <h3 className="card-title-block">{split?.displayName ?? item.name}</h3>
      <p className="card-file">{split?.sillyFileName ?? item.name}</p>
      {split?.description && <p className="card-quote">&ldquo;{split.description}&rdquo;</p>}
    </div>
  );
}

function PaperFace({ item }: { item: FSItem }) {
  return (
    <div className="card-face card-paper">
      <div className="flex items-center gap-2">
        <PantherIcon itemId={item.id} size={22} />
        <h3 className="card-title-display text-[17px]">{item.name.replace(/\.[a-z]+$/i, "")}</h3>
      </div>
      {item.description && <p className="card-sub mt-2">{item.description}</p>}
      <div className="card-lines" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} style={{ width: `${92 - ((i * 17) % 35)}%` }} />
        ))}
      </div>
    </div>
  );
}

function LinkFace({ item }: { item: FSItem }) {
  const isPdf = item.href?.toLowerCase().endsWith(".pdf");
  return (
    <div className="card-face card-note">
      <p className="card-eyebrow">{isPdf ? "PDF" : "Link"}</p>
      <h3 className="card-title-display text-[16px]">{item.name.replace(/\.pdf$/i, "")}</h3>
      {item.description && <p className="card-sub">{item.description}</p>}
    </div>
  );
}

function PolaroidFace({ item }: { item: FSItem }) {
  return (
    <div className="card-face card-polaroid">
      <div className="card-photo">
        <PantherIcon itemId={item.id} size={64} />
      </div>
      <p className="card-caption">{item.name}</p>
    </div>
  );
}

function Face({ item, kind }: { item: FSItem; kind: CardKind }) {
  switch (kind) {
    case "recipe":
      return <RecipeFace item={item} />;
    case "split":
      return <SplitFace item={item} />;
    case "paper":
      return <PaperFace item={item} />;
    case "link":
      return <LinkFace item={item} />;
    case "folder":
      return <PaperFace item={item} />;
    default:
      return <PolaroidFace item={item} />;
  }
}

function BoardCard({
  item,
  kind,
  x,
  y,
  rotation,
  z,
  fastener,
  pinColor,
  isDragging,
  isOverBackpack,
  onKeyDown,
}: BoardCardProps) {
  const size = CARD_SIZES[kind];
  const lift = isDragging ? (isOverBackpack ? " scale(0.7)" : " scale(1.04)") : "";
  return (
    <button
      type="button"
      data-card-id={item.id}
      className={`board-card ${isDragging ? "is-dragging" : ""}`}
      style={{
        width: size.w,
        height: size.h,
        zIndex: z,
        transform: `translate(${x}px, ${y}px) rotate(${isDragging ? 0 : rotation}deg)${lift}`,
        opacity: isDragging && isOverBackpack ? 0.75 : 1,
      }}
      aria-label={`${item.name}. Press Enter to open, D to download, arrow keys to move.`}
      title={item.description}
      onKeyDown={(e) => onKeyDown(e, item)}
    >
      <Fastener type={fastener} color={pinColor} />
      <Face item={item} kind={kind} />
    </button>
  );
}

export default memo(BoardCard);
