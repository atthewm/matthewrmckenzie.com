import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import CalEmbed from "@/components/ui/CalEmbed";
import EmptyContent from "@/components/ui/EmptyContent";
import ProseRows from "@/components/site/ProseRows";
import SiteRow from "@/components/site/SiteRow";

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
        <ProseRows html={content.html} eyebrow="Get in touch">
          <SiteRow heading="Book a time" wide>
            <CalEmbed />
          </SiteRow>
        </ProseRows>
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
