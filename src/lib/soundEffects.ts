// ============================================================================
// SOUND EFFECTS - Web Audio API synthesized system sounds
// ============================================================================
// Lightweight sound effects for the desktop OS. No audio files needed.
// All sounds are synthesized in real-time using the Web Audio API.
// ============================================================================

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function safePlay(fn: (ctx: AudioContext) => void) {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") {
      ctx.resume().then(() => fn(ctx));
    } else {
      fn(ctx);
    }
  } catch {
    // Audio not available
  }
}

// ---------------------------------------------------------------------------
// Window open — soft rising chime
// ---------------------------------------------------------------------------
export function playWindowOpen() {
  safePlay((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  });
}

// ---------------------------------------------------------------------------
// Window close — soft falling tone
// ---------------------------------------------------------------------------
export function playWindowClose() {
  safePlay((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  });
}

// ---------------------------------------------------------------------------
// Error beep — classic Mac "Sosumi" style
// ---------------------------------------------------------------------------
export function playErrorBeep() {
  safePlay((ctx) => {
    const t = ctx.currentTime;
    // Two quick beeps
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.04, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.08);
    }
  });
}

// ---------------------------------------------------------------------------
// Minimize — swoosh down
// ---------------------------------------------------------------------------
export function playMinimize() {
  safePlay((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  });
}

// ---------------------------------------------------------------------------
// Shutdown — descending chord
// ---------------------------------------------------------------------------
export function playShutdown() {
  safePlay((ctx) => {
    const t = ctx.currentTime;
    const notes = [523.25, 392, 329.63, 261.63]; // C5, G4, E4, C4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t + i * 0.25;
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  });
}
