"use client";

import { useEffect, useRef, useState } from "react";

const languages = [
  {
    code: "en",
    name: "English",
    flag: "EN",
    accent: "text-accent",
    bgAccent: "bg-accent/10 border-accent/20",
    commentary:
      "This is gonna be very close into Stowe corner. Perez is catching Charles Leclerc, takes it towards the inside. Perez on the inside, Charles Leclerc gives him just enough space. Can Perez squeeze past? They go wheel to wheel towards Vale now. Who\u2019s gonna be last on the brakes? Leclerc has that inside line. Perez goes off the track, cuts the chicane. Off goes Leclerc! Through goes Hamilton! Unbelievable stuff!",
    sport: "Formula 1",
    audio: "/commentary/1.mp3",
  },
  {
    code: "hi",
    name: "Hindi",
    flag: "HI",
    accent: "text-orange-400",
    bgAccent: "bg-orange-400/10 border-orange-400/20",
    commentary:
      "Ek aakhri mauka Hardik Pandya... Long off, long off, long off! Suryakumar Yadav! Suryakumar Yadav ne pakda apne career ka sabse important catch! Ek low full toss... zaroor umpire check karna chahenge lekin aankhon ke theek niche yeh mamla saaf dikha. Yeh umeedein barkarar dikhi. Yeh final giraft mein dikha.",
    sport: "Cricket",
    audio: "/commentary/2.mp3",
  },
  {
    code: "es",
    name: "Spanish",
    flag: "ES",
    accent: "text-yellow-400",
    bgAccent: "bg-yellow-400/10 border-yellow-400/20",
    commentary:
      "Assist\u00e8ncia de Xavi, m\u00e9s cap a la dreta per a Messi, Messi, Messi, Messi, Messi, Messi, Messi, i... immens Messi! Encara Messi, encara Messi, encara Messi, encara Messi, encara Messi, encara Messi! Gol gol gol gol gol!",
    sport: "Football",
    audio: "/commentary/3.mp3",
  },
  {
    code: "de",
    name: "German",
    flag: "DE",
    accent: "text-red-400",
    bgAccent: "bg-red-400/10 border-red-400/20",
    commentary:
      "27 Yards noch bis zu dem Punkt wo sich Harrison Butker wohlf\u00fchlt. Pass auf. Auf Hill. Hill geht weiter. Er ist in... Er ist unterwegs! Hill ist in der Endzone mit noch einer Minute und zwei Sekunden auf der Uhr. Macht Big Time Hill genau das, was wir von ihm gerne sehen wollten, n\u00e4mlich ein Big Play. Und jetzt kocht das Stadion.",
    sport: "American Football",
    audio: "/commentary/4.mp3",
  },
];

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-150 ${
            active ? "bg-accent/60" : "bg-overlay-15"
          }`}
          style={{
            height: active
              ? `${Math.max(4, Math.sin(i * 0.8 + Date.now() * 0.003) * 14 + 16)}px`
              : `${Math.max(3, Math.sin(i * 0.5) * 6 + 8)}px`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedWaveform({ active }: { active: boolean }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [active]);

  return <WaveformBars active={active} />;
}

export default function Commentary() {
  const [activeLang, setActiveLang] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playCommentary(index: number) {
    // Pause current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Toggle off if same language
    if (playing && activeLang === index) {
      setPlaying(false);
      return;
    }

    setActiveLang(index);
    const lang = languages[index];
    const audio = new Audio(lang.audio);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audioRef.current = audio;
    audio.play();
    setPlaying(true);
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const current = languages[activeLang];

  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-accent/60 mb-4">
            Live Commentary
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-text-primary mb-4">
            Listen to matches live.
          </h2>
          <p className="text-text-dim text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
            The next best thing to watching. Real-time commentary in 4 languages —
            stream it while you work, commute, or just can&apos;t watch.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {languages.map((lang, i) => (
            <button
              key={lang.code}
              onClick={() => playCommentary(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] uppercase tracking-[0.12em] font-medium transition-all duration-300 cursor-pointer border ${
                i === activeLang
                  ? `${lang.bgAccent} ${lang.accent}`
                  : "border-border text-text-muted/60 hover:border-border-hover hover:text-text-muted"
              }`}
            >
              <span className="text-[10px] font-mono opacity-60">{lang.flag}</span>
              {lang.name}
              {playing && i === activeLang && (
                <span className="flex gap-[2px] items-end h-3 ml-1">
                  <span className="w-[2px] h-1 bg-current rounded-full animate-[pulse_0.4s_infinite]" />
                  <span className="w-[2px] h-2 bg-current rounded-full animate-[pulse_0.4s_0.1s_infinite]" />
                  <span className="w-[2px] h-1.5 bg-current rounded-full animate-[pulse_0.4s_0.2s_infinite]" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Commentary player card */}
        <div className="glass-card rounded-xl overflow-hidden max-w-[650px] mx-auto">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted/50 mb-1">
                  {current.sport}
                </p>
                <p className={`text-[11px] uppercase tracking-[0.12em] font-medium ${current.accent}`}>
                  {current.name} Commentary
                </p>
              </div>
              <button
                onClick={() => playCommentary(activeLang)}
                aria-label={playing ? "Pause commentary" : "Play commentary"}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                  playing
                    ? `${current.bgAccent} ${current.accent}`
                    : "border-border-hover text-text-muted hover:border-overlay-15"
                }`}
              >
                {playing ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                )}
              </button>
            </div>

            {/* Waveform */}
            <div className="flex justify-center mb-6">
              <AnimatedWaveform active={playing} />
            </div>

            {/* Commentary text */}
            <div className={`rounded-lg p-4 border transition-all duration-500 ${
              playing ? current.bgAccent : "bg-overlay-2 border-border"
            }`}>
              <p className="text-[13px] sm:text-sm text-overlay-text font-light leading-relaxed italic">
                &ldquo;{current.commentary}&rdquo;
              </p>
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-4">
                {languages.map((lang, i) => (
                  <button
                    key={lang.code}
                    onClick={() => playCommentary(i)}
                    aria-label={`Play ${lang.name} commentary`}
                    className={`w-6 h-6 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                      i === activeLang ? `${current.accent.replace("text-", "bg-")} scale-110` : "bg-transparent hover:bg-overlay-5"
                    }`}
                  >
                    <span className={`block w-2 h-2 rounded-full ${
                      i === activeLang ? "bg-white/80" : "bg-overlay-15"
                    }`} />
                  </button>
                ))}
              </div>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted/40">
                {playing ? "Now playing" : "Tap to listen"}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom features row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-[650px] mx-auto">
          {[
            { label: "Languages", value: "4", sub: "EN · HI · ES · DE" },
            { label: "Sports", value: "6+", sub: "More coming soon" },
            { label: "Latency", value: "<2s", sub: "Near real-time" },
            { label: "Quality", value: "HD", sub: "Crystal clear" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg bg-overlay-2 border border-border">
              <p className="text-lg font-semibold text-accent/80 font-mono">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted/60 mt-0.5">{stat.label}</p>
              <p className="text-[9px] text-text-muted/30 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Sports coverage */}
        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted/40 mb-3">Available for</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Cricket", live: true },
              { name: "Football", live: true },
              { name: "F1", live: true },
              { name: "NFL", live: true },
              { name: "Basketball", live: true },
              { name: "Tennis", live: false },
              { name: "Baseball", live: false },
              { name: "MMA", live: false },
              { name: "Hockey", live: false },
            ].map((s) => (
              <span
                key={s.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.1em] border ${
                  s.live
                    ? "border-border-hover text-text-muted/70"
                    : "border-border text-text-muted/30"
                }`}
              >
                <span className={`w-1 h-1 rounded-full ${s.live ? "bg-accent/60" : "bg-overlay-15"}`} />
                {s.name}
                {!s.live && <span className="text-[8px] text-text-muted/25 ml-0.5">soon</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
