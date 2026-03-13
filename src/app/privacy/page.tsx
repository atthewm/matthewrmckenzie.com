import type { Metadata } from "next";
import StaticPageLayout from "@/components/ui/StaticPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for matthewrmckenzie.com — how data is collected, used, and protected when you visit Matthew McKenzie's personal site.",
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout>
      <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline">
        <h1>Privacy Policy</h1>
        <p className="text-desktop-text-secondary text-sm">
          Last updated: February 16, 2026
        </p>

        <h2>Overview</h2>
        <p>
          This website, matthewrmckenzie.com, is a personal portfolio site
          operated by Matthew McKenzie. This policy explains how data is
          collected, used, and protected when you visit or interact with the
          site.
        </p>

        <h2>Data Collected</h2>
        <p>
          This site uses Vercel Analytics to collect anonymized, aggregate
          usage data such as page views and visitor counts. No personally
          identifiable information is collected through analytics. There are no
          advertising pixels or third-party data collection scripts. No cookies
          are set for visitor tracking.
        </p>

        <h2>WHOOP Integration</h2>
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

        <h2>Third-Party Services</h2>
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

        <h2>Data Retention</h2>
        <p>
          WHOOP API responses are cached server-side for a short period (up to
          one hour) to minimize API calls. Cached data is automatically
          refreshed. No visitor data is retained.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this privacy policy, you can reach Matthew
          McKenzie through the Contact page on this site.
        </p>
      </article>
    </StaticPageLayout>
  );
}
