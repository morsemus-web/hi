"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function scrollTo(id: string) {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 px-6 md:px-8 flex items-center justify-between bg-bg/80 backdrop-blur-xl border-b border-border transition-colors duration-300">
      <div className="flex items-center gap-10 md:gap-16">
        <span className="text-sm font-medium tracking-[0.15em] uppercase text-text-primary">
          ScoreDeck
        </span>
        <ul className="hidden md:flex gap-8">
          {["Features", "Pricing", "Waitlist"].map((item) => (
            <li key={item}>
              <button
                onClick={() => scrollTo(`#${item.toLowerCase()}`)}
                className="text-[11px] font-light uppercase tracking-[0.12em] text-text-muted hover:text-text-dim transition-colors duration-200 cursor-pointer"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-text-muted hover:text-text-dim hover:bg-overlay-5 transition-colors duration-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        )}
        <button
          onClick={() => scrollTo("#waitlist")}
          className="hidden sm:block text-[11px] font-light uppercase tracking-[0.1em] text-text-muted hover:text-text-dim transition-colors duration-200 cursor-pointer"
        >
          Join Waitlist
        </button>
        <a
          href="https://chaddhafateh.gumroad.com/l/tgdwsy?wanted=true"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.1em] text-bg bg-accent hover:bg-accent/90 px-3 sm:px-5 py-2 transition-colors duration-200 cursor-pointer rounded-md"
        >
          Get Early Access
        </a>
      </div>
    </nav>
  );
}
