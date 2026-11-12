import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import CtaBlock from "@/components/ui/CtaBlock";
import Hero from "@/components/home/Hero";
import Chapter from "@/components/home/Chapter";
import LedgerLine from "@/components/home/LedgerLine";
import RecipeFan from "@/components/home/RecipeFan";
import HomeMotionRoot from "@/components/home/HomeMotionRoot";
import StrainSparkline from "@/components/site/StrainSparkline";
import "@/styles/site-home.css";

// ============================================================================
// HOME PAGE
// ============================================================================
// Hero, three chapters (Capital, Training, Kitchen), a hobbies line, the
// closing contact block and a small link to the Mac OS X desktop at /desktop.
// Everything is server-rendered in its final state; HomeMotionRoot adds the
// scroll motion on top when the visitor allows motion.
// ============================================================================

export default function HomePage() {
  return (
    <StaticPageLayout variant="home" hideCta>
      <HomeMotionRoot>
        <Hero />

        <Chapter
          id="capital"
          number="01"
          title="Capital"
          links={
            <Link href="/work" className="site-arrow">
              Work and track record
            </Link>
          }
          data={<LedgerLine />}
        >
          <p>
            I structure capital, build investor partnerships, and develop growth strategy for real
            asset backed businesses. I work across both debt and equity. I care most about
            disciplined underwriting and long term alignment.
          </p>
        </Chapter>

        <Chapter
          id="training"
          number="02"
          title="Training"
          links={
            <Link href="/health" className="site-arrow">
              Health and fitness
            </Link>
          }
          data={<StrainSparkline />}
        >
          <p>
            I train for strength and endurance, and I treat recovery as part of the training. Most
            weeks I run a strength split: back, chest, legs, shoulders, and arms and abs.
          </p>
        </Chapter>

        <Chapter
          id="kitchen"
          number="03"
          title="Kitchen"
          links={
            <>
              <Link href="/kitchen" className="site-arrow">
                Cooking and baking
              </Link>
              <Link href="/recipes" className="site-arrow">
                All recipes
              </Link>
            </>
          }
          data={<RecipeFan />}
        >
          <p>
            I bake sourdough from a rye starter I built myself. I also make jam and work out high
            protein versions of everyday meals. I write each recipe down properly so it comes out
            the same every time.
          </p>
        </Chapter>

        <section className="home-hobbies site-wrap" aria-label="Hobbies">
          <Link href="/hobbies" className="site-grid home-hobbies-row">
            <span className="site-eyebrow col-head">Hobbies</span>
            <span className="col-body home-hobbies-words">
              Tennis, DJing, photography and Rematch
              <span className="home-hobbies-arrow" aria-hidden="true">
                &rarr;
              </span>
            </span>
          </Link>
        </section>
      </HomeMotionRoot>

      <CtaBlock />

      <p className="home-desktop site-wrap">
        Prefer the old Mac OS X desktop?{" "}
        <Link href="/desktop" className="site-link">
          Desktop mode
        </Link>
      </p>
    </StaticPageLayout>
  );
}
