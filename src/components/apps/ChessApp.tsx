"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";

// ============================================================================
// CHESS (Mac OS X Panther Style)
// ============================================================================
// Classic chess with a simple AI opponent. Wood-toned board, piece Unicode
// characters, drag-to-move. AI uses minimax with alpha-beta pruning (depth 3).
// ============================================================================

type PieceColor = "w" | "b";
type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
type Piece = { color: PieceColor; type: PieceType } | null;
type Board = Piece[][];
type Position = [number, number];

// Use filled pieces (♛ style) for both — color via CSS
const UNICODE_PIECES: Record<string, string> = {
  wK: "♚", wQ: "♛", wR: "♜", wB: "♝", wN: "♞", wP: "♟",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

const PIECE_VALUES: Record<PieceType, number> = {
  P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000,
};

// Piece-square tables for positional evaluation
const PAWN_TABLE = [
  [0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],
  [5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],
  [5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0],
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],
  [-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],
  [-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],
  [-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50],
];

function initialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRow: PieceType[] = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { color: "b", type: backRow[c] };
    board[1][c] = { color: "b", type: "P" };
    board[6][c] = { color: "w", type: "P" };
    board[7][c] = { color: "w", type: backRow[c] };
  }
  return board;
}

function cloneBoard(b: Board): Board {
  return b.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function isKingInCheck(board: Board, color: PieceColor): boolean {
  // Find king
  let kr = -1, kc = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === "K") { kr = r; kc = c; }
    }
  }
  if (kr === -1) return true;
  const enemy = color === "w" ? "b" : "w";
  return isSquareAttacked(board, kr, kc, enemy);
}

function isSquareAttacked(board: Board, tr: number, tc: number, byColor: PieceColor): boolean {
  // Check all enemy pieces
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== byColor) continue;
      if (canPieceAttack(board, r, c, tr, tc, p)) return true;
    }
  }
  return false;
}

function canPieceAttack(board: Board, fr: number, fc: number, tr: number, tc: number, piece: NonNullable<Piece>): boolean {
  const dr = tr - fr, dc = tc - fc;
  switch (piece.type) {
    case "P": {
      const dir = piece.color === "w" ? -1 : 1;
      return dr === dir && Math.abs(dc) === 1;
    }
    case "N": return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
    case "K": return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
    case "B": return Math.abs(dr) === Math.abs(dc) && dr !== 0 && isPathClear(board, fr, fc, tr, tc);
    case "R": return (dr === 0 || dc === 0) && (dr !== 0 || dc !== 0) && isPathClear(board, fr, fc, tr, tc);
    case "Q": {
      const isDiagonal = Math.abs(dr) === Math.abs(dc) && dr !== 0;
      const isStraight = (dr === 0 || dc === 0) && (dr !== 0 || dc !== 0);
      return (isDiagonal || isStraight) && isPathClear(board, fr, fc, tr, tc);
    }
    default: return false;
  }
}

function isPathClear(board: Board, fr: number, fc: number, tr: number, tc: number): boolean {
  const dr = Math.sign(tr - fr), dc = Math.sign(tc - fc);
  let r = fr + dr, c = fc + dc;
  while (r !== tr || c !== tc) {
    if (board[r][c]) return false;
    r += dr; c += dc;
  }
  return true;
}

function generateMoves(board: Board, color: PieceColor): [Position, Position][] {
  const moves: [Position, Position][] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;
      const targets = getPieceMoves(board, r, c, p);
      for (const [tr, tc] of targets) {
        // Verify legality (doesn't leave own king in check)
        const nb = cloneBoard(board);
        nb[tr][tc] = nb[r][c];
        nb[r][c] = null;
        // Pawn promotion (auto-queen)
        if (p.type === "P" && (tr === 0 || tr === 7)) {
          nb[tr][tc] = { color, type: "Q" };
        }
        if (!isKingInCheck(nb, color)) {
          moves.push([[r, c], [tr, tc]]);
        }
      }
    }
  }
  return moves;
}

