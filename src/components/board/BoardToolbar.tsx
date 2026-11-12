import React from "react";
import { Minus, Plus, Maximize2, RotateCcw } from "lucide-react";
import type { FSItem } from "@/data/fs";
import { PantherIcon } from "@/components/desktop/PantherIcons";

// ============================================================================
// BOARD TOOLBAR
// ============================================================================
// Board tabs, the board tagline, and zoom controls. Rendered inside the
// client BoardView, so it needs no directive of its own.
// ============================================================================

interface BoardToolbarProps {
  boards: FSItem[];
  currentId: string;
  tagline: string;
  scale: number;
  onSwitch: (item: FSItem) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onTidy: () => void;
}

export default function BoardToolbar({ boards, currentId, tagline, scale, onSwitch, onZoomIn, onZoomOut, onFit, onTidy }: BoardToolbarProps) {
  return (
    <div className="board-toolbar">
      <nav aria-label="Boards" className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-thin">
        {boards.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSwitch(b)}
            aria-current={b.id === currentId ? "page" : undefined}
            className="board-tab"
          >
            <PantherIcon itemId={b.id} size={14} />
            <span>{b.name}</span>
          </button>
        ))}
      </nav>
      <p className="board-tagline">{tagline}</p>
      <div className="flex items-center gap-0.5 shrink-0" role="group" aria-label="Zoom">
        <button type="button" className="board-tool" onClick={onZoomOut} aria-label="Zoom out"><Minus size={13} /></button>
        <span className="board-zoom-readout" aria-live="off">{Math.round(scale * 100)}%</span>
        <button type="button" className="board-tool" onClick={onZoomIn} aria-label="Zoom in"><Plus size={13} /></button>
        <button type="button" className="board-tool" onClick={onFit} aria-label="Fit board to window" title="Fit"><Maximize2 size={12} /></button>
        <button type="button" className="board-tool" onClick={onTidy} aria-label="Tidy up: reset card positions" title="Tidy up"><RotateCcw size={12} /></button>
      </div>
    </div>
  );
}
