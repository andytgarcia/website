"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SatelliteMark } from "./SatelliteMark";

const navLinks = [
  { label: "About", href: "/#about", sectionId: "about" },
  { label: "Experience", href: "/#experience", sectionId: "experience" },
  { label: "Projects", href: "/#projects", sectionId: "projects" },
  { label: "Skills", href: "/#skills", sectionId: "skills" },
  { label: "Interests", href: "/#interests", sectionId: "interests" },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;

    const ids = navLinks.map((link) => link.sectionId);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveHref(`/#${visible.target.id}`);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.15, 0.4, 0.7] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--color-bg-base)]/72 backdrop-blur-xl border-b border-[var(--color-border)]"
          : "bg-transparent"
      }`}
      style={{ height: "var(--nav-height)" }}
    >
      <div className="max-w-[var(--content-max-width)] mx-auto px-6 h-full flex items-center justify-between">
        {/* Home mark */}
        <Link
          href="/"
          aria-label="Home"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm no-underline"
        >
          <SatelliteMark />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`nav-link font-[family-name:var(--font-mono)] text-xs tracking-widest uppercase px-3 py-2 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cool)] hover:bg-[var(--color-bg-surface)] transition-all duration-200 no-underline ${
                  activeHref === link.href ? "is-active" : ""
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="ml-2">
            <a
              href="/launches"
              aria-current={pathname === "/launches" ? "page" : undefined}
              className="font-[family-name:var(--font-mono)] text-xs tracking-widest uppercase px-4 py-2 rounded border border-[var(--color-accent-warm)] text-[var(--color-accent-warm)] hover:bg-[var(--color-accent-warm)] hover:text-[var(--color-bg-base)] transition-all duration-200 no-underline"
            >
              Launch Dashboard
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 bg-transparent border-none cursor-pointer p-2"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <span
            className={`block w-5 h-0.5 bg-[var(--color-text-primary)] transition-all duration-200 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[var(--color-text-primary)] transition-all duration-200 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[var(--color-text-primary)] transition-all duration-200 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        inert={!mobileOpen}
        className={`md:hidden overflow-hidden transition-all duration-500 bg-[var(--color-bg-base)]/85 backdrop-blur-xl border-b border-[var(--color-border)] ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="list-none m-0 p-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-[family-name:var(--font-mono)] text-sm tracking-widest uppercase block px-4 py-3 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cool)] hover:bg-[var(--color-bg-surface)] transition-all duration-200 no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2">
            <a
              href="/launches"
              aria-current={pathname === "/launches" ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className="font-[family-name:var(--font-mono)] text-sm tracking-widest uppercase block text-center px-4 py-3 rounded border border-[var(--color-accent-warm)] text-[var(--color-accent-warm)] hover:bg-[var(--color-accent-warm)] hover:text-[var(--color-bg-base)] transition-all duration-200 no-underline"
            >
              Launch Dashboard
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
