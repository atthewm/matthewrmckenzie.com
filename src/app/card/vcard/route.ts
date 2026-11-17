// ============================================================================
// GET /card/vcard: downloadable vCard (.vcf)
// ============================================================================
// Serves a vCard 3.0 file so anyone who scans the conference QR can tap
// "Save contact" and land straight in their phone's address book.
//
// This is the ONLY place the personal mobile number is exposed. It is not in
// any page HTML, in client JavaScript or in the repository: it comes from the
// OWNER_MOBILE_E164 environment variable through src/lib/owner-contact.ts, and
// when that is unset the card simply has no mobile line. robots.txt keeps
// crawlers away from this URL and the response is marked noindex.
// ============================================================================

import { profile, phoneE164 } from "@/config/profile";
import { getOwnerMobile } from "@/lib/owner-contact";

export const runtime = "nodejs";
// Built once per deploy and served as a static file. REV is the build time,
// and the mobile number is read from the environment at build time too.
export const dynamic = "force-static";

/** Escape per RFC 6350: backslash, comma, and semicolon are reserved. */
function esc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export async function GET() {
  const [austin, menloPark] = profile.offices;
  const mobile = getOwnerMobile();

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(profile.lastName)};${esc(profile.firstName)};;;`,
    `FN:${esc(profile.fullName)}`,
    `ORG:${esc(profile.company)}`,
    `TITLE:${esc(profile.title)}`,
    `EMAIL;type=INTERNET,WORK:${profile.email}`,
    `TEL;type=WORK,VOICE:${phoneE164.direct}`,
    ...(mobile ? [`TEL;type=CELL,VOICE:${mobile}`] : []),
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
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
