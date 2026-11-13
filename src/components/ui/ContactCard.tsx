import React from "react";
import { profile } from "@/config/profile";

// ============================================================================
// CONTACT CARD (reading pages)
// ============================================================================
// The companion page for /about, /work and the rest in the iPhone Duo book
// and laptop poses: who I am and how to reach me, beside the page's content.
// Only the direct office line is public; the mobile number stays in the vCard.
// ============================================================================

export default function ContactCard({ className = "" }: { className?: string }) {
  const office = profile.offices[0];
  return (
    <address className={`doc-contact-card ${className}`}>
      <p className="site-eyebrow">{profile.company}</p>
      <p className="doc-contact-name">{profile.fullName}</p>
      <p className="doc-contact-line">{profile.title}</p>
      <p className="doc-contact-line">
        {office.street}
        <br />
        {office.locality}, Texas {office.postalCode}
      </p>
      <p className="doc-contact-line">
        <a className="site-link" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <br />
        <a className="site-link site-num" href={`tel:+1${profile.directPhone.replace(/\D/g, "")}`}>
          {profile.directPhone}
        </a>
      </p>
    </address>
  );
}
