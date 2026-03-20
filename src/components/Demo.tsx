"use client";

import { useRef, useState } from "react";

export default function Demo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <section id="demo" className="py-32 px-8 max-w-[900px] mx-auto text-center">
      <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-6">
        Demo
      </p>
      <h2 className="text-3xl font-extralight tracking-[-0.02em] mb-4 text-text-primary">
        See it in action
      </h2>
      <p className="text-text-muted text-sm font-light max-w-sm mx-auto mb-16 leading-relaxed">
        Scores stay on your desktop while you work.
      </p>

      <div className="relative overflow-hidden border border-border rounded-none">
        <video
          ref={videoRef}
          preload="metadata"
          controls={playing}
          className={`w-full block ${playing ? "" : "hidden"}`}
        >
          <source src="/demo.mp4" type="video/mp4" />
        </video>

        {!playing && (
          <div
            onClick={play}
            className="aspect-video flex flex-col items-center justify-center gap-6 cursor-pointer bg-surface hover:bg-surface-2 transition-colors duration-200"
          >
            <div className="w-12 h-12 border border-accent/20 flex items-center justify-center rounded-none">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-accent/60 ml-0.5"
              >
                <polygon points="6,3 20,12 6,21" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-text-muted">
              Play demo
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
