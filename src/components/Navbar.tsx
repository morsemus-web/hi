"use client";

export default function Navbar() {
  function scrollTo(id: string) {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 px-6 md:px-8 flex items-center justify-between bg-bg/80 backdrop-blur-xl border-b border-border">
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => scrollTo("#waitlist")}
          className="hidden sm:block text-[11px] font-light uppercase tracking-[0.1em] text-text-muted hover:text-text-dim transition-colors duration-200 cursor-pointer"
        >
          Join Waitlist
        </button>
        <button
          onClick={() => scrollTo("#pricing")}
          className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.1em] text-bg bg-accent hover:bg-accent/90 px-3 sm:px-5 py-2 transition-colors duration-200 cursor-pointer rounded-md"
        >
          Get Early Access
        </button>
      </div>
    </nav>
  );
}
