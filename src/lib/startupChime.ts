// ---------------------------------------------------------------------------
// Startup Chime — Synthesized Mac startup chord
//
// Plays a warm F-major chord (a nod to the classic Macintosh startup sound)
// using the Web Audio API. No external audio files needed.
// ---------------------------------------------------------------------------

export function playStartupChime(): void {
  if (typeof window === "undefined") return;

  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // F-major chord frequencies (F3, A3, C4, F4)
    const frequencies = [174.61, 220.0, 261.63, 349.23];
    const duration = 2.5;
    const now = ctx.currentTime;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.25, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + duration);
    master.connect(ctx.destination);

    frequencies.forEach((freq, i) => {
      // Main tone
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      // Individual gain with staggered attack
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 - i * 0.04, now + 0.05 + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.1);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration);

      // Add a subtle harmonic overtone for warmth
      const harmonic = ctx.createOscillator();
      harmonic.type = "sine";
      harmonic.frequency.value = freq * 2;
      const hGain = ctx.createGain();
      hGain.gain.setValueAtTime(0, now);
      hGain.gain.linearRampToValueAtTime(0.04, now + 0.1);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);
      harmonic.connect(hGain);
      hGain.connect(master);
      harmonic.start(now);
      harmonic.stop(now + duration);
    });

    // Close context after chime finishes
    setTimeout(() => ctx.close(), (duration + 0.5) * 1000);
  } catch {
    // Web Audio API not available — fail silently
  }
}
