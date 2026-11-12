import type { Metadata } from "next";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import PageHead from "@/components/site/PageHead";
import SiteRow from "@/components/site/SiteRow";

export const metadata: Metadata = {
  title: "Privacy Policy | Your Data & Rights",
  description: "Privacy policy for matthewrmckenzie.com. How data is collected, used, and protected when you visit Matthew McKenzie's personal site.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Your Data & Rights",
    description: "Privacy policy for matthewrmckenzie.com. How data is collected, used, and protected when you visit Matthew McKenzie's personal site.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Privacy Policy", url: "https://matthewrmckenzie.com/privacy" },
      ])} />
      <article>
        <PageHead eyebrow="Last updated: February 16, 2026" title="Privacy Policy" />
        <div>
          <SiteRow heading="Overview">
            <div className="site-prose">
              <p>
                This website, matthewrmckenzie.com, is a personal portfolio site
                operated by Matthew McKenzie. This policy explains how data is
                collected, used, and protected when you visit or interact with the
                site.
              </p>
            </div>
          </SiteRow>
          <SiteRow heading="Data Collected">
            <div className="site-prose">
              <p>
                This site uses Vercel Analytics to collect anonymized, aggregate
                usage data such as page views and visitor counts. No personally
                identifiable information is collected through analytics. There are no
                advertising pixels or third-party data collection scripts. No cookies
                are set for visitor tracking.
              </p>
            </div>
          </SiteRow>
          <SiteRow heading="WHOOP Integration">
            <div className="site-prose">
              <p>
                This site integrates with the WHOOP Developer API to display the site
                owner&apos;s personal health and fitness data. This integration uses
                the official WHOOP OAuth 2.0 authorization flow. The following applies
                to this integration:
              </p>
              <ul>
                <li>
                  Only the site owner&apos;s WHOOP account is connected. Visitors
                  cannot and do not connect their own WHOOP accounts.
                </li>
                <li>
                  WHOOP data retrieved includes: profile basics, recovery scores,
                  sleep summaries, workout summaries, strain data, and body
                  measurements.
                </li>
                <li>
                  All WHOOP API tokens are stored server-side with encryption. Tokens
                  are never exposed to the browser or included in client-side code.
                </li>
                <li>
                  The site owner can disconnect the WHOOP integration at any time,
                  which deletes all stored tokens and cached data.
                </li>
                <li>
                  No WHOOP data is shared with third parties, sold, or used for any
                  purpose other than displaying it on this personal website.
                </li>
              </ul>
            </div>
          </SiteRow>
          <SiteRow heading="Third-Party Services">
            <div className="site-prose">
              <p>
                This site is hosted on Vercel and uses Vercel Analytics for anonymized
                usage metrics. Vercel may also collect standard server logs (IP
                addresses, request timestamps) as part of normal web hosting
                operations. Refer to{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel&apos;s Privacy Policy
                </a>{" "}
                for details.
              </p>
              <p>
                WHOOP data is accessed through the official WHOOP Developer API. Refer
                to{" "}
                <a
                  href="https://www.whoop.com/us/en/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WHOOP&apos;s Privacy Policy
                </a>{" "}
                for how they handle data.
              </p>
            </div>
          </SiteRow>
          <SiteRow heading="Data Retention">
            <div className="site-prose">
              <p>
                WHOOP API responses are cached server-side for a short period (up to
                one hour) to minimize API calls. Cached data is automatically
                refreshed. No visitor data is retained.
              </p>
            </div>
          </SiteRow>
          <SiteRow heading="Contact">
            <div className="site-prose">
              <p>
                If you have questions about this privacy policy, you can reach Matthew
                McKenzie through the Contact page on this site.
              </p>
            </div>
          </SiteRow>
        </div>
      </article>
    </StaticPageLayout>
  );
}
