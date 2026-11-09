// ============================================================================
// BOARD THEMES
// ============================================================================
// Every folder on the desktop opens as a pinboard instead of a Finder list.
// Each board picks a surface (cork, chalkboard, linen, felt) and a fastener
// (push pins or tape). Folders not listed here fall back to DEFAULT_BOARD.
// Surface styling lives in globals.css under `.board[data-surface=...]`.
// ============================================================================

export type BoardSurface = "cork" | "chalk" | "linen" | "felt";
export type BoardFastener = "pin" | "tape";

export interface BoardTheme {
  surface: BoardSurface;
  fastener: BoardFastener;
  /** Short line shown in the board toolbar */
  tagline: string;
}

export const DEFAULT_BOARD: BoardTheme = {
  surface: "cork",
  fastener: "pin",
  tagline: "Drag things around. Scroll to zoom.",
};

export const BOARD_THEMES: Record<string, BoardTheme> = {
  recipes: {
    surface: "cork",
    fastener: "pin",
    tagline: "Kitchen board. Drop a card in the backpack to take it home.",
  },
  health: {
    surface: "chalk",
    fastener: "tape",
    tagline: "Gym wall. Splits, dashboards, and the plan.",
  },
  "whoop-splits": {
    surface: "chalk",
    fastener: "tape",
    tagline: "Strength Trainer splits.",
  },
  work: {
    surface: "linen",
    fastener: "pin",
    tagline: "Resume, overview, and how to reach me.",
  },
  media: {
    surface: "felt",
    fastener: "pin",
    tagline: "What I'm watching and listening to.",
  },
};

export function getBoardTheme(boardId: string): BoardTheme {
  return BOARD_THEMES[boardId] ?? DEFAULT_BOARD;
}

/** Pin colors cycle by card hash so a board never looks uniform. */
export const PIN_COLORS = ["#d43c2f", "#e8a317", "#2f6ae5", "#2e9e5b", "#8e44ad"] as const;
