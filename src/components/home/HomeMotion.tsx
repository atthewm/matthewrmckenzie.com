"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// ============================================================================
// HOME MOTION (Client Component, loaded with a dynamic import)
// ============================================================================
// All homepage animation. The markup and CSS already show every element in its
// final state; these tweens only animate *from* a starting state, and only
// inside gsap.matchMedia when the visitor has not asked for reduced motion.
// With reduced motion nothing here runs, so nothing moves and nothing hides.
// useGSAP scopes the selectors and reverts everything on unmount.
// ============================================================================

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const WIDE = "(min-width: 900px)";
const NARROW = "(max-width: 899.98px)";
const HERO_INTRO_CLASS = "hero-intro";
const ENTER_AT = 0.8;
const SCRUB_LAG = 0.4;

/** Hero: the name rises line by line, on the first load of a session only. */
function revealHeroName(root: HTMLElement): void {
  const html = document.documentElement;
  if (!html.classList.contains(HERO_INTRO_CLASS)) return;

  const name = root.querySelector<HTMLElement>("[data-hero-name]");
  const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]", root);
  if (!name || lines.length === 0) {
    html.classList.remove(HERO_INTRO_CLASS);
    return;
  }

  // aria "none": each line stays whole, so the heading still reads normally.
  const split = SplitText.create(lines, { type: "lines", mask: "lines", aria: "none" });
  gsap.set(name, { visibility: "visible" });
  gsap.from(split.lines, {
    yPercent: 100,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
    onComplete: () => {
      // The split stays in place until useGSAP reverts it on unmount. Putting
      // the original text back here would repaint the whole name as new
      // content after the animation, which browsers count as a late paint.
      gsap.set(split.masks, { overflow: "visible" });
      html.classList.remove(HERO_INTRO_CLASS);
    },
  });
}

/** Chapters: fade and rise 24px as each one enters, once. */
function riseChapters(root: HTMLElement): void {
  gsap.utils.toArray<HTMLElement>("[data-chapter]", root).forEach((chapter) => {
    const target = chapter.querySelector<HTMLElement>("[data-chapter-rise]");
    if (!target) return;
    // Already on screen (or scrolled past) when the page loads: leave it be.
    if (chapter.getBoundingClientRect().top <= window.innerHeight * ENTER_AT) return;

    gsap.from(target, {
      autoAlpha: 0,
      y: 24,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: chapter, start: "top 80%", once: true },
    });
  });
}

/** Capital: the ledger line draws left to right; entries appear as it passes. */
function drawLedger(root: HTMLElement): void {
  const ledger = root.querySelector<HTMLElement>("[data-ledger]");
  const line = ledger?.querySelector<HTMLElement>("[data-ledger-line]");
  if (!ledger || !line) return;
  const entries = gsap.utils.toArray<HTMLElement>("[data-ledger-entry]", ledger);

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ledger, start: "top 85%", end: "top 35%", scrub: SCRUB_LAG },
  });
  timeline.from(line, { scaleX: 0, transformOrigin: "left center", duration: 1 }, 0);
  entries.forEach((entry, i) => {
    timeline.from(entry, { autoAlpha: 0, duration: 0.15 }, 0.02 + (i / entries.length) * 0.85);
  });
}

/** Training: the sparkline is revealed left to right, as if being drawn. */
function drawSparkline(root: HTMLElement): void {
  const plot = root.querySelector<HTMLElement>("[data-spark-plot]");
  if (!plot) return;

  gsap.fromTo(
    plot,
    { clipPath: "inset(0% 100% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      scrollTrigger: { trigger: plot, start: "top 85%", end: "top 40%", scrub: SCRUB_LAG },
    },
  );
}

/** Kitchen: the recipe cards start as a stack and fan out to where CSS puts them. */
function fanCards(root: HTMLElement): void {
  const fan = root.querySelector<HTMLElement>("[data-fan]");
  if (!fan) return;
  const cards = gsap.utils.toArray<HTMLElement>("[data-fan-card]", fan);
  const middle = cards[Math.floor(cards.length / 2)];
  if (!middle) return;

  gsap.from(cards, {
    x: (_i: number, card: HTMLElement) => middle.offsetLeft - card.offsetLeft,
    y: (_i: number, card: HTMLElement) => middle.offsetTop - card.offsetTop,
    rotation: (i: number) => (i - Math.floor(cards.length / 2)) * 1.5,
    ease: "none",
    scrollTrigger: {
      trigger: fan,
      start: "top 90%",
      end: "top 40%",
      scrub: SCRUB_LAG,
      invalidateOnRefresh: true,
    },
  });
}

export default function HomeMotion({ scope }: { scope: RefObject<HTMLElement | null> }) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const html = document.documentElement;

      const mm = gsap.matchMedia();

      // Runs again (after reverting) when the layout crosses 900px, so the fan
      // and ledger always measure the layout they are animating.
      mm.add({ wide: `${WIDE} and ${MOTION_OK}`, narrow: `${NARROW} and ${MOTION_OK}` }, () => {
        revealHeroName(root);
        riseChapters(root);
        drawLedger(root);
        drawSparkline(root);
        fanCards(root);
        return () => html.classList.remove(HERO_INTRO_CLASS);
      });

      // Reduced motion: no tweens at all. Just make sure the name is not held back.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        html.classList.remove(HERO_INTRO_CLASS);
      });
    },
    { scope },
  );

  return null;
}
