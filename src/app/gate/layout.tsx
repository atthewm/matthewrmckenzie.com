import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: {
    canonical: "https://matthewrmckenzie.com/gate",
  },
};

export default function GateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
