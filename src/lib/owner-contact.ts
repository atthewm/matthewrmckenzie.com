import "server-only";

// ============================================================================
// OWNER CONTACT (server only)
// ============================================================================
// The personal mobile number. It is handed to people who save the contact
// card and to nobody else, so it must not be in page HTML, in client
// JavaScript, or in this public repository. It lives in an environment
// variable, and src/app/card/vcard/route.ts is the only reader.
//
//   OWNER_MOBILE_E164   full international form, for example +15125550123
//
// Unset, or not a valid E.164 number, means the vCard simply has no mobile
// line. The "server-only" import makes the build fail if a client component
// ever imports this file.
// ============================================================================

const E164 = /^\+[1-9]\d{6,14}$/;

/** The owner's mobile in E.164 form, or null when it is not configured. */
export function getOwnerMobile(): string | null {
  const value = (process.env.OWNER_MOBILE_E164 ?? "").trim();
  return E164.test(value) ? value : null;
}
