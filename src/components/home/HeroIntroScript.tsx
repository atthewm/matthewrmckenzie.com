// Runs in <head>, before anything paints. On the homepage, on the first visit
// in a session, and only when motion is allowed, it marks <html> so CSS can
// hold the hero name back until HomeMotion reveals it. Without the mark (other
// pages, repeat visits, reduced motion, no JavaScript) the name is simply there.

const HERO_INTRO_SCRIPT = `try{if(location.pathname==="/"&&!sessionStorage.getItem("mrm-hero")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("hero-intro");sessionStorage.setItem("mrm-hero","1")}}catch(e){}`;

export default function HeroIntroScript() {
  return <script dangerouslySetInnerHTML={{ __html: HERO_INTRO_SCRIPT }} />;
}
