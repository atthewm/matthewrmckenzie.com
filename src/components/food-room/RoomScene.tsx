import React from "react";
import type { TopFood } from "@/data/notion/types";
import type { RoomGeometry } from "./roomGeometry";

// ============================================================================
// FOOD ROOM: the scene
// ============================================================================
// Wall, floor, window, plant, the board on the wall and the table. Colours are
// the site's warm paper, slate and gold; the scene stays a light, playful
// illustration in both themes.
// ============================================================================

const WOOD = "#b08d57";
const BOARD_BARS = ["#cfae6b", "#ecebe7", "#a9c3e2", "#8fc7b3", "#e39a7c", "#cfae6b"];
const pct = (value: number, of: number) => `${(value / of) * 100}%`;

interface RoomSceneProps {
  g: RoomGeometry;
  boardFoods: readonly TopFood[];
  onBoard: () => void;
}

export default function RoomScene({ g, boardFoods, onBoard }: RoomSceneProps) {
  const [winLeft, winTop, winWidth, winHeight] = g.window;
  const [plantLeft, plantTop, plantWidth] = g.plant;
  const surface = ((g.table.y1 - g.table.y0) / (g.tableBottom - g.table.y0)) * 100;
  const maxCount = boardFoods[0]?.count || 1;

  return (
    <>
      {/* wall */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: pct(g.floorTop, g.h), background: "repeating-linear-gradient(90deg,#f4f2ee 0 38px,#ebe6dc 38px 40px)" }}
      />
      <div className="absolute inset-x-0" style={{ top: `${(g.floorTop / g.h) * 100 - 1.5}%`, height: "1.5%", background: "#9a7a3c" }} />
      {/* floor */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ top: pct(g.floorTop, g.h), background: `repeating-conic-gradient(#e7dcc6 0% 25%, #d9ccb0 0% 50%) 0 0 / ${g.tile}` }}
      />

      {/* window */}
      <div
        className="absolute rounded-sm border-4"
        style={{ left: `${winLeft}%`, top: `${winTop}%`, width: `${winWidth}%`, height: `${winHeight}%`, borderColor: WOOD, background: "linear-gradient(#a9c3e2,#e6eef7)" }}
      >
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2" style={{ background: WOOD }} />
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2" style={{ background: WOOD }} />
      </div>
      {/* plant */}
      <div className="absolute" style={{ left: `${plantLeft}%`, top: `${plantTop}%`, width: `${plantWidth}%` }}>
        <svg viewBox="0 0 40 60" style={{ width: "100%" }} aria-hidden="true">
          <path d="M20 30 Q6 20 8 6 Q18 14 20 30 Q22 12 34 6 Q34 22 20 30" fill="#5cb85c" stroke="#2f6b2f" strokeWidth={1.5} />
          <path d="M10 30 L30 30 L27 56 L13 56 Z" fill="#c0634a" stroke="#3b2a22" strokeWidth={1.5} />
        </svg>
      </div>

      {/* board */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onBoard();
        }}
        className="food-room-board absolute text-left"
        style={{
          left: pct(g.board.x0, g.w),
          top: pct(g.board.y0, g.h),
          width: pct(g.board.x1 - g.board.x0, g.w),
          height: pct(g.board.y1 - g.board.y0, g.h),
        }}
        aria-label="Board: open the food dashboard"
      >
        <span className="food-room-board-title">Food board</span>
        <svg viewBox="0 0 100 50" className="absolute bottom-[8%] left-[6%] w-[88%]" aria-hidden="true">
          {boardFoods.slice(0, 6).map((f, i) => {
            const barHeight = (f.count / maxCount) * 40;
            return <rect key={f.key} x={i * 16 + 2} y={48 - barHeight} width={11} height={barHeight} fill={BOARD_BARS[i]} rx={1} />;
          })}
        </svg>
      </button>

      {/* table */}
      <div
        className="absolute"
        style={{
          left: pct(g.table.x0, g.w),
          top: pct(g.table.y0, g.h),
          width: pct(g.table.x1 - g.table.x0, g.w),
          height: pct(g.tableBottom - g.table.y0, g.h),
        }}
      >
        <div className="absolute inset-x-[4%] bottom-0 flex justify-between" style={{ top: `${surface}%` }}>
          <div className="h-full w-[5%] rounded-b" style={{ background: "#7a4a2c" }} />
          <div className="h-full w-[5%] rounded-b" style={{ background: "#7a4a2c" }} />
        </div>
        <div
          className="absolute inset-x-0 top-0 rounded-[1.2rem]"
          style={{ height: `${surface}%`, background: "linear-gradient(#c98a55,#b06f3d)", boxShadow: "inset 0 -10px 0 #8f5530, 0 8px 14px rgba(0,0,0,.18)" }}
        />
      </div>
    </>
  );
}
