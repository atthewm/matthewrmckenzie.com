"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function GatePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Access denied");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes mck-stripe {
              0% { background-position: 0 0; }
              100% { background-position: 28px 0; }
            }
            @keyframes mck-pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            @keyframes mck-fade-in {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .mck-progress {
              background: repeating-linear-gradient(
                -55deg,
                rgba(0, 113, 227, 0.45),
                rgba(0, 113, 227, 0.45) 8px,
                rgba(0, 113, 227, 0.25) 8px,
                rgba(0, 113, 227, 0.25) 16px
              );
              background-size: 28px 100%;
              animation: mck-stripe 0.8s linear infinite;
            }
            .mck-dots { animation: mck-pulse 2s ease-in-out infinite; }
            .mck-fade { animation: mck-fade-in 0.35s ease-out forwards; }
            .mck-input {
              background: linear-gradient(180deg, #e8e8e8 0%, #ffffff 4px);
              border: 1px solid #999;
              box-shadow: inset 0 1px 3px rgba(0,0,0,0.12);
              border-radius: 4px;
              outline: none;
              transition: border-color 0.15s;
            }
            .mck-input:focus {
              border-color: #0071e3;
              box-shadow: inset 0 1px 3px rgba(0,0,0,0.12), 0 0 0 2px rgba(0,113,227,0.2);
            }
            .mck-btn {
              background: linear-gradient(180deg, #6cb8f7 0%, #2196F3 45%, #1976D2 100%);
              border: 1px solid #1565C0;
              border-radius: 5px;
              color: white;
              text-shadow: 0 -1px 0 rgba(0,0,0,0.2);
              box-shadow: 0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25);
              cursor: pointer;
              transition: all 0.15s;
            }
            .mck-btn:hover {
              background: linear-gradient(180deg, #7ec8ff 0%, #42a5f5 45%, #1e88e5 100%);
            }
            .mck-btn:active {
              background: linear-gradient(180deg, #1976D2 0%, #1565C0 100%);
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            }
            .mck-btn:disabled { opacity: 0.55; cursor: not-allowed; }
          `,
        }}
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 40%, #111 100%)",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          color: "#fff",
          userSelect: "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "4px", margin: 0, lineHeight: 1.2 }}>
              McKENZIE<span style={{ color: "#0071e3" }}>_</span>OS
            </h1>
            <p style={{ fontSize: "11px", color: "#777", letterSpacing: "3px", textTransform: "uppercase", marginTop: "6px" }}>
              System Update in Progress
            </p>
          </div>
          <div style={{ width: "240px", height: "18px", borderRadius: "9px", overflow: "hidden", background: "#333", border: "1px solid #555", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
            <div className="mck-progress" style={{ width: "100%", height: "100%", borderRadius: "9px" }} />
          </div>
          <p className="mck-dots" style={{ fontSize: "11px", color: "#666", letterSpacing: "2px", margin: 0 }}>System locked</p>
          {/* Login form -- requires credentials for all users */}
          <form onSubmit={handleLogin} className="mck-fade" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "24px" }}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="mck-input" style={{ width: "220px", padding: "8px 12px", fontSize: "13px", color: "#333" }} autoFocus autoComplete="username" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mck-input" style={{ width: "220px", padding: "8px 12px", fontSize: "13px", color: "#333" }} autoComplete="current-password" />
            {error && <p style={{ color: "#ff6b6b", fontSize: "11px", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} className="mck-btn" style={{ width: "220px", padding: "8px 0", fontSize: "13px", fontWeight: 500, marginTop: "4px" }}>{loading ? "Authenticating..." : "Log In"}</button>
          </form>
        </div>
        <p style={{ position: "absolute", bottom: "20px", fontSize: "9px", color: "#333", letterSpacing: "1px" }}>&copy; 2026 McKENZIE_OS</p>
      </div>
    </>
  );
}
