export default function Footer() {
  return (
    <footer className="py-10 px-6 md:px-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium tracking-[0.15em] uppercase text-text-muted/50">
          ScoreDeck
        </span>
        <span className="text-text-muted/20">&middot;</span>
        <span className="text-text-muted/30 text-[10px] font-light tracking-wider">
          &copy; {new Date().getFullYear()}
        </span>
      </div>
      <div className="flex gap-6">
        {[
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Contact", href: "/contact" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-text-muted/40 text-[10px] font-light tracking-wider hover:text-text-muted transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
