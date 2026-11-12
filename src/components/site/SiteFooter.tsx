import Link from "next/link";
import { footerLinks } from "./nav";

export default function SiteFooter() {
  return (
    <footer className="site-footer site-noprint">
      <div className="site-wrap">
        <div className="site-grid site-footer-grid">
          <div className="col-head">
            <p className="site-footer-name">Matthew McKenzie</p>
            <p className="site-muted">Capital formation at Menlo Equities. Austin, Texas.</p>
          </div>
          <nav aria-label="Footer navigation" className="site-footer-nav col-wide">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="site-footer-legal">&copy; {new Date().getFullYear()} Matthew McKenzie</p>
      </div>
    </footer>
  );
}
