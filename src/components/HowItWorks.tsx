const steps = [
  {
    num: "01",
    title: "Select your teams",
    desc: "Choose from Cricket, Football, Basketball, or F1. Follow the matches that matter to you.",
  },
  {
    num: "02",
    title: "Keep working",
    desc: "ScoreDeck sits quietly above your taskbar. No windows to manage, no tabs to juggle.",
  },
  {
    num: "03",
    title: "Get live updates",
    desc: "Scores, key events, and alerts delivered automatically. Goals, wickets, overtakes — instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-4">
            How it works
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-text-primary">
            Simple by design
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="relative text-center p-8 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.15 + 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-accent/15 bg-accent/5 mb-6">
                <span className="text-sm font-mono font-medium text-accent/70">{s.num}</span>
              </div>
              <h3 className="text-sm font-medium mb-3 text-text-primary">
                {s.title}
              </h3>
              <p className="text-text-muted text-xs font-light leading-relaxed">
                {s.desc}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 -right-3 w-6 text-text-muted/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
