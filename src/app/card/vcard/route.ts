// ============================================================================
// GET /card/vcard — downloadable vCard (.vcf)
// ============================================================================
// Serves a vCard 3.0 file so anyone who scans the conference QR can tap
// "Save contact" and land straight in their phone's address book.
//
// This is the ONLY place the personal mobile number is exposed. It is not
// rendered in any page HTML, so it stays out of scrapers and search indexes
// while still reaching people who actually meet Matthew.
// ============================================================================

import { profile, phoneE164 } from "@/config/profile";

export const runtime = "nodejs";

/** Escape per RFC 6350: backslash, comma, and semicolon are reserved. */
function esc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export async function GET() {
  const [austin, menloPark] = profile.offices;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(profile.lastName)};${esc(profile.firstName)};;;`,
    `FN:${esc(profile.fullName)}`,
    `ORG:${esc(profile.company)}`,
    `TITLE:${esc(profile.title)}`,
    `EMAIL;type=INTERNET,WORK:${profile.email}`,
    `TEL;type=WORK,VOICE:${phoneE164.direct}`,
    `TEL;type=CELL,VOICE:${phoneE164.mobile}`,
    `ADR;type=WORK;type=pref:;;${esc(austin.street)};${esc(austin.locality)};${austin.region};${austin.postalCode};USA`,
    `ADR;type=WORK:;;${esc(menloPark.street)};${esc(menloPark.locality)};${menloPark.region};${menloPark.postalCode};USA`,
    `URL:${profile.companyUrl}`,
    `URL:https://matthewrmckenzie.com`,
    `X-SOCIALPROFILE;type=linkedin:${profile.social.linkedin}`,
    `NOTE:${esc(profile.tagline)}`,
    `REV:${new Date().toISOString()}`,
    "END:VCARD",
  ];

  // vCard spec requires CRLF line endings.
  const body = lines.join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Matthew-McKenzie.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
