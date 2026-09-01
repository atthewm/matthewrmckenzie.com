// ============================================================================
// PROFILE — single source of truth for identity, role, and contact details
// ============================================================================
// Every page, metadata block, schema object, and the digital business card
// reads from here. Update the role in one place and the whole site follows.
//
// PRIVACY NOTE: `mobile` is deliberately NOT rendered anywhere in the public
// HTML. It is written only into the downloadable vCard, so people who meet
// Matthew and save the contact get it, while scrapers crawling the page do not.
// ============================================================================

export const profile = {
  firstName: "Matthew",
  lastName: "McKenzie",
  fullName: "Matthew McKenzie",
  title: "Senior Vice President, Capital Formation",
  company: "Menlo Equities",
  companyUrl: "https://www.menloequities.com",
  primaryCity: "Austin",

  email: "mckenzie@menloequities.com",
  /** Direct office line — safe to render publicly. */
  directPhone: "512-277-6116",
  /** Personal mobile — vCard only. Never render in public HTML. */
  mobile: "904-434-4444",

  offices: [
    {
      city: "Austin",
      street: "816 Congress Avenue, Suite 1130",
      locality: "Austin",
      region: "TX",
      postalCode: "78701",
    },
    {
      city: "Menlo Park",
      street: "2765 Sand Hill Road, Suite 200",
      locality: "Menlo Park",
      region: "CA",
      postalCode: "94025",
    },
  ],

  social: {
    linkedin: "https://www.linkedin.com/in/mrmckenzie/",
    github: "https://github.com/atthewm",
    instagram: "https://www.instagram.com/mrem/",
  },

  scheduleUrl: "https://cal.com/mattmck/site",

  // -- Bio, per the official Menlo Equities team page ------------------------
  bio: "Matthew McKenzie is responsible for capital formation across Menlo's private wealth channel, with a focus on developing and expanding relationships with high-net-worth and ultra-high-net-worth investors, family offices, and registered investment advisors across the firm's investment platforms.",
  priorBio:
    "Prior to joining Menlo in 2026, Matthew was Vice President, Investor Relations at Civitas Capital Group, a Dallas-based real estate and alternative investment manager, where he raised capital from private wealth investors across closed-end funds, open-end perpetual vehicles, and co-investments.",
  educationBio:
    "Matthew holds a BS in Economics and a BA in Public Policy from Southern Methodist University.",

  /** Short one-liner for meta descriptions and cards. */
  tagline: "Capital formation for private wealth, family offices, and RIAs.",

  headshot: "/headshot.jpg",
} as const;

export const previousCompany = {
  name: "Civitas Capital Group",
  url: "https://civitascapital.com",
  title: "Vice President, Investor Relations",
  start: "May 2016",
  end: "2026",
} as const;

/** Full E.164 forms for tel: links and vCard fields. */
export const phoneE164 = {
  direct: "+15122776116",
  mobile: "+19044344444",
} as const;
