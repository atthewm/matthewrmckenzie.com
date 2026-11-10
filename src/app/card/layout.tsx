import type { Metadata } from "next";
import { Marcellus } from "next/font/google";
import { profile } from "@/config/profile";
import "./card.css";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-marcellus",
});

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's "%s | Matthew McKenzie" template,
  // which would otherwise append the name a second time.
  title: { absolute: `${profile.fullName} | ${profile.title}` },
  description: `${profile.title} at ${profile.company}. ${profile.tagline} Save contact, call, or email directly.`,
  alternates: {
    canonical: "https://matthewrmckenzie.com/card",
  },
  openGraph: {
    type: "profile",
    title: `${profile.fullName} | ${profile.company}`,
    description: `${profile.title}. ${profile.tagline}`,
    url: "https://matthewrmckenzie.com/card",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={marcellus.variable}>{children}</div>;
}
