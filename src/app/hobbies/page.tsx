import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import { frameSpecs, stringSetup, type SpecRow } from "@/data/hobbies";

export const metadata: Metadata = {
  title: "Hobbies",
  description: "Training, tennis, cooking and baking, DJing, photography and Rematch, a tool I built to fix my iTunes library.",
  alternates: { canonical: "https://matthewrmckenzie.com/hobbies" },
};

function SpecList({ title, rows }: { title: string; rows: readonly SpecRow[] }) {
  return (
    <div className="mt-5">
      <h3 className="site-spec-title">{title}</h3>
      <dl className="site-specs">
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
    </div>
  );
}

export default function HobbiesPage() {
  return (
    <StaticPageLayout title="Hobbies">
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Hobbies", url: "https://matthewrmckenzie.com/hobbies" },
      ])} />
      <article className="site-prose">
        <h1>Hobbies</h1>
        <p className="site-lede">Training, tennis, the kitchen, music and a camera.</p>

        <h2 id="training">Training</h2>
        <p>
          I do strength work and classes at the gym and track it all with WHOOP. The splits and the
          recovery and sleep numbers are on the <Link href="/health">Health and Fitness</Link> page.
        </p>

        <h2 id="tennis">Tennis</h2>
        <p>
          I play in Austin. The frame is weighted up from stock, and the string bed is a hybrid:
          natural gut mains for feel and tension hold, polyester crosses for control and durability.
        </p>
      </article>
      <SpecList title="Frame: Head Graphene Pro" rows={frameSpecs} />
      <SpecList title="String setup" rows={stringSetup} />

      <article className="site-prose mt-2">
        <h2 id="cooking">Cooking and baking</h2>
        <p>
          I bake sourdough from my own rye starter, including a city loaf. I make jams, and I cook
          high protein versions of the things I actually want to eat. Every method is written down
          in <Link href="/kitchen">Cooking and Baking</Link> so the results repeat.
        </p>

        <h2 id="djing">DJing and music</h2>
        <p>
          I am learning to mix on a Pioneer DDJ-800 in rekordbox. I started with the basics:
          beatmatching, phrasing and clean transitions.
        </p>

        <h2 id="rematch">Rematch</h2>
        <p>
          Years ago iTunes Match scrambled the tags on my lossless library, so songs showed up under
          the wrong artist, album and genre. Rematch is the tool I built in Python to fix it. It
          ignores the old tags, identifies every file by its audio fingerprint against MusicBrainz,
          and sends the few it can&apos;t settle to a review queue. It never touches the audio and
          works on a copy, so the originals stay safe.
        </p>
        <p>
          The result: <span className="site-num">11,936</span> tracks in a clean library,{" "}
          <span className="site-num">8,956</span> of them corrected.
        </p>

        <h2 id="photography">Photography</h2>
        <p>I studied photography alongside economics at SMU. I am back behind a proper camera.</p>
      </article>
    </StaticPageLayout>
  );
}
