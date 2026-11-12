import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import PageHead from "@/components/site/PageHead";

export default function NotFound() {
  return (
    <StaticPageLayout>
      <PageHead
        eyebrow="404"
        title="Page not found"
        lede="This page doesn't exist. Maybe it was moved, or maybe it never was."
      >
        <p className="col-body">
          <Link href="/" className="site-arrow">
            Back to the homepage
          </Link>
        </p>
      </PageHead>
    </StaticPageLayout>
  );
}
