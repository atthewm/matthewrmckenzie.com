"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { fileSystem, findFSItem, type FSItem } from "@/data/fs";

// ============================================================================
// TERMINAL APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// Classic terminal with virtual FS navigation, built-in commands, and easter
// eggs. Black background, green monospace text, blinking cursor.
// ============================================================================

// ---------------------------------------------------------------------------
// Virtual filesystem helpers
// ---------------------------------------------------------------------------

function fsItemToPath(item: FSItem, parents: FSItem[] = []): string {
  return "/Users/matt/Desktop/" + [...parents, item].map((i) => i.name).join("/");
}

function buildPathMap(
  items: FSItem[],
  parents: FSItem[] = []
): Map<string, { item: FSItem; children?: FSItem[] }> {
  const map = new Map<string, { item: FSItem; children?: FSItem[] }>();
  for (const item of items) {
    const path = fsItemToPath(item, parents);
    map.set(path, { item, children: item.children });
    if (item.children) {
      const childMap = buildPathMap(item.children, [...parents, item]);
      childMap.forEach((v, k) => map.set(k, v));
    }
  }
  return map;
}

const ROOT_PATH = "/Users/matt/Desktop";
const pathMap = buildPathMap(fileSystem);

function resolvePath(current: string, target: string): string {
  if (target === "/") return ROOT_PATH;
  if (target === "~") return ROOT_PATH;
  let parts: string[];
  if (target.startsWith("/")) {
    parts = target.split("/").filter(Boolean);
  } else {
    parts = [...current.split("/").filter(Boolean), ...target.split("/").filter(Boolean)];
  }
  const stack: string[] = [];
  for (const p of parts) {
    if (p === "..") stack.pop();
    else if (p !== ".") stack.push(p);
  }
  return "/" + stack.join("/");
}

function getChildren(path: string): FSItem[] {
  if (path === ROOT_PATH) return fileSystem;
  const entry = pathMap.get(path);
  return entry?.children ?? [];
}

