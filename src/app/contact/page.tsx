import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import CalEmbed from "@/components/ui/CalEmbed";

export const metadata: Metadata = {
  title: "Contact | Investor Relations, Capital Formation, Collaboration",
  description: "Reach Matthew McKenzie about capital formation, investor partnerships, growth strategy, or AI operations tooling. Schedule a call or send a message.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Investor Relations, Capital Formation, Collaboration",
    description: "Reach Matthew McKenzie about capital formation, investor partnerships, growth strategy, or AI operations tooling. Schedule a call or send a message.",
  },
};

export default async function ContactPage() {
  const content = await getContent("contact");

  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Contact", url: "https://matthewrmckenzie.com/contact" },
      ])} />
      {content ? (
        <article
          className="prose prose-sm dark:prose-invert max-w-none
                     prose-headings:font-semibold
                     prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <p className="text-desktop-text-secondary">Content coming soon.</p>
      )}
      {/* Inline Cal.com scheduling embed */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-desktop-text mb-3">Book a Time</h2>
        <CalEmbed />
      </div>
    </StaticPageLayout>
  );
}
