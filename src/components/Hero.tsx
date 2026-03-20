"use client";

import { useEffect, useRef, useState } from "react";
import CheckoutButton from "./CheckoutButton";

function VideoPlayer({
  videoRef,
  playing,
  onPlay,
  className = "",
}: {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  playing: boolean;
  onPlay: () => void;
  className?: string;
}) {
  return (
    <div className={`glass-card rounded-xl overflow-hidden group relative ${className}`}>
      <video
        ref={videoRef}
        preload="metadata"
        controls={playing}
        onEnded={() => {}}
        className="w-full block"
        src="/demo.mp4#t=59"
      />

      {!playing && (
        <div
          onClick={onPlay}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-[2px] cursor-pointer transition-opacity duration-300"
        >
          <div className="w-14 h-14 rounded-full border border-accent/40 flex items-center justify-center bg-accent/20 group-hover:bg-accent/30 group-hover:scale-110 transition-all duration-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-accent ml-1"
            >
              <polygon points="6,3 20,12 6,21" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[10px] font-light uppercase tracking-[0.25em] text-white/70">
            Watch demo
          </span>
        </div>
      )}
    </div>
  );
}

export default function Hero() {
  const [backers, setBackers] = useState({ count: 4, remaining: 996 });
  const [waitlistCount, setWaitlistCount] = useState(200);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch("/api/backers")
      .then((r) => r.json())
      .then(setBackers)
      .catch(() => {});
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setWaitlistCount(d.count))
      .catch(() => {});
  }, []);

  function playDesktop() {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setPlaying(true);
    }
  }

  function playMobile() {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.currentTime = 0;
      mobileVideoRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <section id="hero" className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 pt-20 pb-16 gap-12 lg:gap-16 max-w-[1200px] mx-auto">
      {/* Left: Copy */}
      <div className="flex-1 max-w-xl animate-fade-in-up">
        <div className="inline-flex items-center gap-2 text-[10px] font-light uppercase tracking-[0.2em] text-text-muted mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-[pulse-dot_2s_infinite]" />
          Launching in 30-45 days
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.1] mb-6">
          Stop opening apps
          <br />
          <span className="text-accent">for scores.</span>
        </h1>

        <p className="text-text-dim text-base md:text-lg font-light max-w-md mb-8 leading-relaxed">
          ScoreDeck is a desktop overlay that gives you live sports updates and key moments — without interrupting your work.
        </p>

        {/* Mobile-only video: between description and CTAs */}
        <div className="lg:hidden mb-8">
          <VideoPlayer
            videoRef={mobileVideoRef}
            playing={playing}
            onPlay={playMobile}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() =>
              document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.12em] text-bg bg-accent hover:bg-accent/90 transition-colors duration-200 cursor-pointer rounded-md"
          >
            Join Free Waitlist
          </button>
          <CheckoutButton className="px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.12em] text-text-primary border border-border hover:border-accent/30 hover:text-accent transition-all duration-200 cursor-pointer rounded-md">
            Get Early Access — $29
          </CheckoutButton>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2 text-[10px] font-light uppercase tracking-[0.15em] text-text-muted">
          <span className="col-span-3 flex items-center gap-2 sm:col-span-1">
            <span className="w-1 h-1 rounded-full bg-sport-f1/60" />
            Limited to 1,000 founding users
          </span>
          <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
            <span className="text-accent/60 font-mono text-sm sm:text-[10px]">{backers.count}</span>
            <span>backed</span>
          </span>
          <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
            <span className="text-accent/60 font-mono text-sm sm:text-[10px]">{waitlistCount}+</span>
            <span>waitlisted</span>
          </span>
          <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
            <span className="text-accent/60 font-mono text-sm sm:text-[10px]">{backers.remaining}</span>
            <span>spots left</span>
          </span>
        </div>
      </div>

      {/* Desktop-only: Video in right column */}
      <div className="hidden lg:block flex-1 w-full max-w-[560px] animate-fade-in-up delay-200">
        <VideoPlayer
          videoRef={videoRef}
          playing={playing}
          onPlay={playDesktop}
        />
      </div>
    </section>
  );
}
