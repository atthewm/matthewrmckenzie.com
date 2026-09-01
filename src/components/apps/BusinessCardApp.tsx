"use client";

import Image from "next/image";
import { Phone, Mail, Download, Calendar, ExternalLink, Building2 } from "lucide-react";
import { profile, phoneE164 } from "@/config/profile";

// ============================================================================
// BUSINESS CARD APP
// ============================================================================
// In-desktop version of the digital business card. The canonical, QR-facing
// version lives at /card; this mirrors it inside McKenzieOS so the card is
// present on the desktop rather than buried.
//
// The personal mobile number is never rendered here. It is written only into
// the downloadable vCard served by /card/vcard.
// ============================================================================

export default function BusinessCardApp() {
  return (
    <div className="h-full overflow-auto bg-desktop-surface">
      {/* Header */}
      <div
        className="px-5 pt-6 pb-5 text-center border-b"
        style={{
          borderColor: "var(--desktop-border)",
          background: "linear-gradient(180deg, #29333a 0%, #1c2329 100%)",
        }}
      >
        <Image
          src={profile.headshot}
          alt={profile.fullName}
          width={78}
          height={78}
          className="rounded-full object-cover mx-auto mb-3"
          style={{ border: "1px solid #46525a" }}
        />
        <h2 className="text-[19px] leading-tight" style={{ color: "#e8ecee" }}>
          {profile.fullName}
        </h2>
        <p className="text-[12px] font-medium mt-1.5" style={{ color: "#d9be6b" }}>
          {profile.title}
        </p>
        <p
          className="text-3xs uppercase mt-1"
          style={{ color: "#717e85", letterSpacing: "0.18em" }}
        >
          {profile.company}
        </p>
      </div>

      {/* Primary actions */}
      <div className="p-4 flex flex-col gap-2">
        <a
          href="/card/vcard"
          className="flex items-center gap-2.5 px-3 h-11 rounded-lg text-title font-semibold transition-colors"
          style={{ background: "#d9be6b", color: "#1c2329" }}
        >
          <Download size={16} />
          Save contact
          <span className="ml-auto text-3xs" style={{ color: "rgba(28,35,41,0.6)" }}>
            .vcf
          </span>
        </a>

        <a
          href={`tel:${phoneE164.direct}`}
          className="flex items-center gap-2.5 px-3 h-11 rounded-lg text-title border transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text)" }}
        >
          <Phone size={16} />
          Call direct
          <span className="ml-auto text-3xs text-desktop-text-secondary">
            {profile.directPhone}
          </span>
        </a>

        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-2.5 px-3 h-11 rounded-lg text-title border transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text)" }}
        >
          <Mail size={16} />
          Email
        </a>

        <a
          href={profile.scheduleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 h-11 rounded-lg text-title border transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text)" }}
        >
          <Calendar size={16} />
          Schedule a call
        </a>
      </div>

      {/* Bio */}
      <div className="px-4 pb-4">
        <p className="text-3xs font-bold uppercase tracking-wider text-desktop-text-secondary mb-2">
          About
        </p>
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">{profile.bio}</p>
      </div>

      {/* Offices */}
      <div className="px-4 pb-4">
        <p className="text-3xs font-bold uppercase tracking-wider text-desktop-text-secondary mb-2">
          Offices
        </p>
        <div className="flex flex-col gap-2.5">
          {profile.offices.map((office) => (
            <div key={office.city} className="flex gap-3">
              <span
                className="text-4xs font-bold uppercase tracking-wider w-20 shrink-0 pt-0.5"
                style={{ color: "#b08f3a" }}
              >
                {office.city}
              </span>
              <span className="text-2xs leading-snug text-desktop-text-secondary">
                {office.street}
                <br />
                {office.locality}, {office.region} {office.postalCode}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="px-4 pb-6 flex flex-wrap gap-2">
        <a
          href={profile.companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border text-2xs transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text-secondary)" }}
        >
          <Building2 size={13} />
          menloequities.com
        </a>
        <a
          href="/card"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border text-2xs transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text-secondary)" }}
        >
          <ExternalLink size={13} />
          Full card
        </a>
      </div>
    </div>
  );
}
