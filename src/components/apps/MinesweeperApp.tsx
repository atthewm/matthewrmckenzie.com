"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

// ============================================================================
// MINESWEEPER
// ============================================================================
// Classic Windows-style Minesweeper recreated with Panther Aqua styling.
// Beginner (9x9, 10 mines), Intermediate (16x16, 40), Expert (30x16, 99).
// ============================================================================

type Difficulty = "beginner" | "intermediate" | "expert";

interface CellData {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

const CONFIGS: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  beginner:     { rows: 9,  cols: 9,  mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert:       { rows: 16, cols: 30, mines: 99 },
};

function createBoard(rows: number, cols: number, mines: number, safeR?: number, safeC?: number): CellData[][] {
  const board: CellData[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
    }))
  );

  // Place mines (avoid safe cell and its neighbors)
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].isMine) continue;
    if (safeR !== undefined && safeC !== undefined && Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    board[r][c].isMine = true;
    placed++;
  }

  // Count adjacents
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) count++;
        }
      }
      board[r][c].adjacentMines = count;
    }
  }
  return board;
}

function floodReveal(board: CellData[][], r: number, c: number, rows: number, cols: number) {
  const stack = [[r, c]];
  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = board[cr][cc];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;
    cell.isRevealed = true;
    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          stack.push([cr + dr, cc + dc]);
        }
      }
    }
  }
}

const NUMBER_COLORS: Record<number, string> = {
  1: "#0000FF", 2: "#008000", 3: "#FF0000", 4: "#000080",
  5: "#800000", 6: "#008080", 7: "#000000", 8: "#808080",
};

export default function MinesweeperApp() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const config = CONFIGS[difficulty];
  const [board, setBoard] = useState<CellData[][]>(() => createBoard(config.rows, config.cols, config.mines));
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [firstClick, setFirstClick] = useState(true);
  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const flagCount = board.flat().filter((c) => c.isFlagged).length;
  const minesLeft = config.mines - flagCount;

  // Timer
  useEffect(() => {
    if (gameState === "playing" && !firstClick) {
      timerRef.current = setInterval(() => setTime((t) => Math.min(t + 1, 999)), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, firstClick]);

  const resetGame = useCallback((diff?: Difficulty) => {
    const d = diff || difficulty;
    if (diff) setDifficulty(diff);
    const cfg = CONFIGS[d];
    setBoard(createBoard(cfg.rows, cfg.cols, cfg.mines));
    setGameState("playing");
    setFirstClick(true);
    setTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [difficulty]);

  const checkWin = useCallback((b: CellData[][]) => {
    const allNonMinesRevealed = b.flat().every((c) => c.isMine || c.isRevealed);
    if (allNonMinesRevealed) {
      setGameState("won");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState !== "playing") return;
    const cell = board[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    let newBoard: CellData[][];
    if (firstClick) {
      // Generate board with safe first click
      newBoard = createBoard(config.rows, config.cols, config.mines, r, c);
      setFirstClick(false);
    } else {
      newBoard = board.map((row) => row.map((c) => ({ ...c })));
    }

    if (newBoard[r][c].isMine) {
      // Reveal all mines
      newBoard.forEach((row) => row.forEach((c) => { if (c.isMine) c.isRevealed = true; }));
      setBoard(newBoard);
      setGameState("lost");
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    floodReveal(newBoard, r, c, config.rows, config.cols);
    setBoard(newBoard);
    checkWin(newBoard);
  }, [board, gameState, firstClick, config, checkWin]);

  const handleCellRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== "playing") return;
    const cell = board[r][c];
    if (cell.isRevealed) return;
    const newBoard = board.map((row) => row.map((c) => ({ ...c })));
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
    setBoard(newBoard);
  }, [board, gameState]);

  // Chord click (reveal neighbors if flags match count)
  const handleCellDoubleClick = useCallback((r: number, c: number) => {
    if (gameState !== "playing") return;
    const cell = board[r][c];
    if (!cell.isRevealed || cell.adjacentMines === 0) return;

    let flaggedNeighbors = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && board[nr][nc].isFlagged) {
          flaggedNeighbors++;
        }
      }
    }

    if (flaggedNeighbors !== cell.adjacentMines) return;

    const newBoard = board.map((row) => row.map((c) => ({ ...c })));
    let hitMine = false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          const neighbor = newBoard[nr][nc];
          if (!neighbor.isRevealed && !neighbor.isFlagged) {
            if (neighbor.isMine) {
              hitMine = true;
              newBoard.forEach((row) => row.forEach((c) => { if (c.isMine) c.isRevealed = true; }));
            } else {
              floodReveal(newBoard, nr, nc, config.rows, config.cols);
            }
          }
        }
      }
    }
    setBoard(newBoard);
    if (hitMine) {
      setGameState("lost");
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      checkWin(newBoard);
    }
  }, [board, gameState, config, checkWin]);

  const cellSize = difficulty === "expert" ? 22 : 26;
  const fontSize = difficulty === "expert" ? 12 : 14;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--desktop-surface)" }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: "1px solid var(--desktop-border)" }}
      >
        <select
          value={difficulty}
          onChange={(e) => resetGame(e.target.value as Difficulty)}
          className="text-[11px] px-1.5 py-0.5 rounded border bg-white"
          style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text)" }}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>

        <button
          onClick={() => resetGame()}
          className="text-[18px] leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-black/5 active:bg-black/10"
          title="New Game"
        >
          {gameState === "won" ? "😎" : gameState === "lost" ? "😵" : "🙂"}
        </button>

        <div className="flex items-center gap-3 text-[11px] font-mono" style={{ color: "var(--desktop-text)" }}>
          <span>💣 {minesLeft}</span>
          <span>⏱ {String(time).padStart(3, "0")}</span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-2">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${config.rows}, ${cellSize}px)`,
            gap: 1,
            background: "var(--desktop-border)",
            border: "1px solid var(--desktop-border)",
            borderRadius: 4,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className="flex items-center justify-center border-0 transition-colors duration-75"
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  cursor: gameState !== "playing" ? "default" : "pointer",
                  background: cell.isRevealed
                    ? cell.isMine
                      ? "#ff6b6b"
                      : "var(--desktop-surface)"
                    : "var(--desktop-bg)",
                  color: cell.isRevealed && !cell.isMine
                    ? NUMBER_COLORS[cell.adjacentMines] || "transparent"
                    : "var(--desktop-text)",
                  boxShadow: cell.isRevealed
                    ? "none"
                    : "inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.15)",
                }}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleCellRightClick(e, r, c)}
                onDoubleClick={() => handleCellDoubleClick(r, c)}
              >
                {cell.isFlagged && !cell.isRevealed ? "🚩" :
                 cell.isRevealed && cell.isMine ? "💣" :
                 cell.isRevealed && cell.adjacentMines > 0 ? cell.adjacentMines :
                 ""}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Status bar */}
      {gameState !== "playing" && (
        <div
          className="text-center text-[12px] font-medium py-1.5 shrink-0"
          style={{
            background: gameState === "won" ? "rgba(0,128,0,0.1)" : "rgba(255,0,0,0.1)",
            color: gameState === "won" ? "#008000" : "#cc0000",
            borderTop: "1px solid var(--desktop-border)",
          }}
        >
          {gameState === "won" ? `You won in ${time}s! 🎉` : "Game Over! Click 😵 to try again."}
        </div>
      )}
    </div>
  );
}
