import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import PageHead from "@/components/site/PageHead";
import SiteRow from "@/components/site/SiteRow";
import { frameSpecs, stringSetup, type SpecRow } from "@/data/hobbies";

export const metadata: Metadata = {
  title: "Hobbies",
  description: "Training, tennis, cooking and baking, DJing, photography and Rematch, a tool I built to fix my iTunes library.",
  alternates: { canonical: "https://matthewrmckenzie.com/hobbies" },
};

function SpecList({ title, rows }: { title: string; rows: readonly SpecRow[] }) {
  return (
    <>
      <p className="site-specs-title">{title}</p>
      <dl className="site-specs site-measure">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              <span className="site-num">{row.value}</span>
              {row.note ? <small>{row.note}</small> : null}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export default function HobbiesPage() {
  return (
    <StaticPageLayout>
      <article>
        <PageHead
          eyebrow="Outside of work"
          title="Hobbies"
          lede="Training, tennis, the kitchen, music and a camera."
        />
        <div>
          <SiteRow id="training" heading="Training">
            <div className="site-prose">
              <p>
                I do strength work and classes at the gym and track it all with WHOOP. The splits
                and the recovery and sleep numbers are on the{" "}
                <Link href="/health">Health and Fitness</Link> page.
              </p>
            </div>
          </SiteRow>

          <SiteRow id="tennis" heading="Tennis">
            <div className="site-prose">
              <p>
                I play in Austin. The frame is weighted up from stock, and the string bed is a
                hybrid: natural gut mains for feel and tension hold, polyester crosses for control
                and durability.
              </p>
            </div>
            <SpecList title="Frame: Head Graphene Pro" rows={frameSpecs} />
            <SpecList title="String setup" rows={stringSetup} />
          </SiteRow>

          <SiteRow id="cooking" heading="Cooking and baking">
            <div className="site-prose">
              <p>
                I bake sourdough from my own rye starter, including a city loaf. I make jams, and I
                cook high protein versions of the things I actually want to eat. Every method is
                written down in <Link href="/kitchen">Cooking and Baking</Link> so the results
                repeat.
              </p>
            </div>
          </SiteRow>

          <SiteRow id="djing" heading="DJing and music">
            <div className="site-prose">
              <p>
                I am learning to mix on a Pioneer DDJ-800 in rekordbox. I started with the basics:
                beatmatching, phrasing and clean transitions.
              </p>
            </div>
          </SiteRow>

          <SiteRow id="rematch" heading="Rematch">
            <div className="site-prose">
              <p>
                Years ago iTunes Match scrambled the tags on my lossless library, so songs showed up
                under the wrong artist, album and genre. Rematch is the tool I built in Python to
                fix it. It ignores the old tags, identifies every file by its audio fingerprint
                against MusicBrainz, and sends the few it can&apos;t settle to a review queue. It
                never touches the audio and works on a copy, so the originals stay safe.
              </p>
              <p>
                The result: <span className="num">11,936</span> tracks in a clean library,{" "}
                <span className="num">8,956</span> of them corrected.
              </p>
            </div>
          </SiteRow>

          <SiteRow id="photography" heading="Photography">
            <div className="site-prose">
              <p>
                I studied photography alongside economics at SMU. I am back behind a proper camera.
              </p>
            </div>
          </SiteRow>
        </div>
      </article>
    </StaticPageLayout>
  );
}
