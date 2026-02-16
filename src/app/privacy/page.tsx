import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for matthewrmckenzie.com",
};

export default function PrivacyPolicyPage() {
  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "48px 24px",
        fontFamily:
          'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#333",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
        Last updated: February 16, 2026
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Overview
        </h2>
        <p>
          This website, matthewrmckenzie.com, is a personal portfolio site
          operated by Matthew McKenzie. This policy explains how data is
          collected, used, and protected when you visit or interact with the
          site.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Data Collected
        </h2>
        <p>
          This site does not collect personal information from visitors. There
          are no analytics trackers, advertising pixels, or third-party data
          collection scripts. No cookies are set for visitor tracking.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          WHOOP Integration
        </h2>
        <p>
          This site integrates with the WHOOP Developer API to display the site
          owner&apos;s personal health and fitness data. This integration uses
          the official WHOOP OAuth 2.0 authorization flow. The following applies
          to this integration:
        </p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>
            Only the site owner&apos;s WHOOP account is connected. Visitors
            cannot and do not connect their own WHOOP accounts.
          </li>
          <li style={{ marginBottom: 6 }}>
            WHOOP data retrieved includes: profile basics, recovery scores,
            sleep summaries, workout summaries, strain data, and body
            measurements.
          </li>
          <li style={{ marginBottom: 6 }}>
            All WHOOP API tokens are stored server-side with encryption. Tokens
            are never exposed to the browser or included in client-side code.
          </li>
          <li style={{ marginBottom: 6 }}>
            The site owner can disconnect the WHOOP integration at any time,
            which deletes all stored tokens and cached data.
          </li>
          <li style={{ marginBottom: 6 }}>
            No WHOOP data is shared with third parties, sold, or used for any
            purpose other than displaying it on this personal website.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Third-Party Services
        </h2>
        <p>
          This site is hosted on Vercel. Vercel may collect standard server logs
          (IP addresses, request timestamps) as part of normal web hosting
          operations. Refer to{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0066cc" }}
          >
            Vercel&apos;s Privacy Policy
          </a>{" "}
          for details.
        </p>
        <p style={{ marginTop: 8 }}>
          WHOOP data is accessed through the official WHOOP Developer API. Refer
          to{" "}
          <a
            href="https://www.whoop.com/us/en/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0066cc" }}
          >
            WHOOP&apos;s Privacy Policy
          </a>{" "}
          for how they handle data.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Data Retention
        </h2>
        <p>
          WHOOP API responses are cached server-side for a short period (up to
          one hour) to minimize API calls. Cached data is automatically
          refreshed. No visitor data is retained.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Contact
        </h2>
        <p>
          If you have questions about this privacy policy, you can reach Matthew
          McKenzie through the Contact page on this site.
        </p>
      </section>
    </div>
  );
}
