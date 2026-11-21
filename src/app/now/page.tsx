import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Now",
  description: "What Matthew McKenzie is focused on right now: capital formation at Menlo Equities, mckm.at, baking, and training.",
  openGraph: {
    title: "Now | Matthew McKenzie",
    description: "Capital formation at Menlo Equities, mckm.at, baking, and training.",
    type: "website",
    url: "https://matthewrmckenzie.com/now",
    images: ["/opengraph-image"],
  },
  alternates: { canonical: "https://matthewrmckenzie.com/now" },
};

export default async function NowPage() {
  const content = await getContent("now");
  return (
    <StaticPageLayout section="/now">
      {content ? (
        <article className="site-prose" dangerouslySetInnerHTML={{ __html: content.html }} />
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
