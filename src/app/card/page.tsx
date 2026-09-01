import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import { profile, phoneE164 } from "@/config/profile";

// ============================================================================
// /card — digital business card
// ============================================================================
// The destination for the conference QR code. Server rendered, no client JS,
// so it loads instantly on congested venue wifi. The personal mobile number is
// intentionally absent from this markup; it lives only in /card/vcard.
// ============================================================================

const cardPersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.fullName,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  telephone: phoneE164.direct,
  image: `https://matthewrmckenzie.com${profile.headshot}`,
  url: "https://matthewrmckenzie.com/card",
  worksFor: {
    "@type": "Organization",
    name: profile.company,
    url: profile.companyUrl,
  },
  address: profile.offices.map((office) => ({
    "@type": "PostalAddress",
    streetAddress: office.street,
    addressLocality: office.locality,
    addressRegion: office.region,
    postalCode: office.postalCode,
    addressCountry: "US",
  })),
  sameAs: [profile.social.linkedin, "https://matthewrmckenzie.com"],
};

const icon = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function CardPage() {
  return (
    <main className="card-stage">
      <JsonLd data={cardPersonSchema} />

      <article className="card-panel">
        <header className="card-head">
          <Image
            src={profile.headshot}
            alt={profile.fullName}
            width={96}
            height={96}
            className="card-portrait"
            priority
          />
          <h1 className="card-name">{profile.fullName}</h1>
          <p className="card-title">{profile.title}</p>
          <p className="card-company">{profile.company}</p>
        </header>

        <div className="card-actions">
          <a className="card-btn card-btn--primary" href="/card/vcard">
            <svg viewBox="0 0 24 24" {...icon}>
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Save contact
            <span className="card-btn-sub">.vcf</span>
          </a>

          <a className="card-btn" href={`tel:${phoneE164.direct}`}>
            <svg viewBox="0 0 24 24" {...icon}>
              <path d="M4 5c0-1 1-2 2-2h2l2 5-2 1a13 13 0 0 0 6 6l1-2 5 2v2c0 1-1 2-2 2A16 16 0 0 1 4 5Z" />
            </svg>
            Call direct
            <span className="card-btn-sub">{profile.directPhone}</span>
          </a>

          <a className="card-btn" href={`mailto:${profile.email}`}>
            <svg viewBox="0 0 24 24" {...icon}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            Email
          </a>

          <a
            className="card-btn"
            href={profile.scheduleUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" {...icon}>
              <rect x="3" y="4.5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 2.5v4M16 2.5v4" />
            </svg>
            Schedule a call
          </a>
        </div>

        <section className="card-section">
          <p className="card-section-label">About</p>
          <p className="card-bio">{profile.bio}</p>
        </section>

        <section className="card-section">
          <p className="card-section-label">Offices</p>
          <div className="card-offices">
            {profile.offices.map((office) => (
              <div className="card-office" key={office.city}>
                <span className="card-office-city">{office.city}</span>
                <span className="card-office-addr">
                  {office.street}
                  <br />
                  {office.locality}, {office.region} {office.postalCode}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-section">
          <p className="card-section-label">Elsewhere</p>
          <div className="card-links">
            <a
              className="card-chip"
              href={profile.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" {...icon}>
                <path d="M3 21h18M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
              </svg>
              menloequities.com
            </a>
            <a
              className="card-chip"
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
              LinkedIn
            </a>
            <Link className="card-chip" href="/">
              <svg viewBox="0 0 24 24" {...icon}>
                <rect x="3" y="4" width="18" height="12" rx="1.5" />
                <path d="M8 20h8M12 16v4" />
              </svg>
              McKenzieOS
            </Link>
          </div>
        </section>

        <footer className="card-foot">
          <span>matthewrmckenzie.com</span>
          <a href="https://mckm.at" target="_blank" rel="noopener noreferrer">
            mckm.at →
          </a>
        </footer>
      </article>
    </main>
  );
}