function getPieceMoves(board: Board, r: number, c: number, piece: NonNullable<Piece>): Position[] {
  const moves: Position[] = [];
  const color = piece.color;
  const enemy = color === "w" ? "b" : "w";

  function addIfValid(tr: number, tc: number): boolean {
    if (!inBounds(tr, tc)) return false;
    const target = board[tr][tc];
    if (target && target.color === color) return false;
    moves.push([tr, tc]);
    return !target; // return true to continue sliding, false if captured
  }

  function slide(dirs: [number, number][]) {
    for (const [dr, dc] of dirs) {
      for (let i = 1; i < 8; i++) {
        if (!addIfValid(r + dr * i, c + dc * i)) break;
      }
    }
  }

  switch (piece.type) {
    case "P": {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      // Forward
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        moves.push([r + dir, c]);
        if (r === startRow && !board[r + 2 * dir][c]) {
          moves.push([r + 2 * dir, c]);
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const tr = r + dir, tc = c + dc;
        if (inBounds(tr, tc) && board[tr][tc]?.color === enemy) {
          moves.push([tr, tc]);
        }
      }
      break;
    }
    case "N": {
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        addIfValid(r + dr, c + dc);
      }
      break;
    }
    case "B": slide([[-1,-1],[-1,1],[1,-1],[1,1]]); break;
    case "R": slide([[-1,0],[1,0],[0,-1],[0,1]]); break;
    case "Q": slide([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]); break;
    case "K": {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          addIfValid(r + dr, c + dc);
        }
      }
      break;
    }
  }
  return moves;
}

// Simple evaluation
function evaluate(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const sign = p.color === "w" ? 1 : -1;
      score += sign * PIECE_VALUES[p.type];
      // Positional bonuses
      const tableR = p.color === "w" ? r : 7 - r;
      if (p.type === "P") score += sign * PAWN_TABLE[tableR][c];
      if (p.type === "N") score += sign * KNIGHT_TABLE[tableR][c];
    }
  }
  return score;
}