function pathExists(path: string): boolean {
  return path === ROOT_PATH || pathMap.has(path);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const MOTD = [
  "McKenzie OS 2.0 (Panther)",
  'Type "help" for available commands.',
  "",
];

export default function TerminalApp() {
  const { openItem } = useDesktop();
  const [output, setOutput] = useState<string[]>(MOTD);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState(ROOT_PATH);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input on click anywhere
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const prompt = `matt@mckenzie:${cwd.replace(ROOT_PATH, "~") || "~"}$ `;

  const addOutput = useCallback((lines: string | string[]) => {
    setOutput((prev) => [...prev, ...(Array.isArray(lines) ? lines : [lines])]);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      addOutput(prompt + trimmed);

      if (!trimmed) return;

      setHistory((h) => [...h, trimmed]);
      setHistoryIdx(-1);

      const [cmd, ...args] = trimmed.split(/\s+/);
      const arg = args.join(" ");

      switch (cmd) {
        case "help":
          addOutput([
            "Available commands:",
            "  help        Show this message",
            "  clear       Clear the terminal",
            "  whoami      Current user",
            "  uname       System information",
            "  uptime      Session duration",
            "  date        Current date and time",
            "  pwd         Print working directory",
            "  ls          List directory contents",
            "  cd [dir]    Change directory",
            "  cat [file]  Read file description",
            "  open [item] Open an app or folder",
            "  echo [text] Print text",
            "",
          ]);
          break;

        case "clear":
          setOutput([]);
          break;

        case "whoami":
          addOutput("matt");
          break;

        case "uname":
          addOutput("McKenzie OS 2.0 (Panther) - arm64");
          break;

        case "uptime":
          {
            const secs = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(secs / 60);
            const hrs = Math.floor(mins / 60);
            addOutput(
              `up ${hrs > 0 ? `${hrs}h ` : ""}${mins % 60}m ${secs % 60}s`
            );
          }
          break;

        case "date":
          addOutput(new Date().toString());
          break;

        case "pwd":
          addOutput(cwd);
          break;

        case "ls": {
          const targetPath = arg ? resolvePath(cwd, arg) : cwd;
          if (!pathExists(targetPath)) {
            addOutput(`ls: ${arg}: No such file or directory`);
          } else {
            const children = getChildren(targetPath);
            if (children.length === 0) {
              addOutput("(empty)");
            } else {
              addOutput(children.map((c) => c.name).join("  "));
            }
          }
          break;
        }

        case "cd": {
          if (!arg || arg === "~") {
            setCwd(ROOT_PATH);
          } else {
            const target = resolvePath(cwd, arg);
            if (pathExists(target) && (target === ROOT_PATH || pathMap.get(target)?.children)) {
              setCwd(target);
            } else if (pathExists(target)) {
              addOutput(`cd: not a directory: ${arg}`);
            } else {
              addOutput(`cd: no such directory: ${arg}`);
            }
          }
          break;
        }

        case "cat": {
          if (!arg) {
            addOutput("cat: missing operand");
            break;
          }
          const targetPath = resolvePath(cwd, arg);
          const entry = pathMap.get(targetPath);
          if (!entry) {
            addOutput(`cat: ${arg}: No such file or directory`);
          } else {
            addOutput(entry.item.description || "No content available.");
          }
          break;
        }

        case "open": {
          if (!arg) {
            addOutput("open: missing operand");
            break;
          }
          const targetPath = resolvePath(cwd, arg);
          const entry = pathMap.get(targetPath);
          if (entry) {
            openItem(entry.item);
            addOutput(`Opening ${entry.item.name}...`);
          } else {
            // Try by name in current dir
            const children = getChildren(cwd);
            const match = children.find(
              (c) => c.name.toLowerCase() === arg.toLowerCase() || c.id === arg
            );
            if (match) {
              openItem(match);
              addOutput(`Opening ${match.name}...`);
            } else {
              addOutput(`open: ${arg}: not found`);
            }
          }
          break;
        }

        case "echo":
          addOutput(arg || "");
          break;

        // Easter eggs
        case "sudo":
          if (arg === "make me a sandwich") {
            addOutput("Okay.");
          } else {
            addOutput(`sudo: ${arg || "..."}: permission granted, but why?`);
          }
          break;

        case "rm":
          if (arg.includes("-rf") && arg.includes("/")) {
            addOutput("Nice try.");
          } else {
            addOutput(`rm: operation not permitted in McKenzie OS`);
          }
          break;

        case "cowsay": {
          const text = arg || "moo";
          const border = "-".repeat(text.length + 2);
          addOutput([
            ` ${border}`,
            `< ${text} >`,
            ` ${border}`,
            "        \\   ^__^",
            "         \\  (oo)\\_______",
            "            (__)\\       )\\/\\",
            "                ||----w |",
            "                ||     ||",
          ]);
          break;
        }

        case "matrix":
          addOutput("Entering the Matrix...");
          // Brief green rain simulation via multiple lines
          setTimeout(() => {
            const chars = "01";
            const lines: string[] = [];
            for (let i = 0; i < 12; i++) {
              let line = "";
              for (let j = 0; j < 60; j++) {
                line += Math.random() > 0.7 ? chars[Math.floor(Math.random() * 2)] : " ";
              }
              lines.push(line);
            }
            addOutput(lines);
            setTimeout(() => addOutput("...you're back."), 800);
          }, 300);
          break;

        case "neofetch":
          addOutput([
            "        .:'         matt@mckenzie",
            "    __ :'__         ---------------",
            " .'`  `-'  `.       OS: McKenzie OS 2.0 Panther",
            ":          .-'      Host: Vercel Edge Network",
            ":          :        Kernel: Next.js 15",
            " :        `-;       Shell: Terminal.app",
            "  `._`-.   .'       Theme: Panther Aqua",
            "     `--'-'`        Resolution: Dynamic",
          ]);
          break;

        default:
          addOutput(`${cmd}: command not found`);
      }
    },
    [cwd, prompt, addOutput, openItem, startTime]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(idx);
          setInput(history[idx]);
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setOutput([]);
    }
  };

  return (
    <div
      className="flex flex-col h-full font-mono text-[12px] leading-[1.4] cursor-text"
      style={{ background: "#1a1a1a", color: "#33ff33" }}
      onClick={focusInput}
    >
      {/* Scrollable output */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-3 whitespace-pre-wrap break-all">
        {output.map((line, i) => (
          <div key={i}>{line || "\u00A0"}</div>
        ))}

        {/* Input line */}
        <div className="flex">
          <span className="shrink-0">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none caret-[#33ff33]"
            style={{ color: "#33ff33", fontFamily: "inherit", fontSize: "inherit" }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  );
}
