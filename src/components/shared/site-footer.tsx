import Link from "next/link";

import { footerNavigation } from "@/config/navigation";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__lead shell">
        <div>
          <p className="eyebrow">Continue the conversation</p>
          <h2>A considered home deserves a considered visit.</h2>
        </div>
        <Link className="footer-visit" href="/contact#schedule-visit">
          Schedule a visit <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="site-footer__body shell">
        <BrandMark inverse />
        <nav aria-label="Footer navigation">
          {footerNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-footer__document">
          <p>Official reference document</p>
          <a
            href="/reference/glitz-pride/brochure.pdf"
            target="_blank"
            rel="noreferrer"
          >
            View brochure <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="site-footer__legal shell">
        <p>
          Confirm current project details directly before making a decision.
        </p>
        <p>© {new Date().getFullYear()} Glitz Pride</p>
      </div>
    </footer>
  );
}