// Minimax with alpha-beta
function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0) return evaluate(board);
  const color = maximizing ? "w" : "b";
  const moves = generateMoves(board, color);
  if (moves.length === 0) {
    return isKingInCheck(board, color) ? (maximizing ? -99999 : 99999) : 0;
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const [from, to] of moves) {
      const nb = cloneBoard(board);
      const piece = nb[from[0]][from[1]]!;
      nb[to[0]][to[1]] = piece;
      nb[from[0]][from[1]] = null;
      if (piece.type === "P" && to[0] === 0) nb[to[0]][to[1]] = { color: "w", type: "Q" };
      const val = minimax(nb, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [from, to] of moves) {
      const nb = cloneBoard(board);
      const piece = nb[from[0]][from[1]]!;
      nb[to[0]][to[1]] = piece;
      nb[from[0]][from[1]] = null;
      if (piece.type === "P" && to[0] === 7) nb[to[0]][to[1]] = { color: "b", type: "Q" };
      const val = minimax(nb, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function findBestMove(board: Board): [Position, Position] | null {
  const moves = generateMoves(board, "b");
  if (moves.length === 0) return null;

  let bestScore = Infinity;
  let bestMove = moves[0];

  // Shuffle for variety
  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  for (const [from, to] of shuffled) {
    const nb = cloneBoard(board);
    const piece = nb[from[0]][from[1]]!;
    nb[to[0]][to[1]] = piece;
    nb[from[0]][from[1]] = null;
    if (piece.type === "P" && to[0] === 7) nb[to[0]][to[1]] = { color: "b", type: "Q" };
    const score = minimax(nb, 2, -Infinity, Infinity, true);
    if (score < bestScore) {
      bestScore = score;
      bestMove = [from, to];
    }
  }
  return bestMove;
}

export default function ChessApp() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selected, setSelected] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [turn, setTurn] = useState<PieceColor>("w");
  const [status, setStatus] = useState<string>("Your turn (White)");
  const [gameOver, setGameOver] = useState(false);
  const [lastMove, setLastMove] = useState<[Position, Position] | null>(null);
  const thinkingRef = useRef(false);

  const checkGameEnd = useCallback((b: Board, color: PieceColor) => {
    const moves = generateMoves(b, color);
    if (moves.length === 0) {
      setGameOver(true);
      if (isKingInCheck(b, color)) {
        setStatus(color === "w" ? "Checkmate! Black wins." : "Checkmate! You win! 🎉");
      } else {
        setStatus("Stalemate! Draw.");
      }
      return true;
    }
    if (isKingInCheck(b, color)) {
      setStatus(color === "w" ? "Check! Your turn." : "Check!");
    }
    return false;
  }, []);

  // AI move
  useEffect(() => {
    if (turn !== "b" || gameOver || thinkingRef.current) return;
    thinkingRef.current = true;
    setStatus("Thinking...");

    const timer = setTimeout(() => {
      const move = findBestMove(board);
      if (!move) {
        thinkingRef.current = false;
        return;
      }
      const [from, to] = move;
      const nb = cloneBoard(board);
      const piece = nb[from[0]][from[1]]!;
      nb[to[0]][to[1]] = piece;
      nb[from[0]][from[1]] = null;
      if (piece.type === "P" && to[0] === 7) nb[to[0]][to[1]] = { color: "b", type: "Q" };
      setBoard(nb);
      setLastMove([from, to]);
      setTurn("w");
      if (!checkGameEnd(nb, "w")) {
        setStatus("Your turn (White)");
      }
      thinkingRef.current = false;
    }, 300);

    return () => clearTimeout(timer);
  }, [turn, board, gameOver, checkGameEnd]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (turn !== "w" || gameOver) return;

    if (selected) {
      // Try to make the move
      const isLegal = legalMoves.some(([mr, mc]) => mr === r && mc === c);
      if (isLegal) {
        const nb = cloneBoard(board);
        const piece = nb[selected[0]][selected[1]]!;
        nb[r][c] = piece;
        nb[selected[0]][selected[1]] = null;
        // Promotion
        if (piece.type === "P" && r === 0) {
          nb[r][c] = { color: "w", type: "Q" };
        }
        setBoard(nb);
        setSelected(null);
        setLegalMoves([]);
        setLastMove([selected, [r, c]]);
        setTurn("b");
        checkGameEnd(nb, "b");
        return;
      }
    }

    // Select a piece
    const p = board[r][c];
    if (p && p.color === "w") {
      setSelected([r, c]);
      const allMoves = generateMoves(board, "w");
      const pieceMoves = allMoves
        .filter(([from]) => from[0] === r && from[1] === c)
        .map(([, to]) => to);
      setLegalMoves(pieceMoves);
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  }, [selected, legalMoves, board, turn, gameOver, checkGameEnd]);

  const resetGame = useCallback(() => {
    setBoard(initialBoard());
    setSelected(null);
    setLegalMoves([]);
    setTurn("w");
    setStatus("Your turn (White)");
    setGameOver(false);
    setLastMove(null);
    thinkingRef.current = false;
  }, []);

  const cellSize = 52;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--desktop-surface)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: "1px solid var(--desktop-border)" }}
      >
        <span className="text-[12px] font-medium" style={{ color: "var(--desktop-text)" }}>
          {status}
        </span>
        <button
          onClick={resetGame}
          className="text-[11px] px-2 py-0.5 rounded hover:bg-black/5 active:bg-black/10"
          style={{ border: "1px solid var(--desktop-border)", color: "var(--desktop-text)" }}
        >
          New Game
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${cellSize}px)`, borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isLight = (r + c) % 2 === 0;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isLegal = legalMoves.some(([mr, mc]) => mr === r && mc === c);
              const isLastFrom = lastMove && lastMove[0][0] === r && lastMove[0][1] === c;
              const isLastTo = lastMove && lastMove[1][0] === r && lastMove[1][1] === c;

              let bg = isLight ? "#F0D9B5" : "#B58863";
              if (isSelected) bg = "#829769";
              else if (isLastFrom || isLastTo) bg = isLight ? "#CDD26A" : "#AAA23A";

              return (
                <button
                  key={`${r}-${c}`}
                  className="relative flex items-center justify-center border-0"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: bg,
                    cursor: turn === "w" && !gameOver ? "pointer" : "default",
                    fontSize: cellSize * 0.7,
                    lineHeight: 1,
                  }}
                  onClick={() => handleCellClick(r, c)}
                >
                  {piece && (
                    <span style={{
                      color: piece.color === "w" ? "#fff" : "#1a1a1a",
                      textShadow: piece.color === "w"
                        ? "0 0 2px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4)"
                        : "0 0 2px rgba(255,255,255,0.3), 0 1px 1px rgba(0,0,0,0.3)",
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))",
                      userSelect: "none",
                    }}>
                      {UNICODE_PIECES[`${piece.color}${piece.type}`]}
                    </span>
                  )}
                  {isLegal && !piece && (
                    <div
                      style={{
                        position: "absolute",
                        width: cellSize * 0.25,
                        height: cellSize * 0.25,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.15)",
                      }}
                    />
                  )}
                  {isLegal && piece && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 2,
                        borderRadius: "50%",
                        border: "3px solid rgba(0,0,0,0.2)",
                      }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
