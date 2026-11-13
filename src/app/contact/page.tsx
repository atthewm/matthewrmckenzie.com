import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import CalEmbed from "@/components/ui/CalEmbed";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Contact | Investor Relations, Capital Formation, Collaboration",
  description: "Reach Matthew McKenzie about capital formation, investor partnerships, or growth strategy. Schedule a call or send a message.",
  alternates: { canonical: "https://matthewrmckenzie.com/contact" },
  openGraph: {
    title: "Contact | Investor Relations, Capital Formation, Collaboration",
    description: "Reach Matthew McKenzie about capital formation, investor partnerships, or growth strategy. Schedule a call or send a message.",
  },
};

export default async function ContactPage() {
  const content = await getContent("contact");

  return (
    <StaticPageLayout hideCta>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Contact", url: "https://matthewrmckenzie.com/contact" },
      ])} />
      {content ? (
        <article
          className="site-prose"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
      {/* Inline Cal.com scheduling embed */}
      <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--site-rule)" }}>
        <p className="site-eyebrow mb-3">Book a time</p>
        <CalEmbed />
      </div>
    </StaticPageLayout>
  );
}
