import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import EmptyContent from "@/components/ui/EmptyContent";
import ProseRows from "@/components/site/ProseRows";

export const metadata: Metadata = {
  title: "Now",
  description: "What Matthew McKenzie is focused on right now: capital formation at Menlo Equities, training, and cooking.",
  alternates: { canonical: "https://matthewrmckenzie.com/now" },
};

export default async function NowPage() {
  const content = await getContent("now");
  return (
    <StaticPageLayout>
      {content ? (
        <ProseRows html={content.html} eyebrow="A snapshot" />
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
