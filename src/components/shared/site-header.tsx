"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { primaryNavigation } from "@/config/navigation";
import { BrandMark } from "./brand-mark";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.dataset.menuOpen = isOpen ? "true" : "false";
    return () => {
      delete document.body.dataset.menuOpen;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <BrandMark inverse />
        <nav className="desktop-navigation" aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="visit-link" href="/contact#schedule-visit">
          Schedule a visit
        </Link>
        <button
          ref={menuButtonRef}
          className="menu-button"
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="sr-only">
            {isOpen ? "Close navigation" : "Open navigation"}
          </span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      <div
        className="mobile-navigation"
        id="mobile-navigation"
        hidden={!isOpen}
      >
        <nav aria-label="Mobile navigation">
          {primaryNavigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link
          className="mobile-navigation__visit"
          href="/contact#schedule-visit"
          onClick={() => setIsOpen(false)}
        >
          Schedule a visit <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}
