"use client";

import React, { useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Flurry Screensaver — Mac OS X default screensaver recreation
//
// Ported from the original C/OpenGL source by Calum Robinson:
// https://github.com/calumr/flurry
//
// Uses canvas 2D with additive compositing to simulate OpenGL additive
// blending. Renders a glowing particle system where:
//   • A Star traces 3D Lissajous curves as the central attractor
//   • 12 Sparks orbit with color-cycling (phase-shifted cosines)
//   • 3600 Smoke particles spawn at the Star and are attracted to Sparks
//     via inverse-square gravity, creating flowing luminous streams
// ---------------------------------------------------------------------------

// --- Constants (from Gl_saver.h) ---
const GRAVITY = 1500000.0;
const FIELD_SPEED = 12.0;
const FIELD_RANGE = 1000.0;
const STREAM_SPEED = 450.0;
const STREAM_BIAS = 7.0;
const NUM_SMOKE = 3600;
const NUM_SPARKS = 12;
const STAR_SPEED = 50;
const DRAG_BASE = 0.9965;
const COLOR_INCOHERENCE = 0.15;
const INCOHESION = 0.07;
const BIGMYSTERY = 1800.0;
const SERAPH_DISTANCE = 2000.0;
const STREAM_SIZE = 25000.0;

// --- Utility ---
function randFlt(min: number, max: number): number {
  return min + (max - min) * Math.random();
}

function randBell(scale: number): number {
  return (
    scale * (1.0 - (Math.random() + Math.random() + Math.random()) / 1.5)
  );
}

// --- Star ---
interface Star {
  position: [number, number, number];
  mystery: number;
  rotSpeed: number;
  angle: number;
}

function createStar(): Star {
  return {
    position: [0, 0, 0],
    mystery: randFlt(0, BIGMYSTERY),
    rotSpeed: randFlt(0.4, 0.9),
    angle: 0,
  };
}

function updateStar(star: Star, dt: number): void {
  star.angle += star.rotSpeed * dt * 0.002;

  const thisAngle = star.angle;
  const thisPointInRadians = (2.0 * Math.PI * star.mystery) / BIGMYSTERY;

  // Modulating factor from sum of cosines
  const cf =
    (1.0 +
      Math.cos(0.31 * (thisPointInRadians * 2.0 + thisAngle)) +
      Math.cos(1.7 * thisPointInRadians + 0.27 * thisAngle) +
      Math.cos(3.1 * thisPointInRadians + thisAngle * 0.73)) *
    0.25;

  // 3D Lissajous base position
  let x =
    250.0 * cf * Math.cos(11.0 * (thisPointInRadians + 3.0 * thisAngle));
  let y =
    250.0 * cf * Math.sin(12.0 * (thisPointInRadians + 4.0 * thisAngle));
  let z = 250.0 * Math.cos(23.0 * (thisPointInRadians + 12.0 * thisAngle));

  // Rotation matrix 1
  const rot1 = thisAngle * 0.501 + 5.2;
  const cr1 = Math.cos(rot1);
  const sr1 = Math.sin(rot1);
  const nx = x * cr1 - y * sr1;
  const ny = x * sr1 + y * cr1;
  x = nx;
  y = ny;

  // Rotation matrix 2
  const rot2 = thisAngle * 0.302 + 2.1;
  const cr2 = Math.cos(rot2);
  const sr2 = Math.sin(rot2);
  const ny2 = y * cr2 - z * sr2;
  const nz2 = y * sr2 + z * cr2;
  y = ny2;
  z = nz2;

  star.position[0] = x;
  star.position[1] = y;
  star.position[2] = z;
}

// --- Spark ---
interface Spark {
  position: [number, number, number];
  mystery: number;
  color: [number, number, number, number];
}

function createSpark(i: number): Spark {
  return {
    position: [0, 0, 0],
    mystery: (BIGMYSTERY * i) / (NUM_SPARKS + 1),
    color: [0, 0, 0, 1],
  };
}

function updateSpark(
  spark: Spark,
  star: Star,
  dt: number,
  time: number
): void {
  const thisAngle = star.angle;
  const thisPointInRadians = (2.0 * Math.PI * spark.mystery) / BIGMYSTERY;

  // Same modulating factor
  const cf =
    (1.0 +
      Math.cos(0.31 * (thisPointInRadians * 2.0 + thisAngle)) +
      Math.cos(1.7 * thisPointInRadians + 0.27 * thisAngle) +
      Math.cos(3.1 * thisPointInRadians + thisAngle * 0.73)) *
    0.25;

  // Spark uses FIELD_RANGE (1000) instead of 250
  let x =
    FIELD_RANGE * cf * Math.cos(11.0 * (thisPointInRadians + 3.0 * thisAngle));
  let y =
    FIELD_RANGE * cf * Math.sin(12.0 * (thisPointInRadians + 4.0 * thisAngle));
  let z =
    FIELD_RANGE * Math.cos(23.0 * (thisPointInRadians + 12.0 * thisAngle));

  // Rotation 1
  const rot1 = thisAngle * 0.501 + 5.2;
  const cr1 = Math.cos(rot1);
  const sr1 = Math.sin(rot1);
  const nx = x * cr1 - y * sr1;
  const ny = x * sr1 + y * cr1;
  x = nx;
  y = ny;

  // Rotation 2
  const rot2 = thisAngle * 0.302 + 2.1;
  const cr2 = Math.cos(rot2);
  const sr2 = Math.sin(rot2);
  const ny2 = y * cr2 - z * sr2;
  const nz2 = y * sr2 + z * cr2;
  y = ny2;
  z = nz2;

  // Add incohesion jitter
  x += randBell(INCOHESION * x);
  y += randBell(INCOHESION * y);
  z += randBell(INCOHESION * z);

  spark.position[0] = x;
  spark.position[1] = y;
  spark.position[2] = z;

  // Color cycling — phase-shifted cosines through RGB
  const cycleTime = 6.0 * Math.PI;
  const colorRot = 2.0 * Math.PI / cycleTime;
  const redPhaseShift = 0;
  const greenPhaseShift = cycleTime / 3.0;
  const bluePhaseShift = (cycleTime * 2.0) / 3.0;

  const colorTime = time * 0.3;
  spark.color[0] =
    0.109375 * (Math.cos((colorTime + redPhaseShift) * colorRot) + 1.0);
  spark.color[1] =
    0.109375 * (Math.cos((colorTime + greenPhaseShift) * colorRot) + 1.0);
  spark.color[2] =
    0.109375 * (Math.cos((colorTime + bluePhaseShift) * colorRot) + 1.0);
  spark.color[3] = 0.85;
}

// --- Smoke Particle ---
interface SmokeParticle {
  position: [number, number, number];
  oldPosition: [number, number, number];
  velocity: [number, number, number];
  color: [number, number, number, number];
  dead: boolean;
  age: number;
  stream: number; // which spark this particle follows
}

function createSmokeParticle(): SmokeParticle {
  return {
    position: [0, 0, 0],
    oldPosition: [0, 0, 0],
    velocity: [0, 0, 0],
    color: [0, 0, 0, 0],
    dead: true,
    age: 0,
    stream: 0,
  };
}

interface FlurryState {
  star: Star;
  sparks: Spark[];
  smoke: SmokeParticle[];
  nextParticle: number;
  spawnTimer: number;
  time: number;
  prevStarPos: [number, number, number];
}

function createFlurryState(): FlurryState {
  const sparks: Spark[] = [];
  for (let i = 0; i < NUM_SPARKS; i++) {
    sparks.push(createSpark(i));
  }

  const smoke: SmokeParticle[] = [];
  for (let i = 0; i < NUM_SMOKE; i++) {
    smoke.push(createSmokeParticle());
  }

  return {
    star: createStar(),
    sparks,
    smoke,
    nextParticle: 0,
    spawnTimer: 0,
    time: 0,
    prevStarPos: [0, 0, 0],
  };
}

function updateFlurry(state: FlurryState, dt: number): void {
  // Cap dt to avoid huge jumps
  const clampDt = Math.min(dt, 50);
  state.time += clampDt * 0.001;

  // Save previous star position for velocity
  state.prevStarPos[0] = state.star.position[0];
  state.prevStarPos[1] = state.star.position[1];
  state.prevStarPos[2] = state.star.position[2];

  // Update star
  updateStar(state.star, clampDt);

  // Star velocity (for spawning particles with initial momentum)
  const starVelX =
    (state.star.position[0] - state.prevStarPos[0]) * 5.0;
  const starVelY =
    (state.star.position[1] - state.prevStarPos[1]) * 5.0;
  const starVelZ =
    (state.star.position[2] - state.prevStarPos[2]) * 5.0;

  // Update sparks
  for (let i = 0; i < NUM_SPARKS; i++) {
    updateSpark(state.sparks[i], state.star, clampDt, state.time);
  }

  // Frame rate modifier for physics stability
  const frameRate = clampDt / 16.667;
  const drag = Math.pow(DRAG_BASE, clampDt * 85.0 * 0.001);

  // Spawn new particles (about 121 per second)
  state.spawnTimer += clampDt;
  const spawnInterval = 1000.0 / 121.0; // ~8.26ms

  while (state.spawnTimer >= spawnInterval) {
    state.spawnTimer -= spawnInterval;

    const p = state.smoke[state.nextParticle];
    p.dead = false;
    p.age = 0;
    p.position[0] = state.star.position[0];
    p.position[1] = state.star.position[1];
    p.position[2] = state.star.position[2];
    p.oldPosition[0] = p.position[0];
    p.oldPosition[1] = p.position[1];
    p.oldPosition[2] = p.position[2];
    p.velocity[0] = starVelX + randBell(50);
    p.velocity[1] = starVelY + randBell(50);
    p.velocity[2] = starVelZ + randBell(50);
    p.stream = state.nextParticle % NUM_SPARKS;

    // Color from assigned spark with some jitter
    const spark = state.sparks[p.stream];
    p.color[0] = spark.color[0] + randFlt(-COLOR_INCOHERENCE, COLOR_INCOHERENCE);
    p.color[1] = spark.color[1] + randFlt(-COLOR_INCOHERENCE, COLOR_INCOHERENCE);
    p.color[2] = spark.color[2] + randFlt(-COLOR_INCOHERENCE, COLOR_INCOHERENCE);
    p.color[3] = 0.7;

    state.nextParticle = (state.nextParticle + 1) % NUM_SMOKE;
  }

  // Update all smoke particles
  for (let i = 0; i < NUM_SMOKE; i++) {
    const p = state.smoke[i];
    if (p.dead) continue;

    p.age += clampDt;

    // Save old position for trail rendering
    p.oldPosition[0] = p.position[0];
    p.oldPosition[1] = p.position[1];
    p.oldPosition[2] = p.position[2];

    // Gravity attraction to each spark
    for (let j = 0; j < NUM_SPARKS; j++) {
      const spark = state.sparks[j];
      const dx = spark.position[0] - p.position[0];
      const dy = spark.position[1] - p.position[1];
      const dz = spark.position[2] - p.position[2];

      const rsquared = dx * dx + dy * dy + dz * dz + 0.01;
      let f = (GRAVITY / rsquared) * frameRate;

      // Bias toward assigned stream
      if (j === p.stream) {
        f *= 1.0 + STREAM_BIAS;
      }

      const dist = Math.sqrt(rsquared);
      const invDist = 1.0 / dist;

      p.velocity[0] += f * dx * invDist;
      p.velocity[1] += f * dy * invDist;
      p.velocity[2] += f * dz * invDist;
    }

    // Apply drag
    p.velocity[0] *= drag;
    p.velocity[1] *= drag;
    p.velocity[2] *= drag;

    // Integrate position
    p.position[0] += p.velocity[0] * frameRate * 0.6;
    p.position[1] += p.velocity[1] * frameRate * 0.6;
    p.position[2] += p.velocity[2] * frameRate * 0.6;

    // Kill particles moving too fast (escaped the system)
    const vSq =
      p.velocity[0] * p.velocity[0] +
      p.velocity[1] * p.velocity[1] +
      p.velocity[2] * p.velocity[2];
    if (vSq >= 25000000 || p.age > 12000) {
      p.dead = true;
    }

    // Fade out with age
    p.color[3] = Math.max(0, 0.7 - p.age * 0.00005);
  }
}

// --- Rendering ---

function drawFlurry(
  ctx: CanvasRenderingContext2D,
  state: FlurryState,
  w: number,
  h: number
): void {
  // Clear to black
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  // Set additive blending for glow effect
  ctx.globalCompositeOperation = "lighter";

  const cx = w / 2;
  const cy = h / 2;
  // Scale factor to map the simulation coordinates to screen
  const scale = Math.min(w, h) / SERAPH_DISTANCE;

  // Draw smoke particles as glowing circles
  for (let i = 0; i < NUM_SMOKE; i++) {
    const p = state.smoke[i];
    if (p.dead || p.color[3] <= 0) continue;

    // Project 3D → 2D (simple orthographic with depth fading)
    const depth = (p.position[2] + FIELD_RANGE) / (FIELD_RANGE * 2.0);
    const depthScale = 0.5 + depth * 0.5;

    const sx = cx + p.position[0] * scale * depthScale;
    const sy = cy + p.position[1] * scale * depthScale;

    // Skip if off screen
    if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

    const r = Math.max(0, Math.min(1, p.color[0]));
    const g = Math.max(0, Math.min(1, p.color[1]));
    const b = Math.max(0, Math.min(1, p.color[2]));
    const a = Math.max(0, Math.min(1, p.color[3])) * depthScale;

    // Particle size based on depth
    const size = 2.5 + depthScale * 2.5;

    // Draw glowing particle
    const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, size);
    gradient.addColorStop(
      0,
      `rgba(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0}, ${a})`
    );
    gradient.addColorStop(
      1,
      `rgba(${(r * 255) | 0}, ${(g * 255) | 0}, ${(b * 255) | 0}, 0)`
    );

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Reset composite operation
  ctx.globalCompositeOperation = "source-over";
}

// --- React Component ---

interface FlurryScreensaverProps {
  active: boolean;
}

export default function FlurryScreensaver({ active }: FlurryScreensaverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<FlurryState | null>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const flurryState = stateRef.current;
    if (!canvas || !flurryState) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate delta time
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Update and draw
    updateFlurry(flurryState, dt);
    drawFlurry(ctx, flurryState, canvas.width, canvas.height);

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current);
      stateRef.current = null;
      lastTimeRef.current = 0;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize state
    stateRef.current = createFlurryState();
    lastTimeRef.current = 0;
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [active, animate]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
