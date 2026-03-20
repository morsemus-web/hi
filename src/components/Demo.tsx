"use client";

import { useRef, useState } from "react";

export default function Demo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.currentTime = 0;
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

      <div className="relative overflow-hidden border border-border rounded-xl group cursor-pointer" onClick={toggle}>
        <video
          ref={videoRef}
          preload="metadata"
          controls={playing}
          onEnded={() => setPlaying(false)}
          className="w-full block"
          src="/demo.mp4#t=59"
        />

        {!playing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center group-hover:bg-accent/30 group-hover:scale-110 transition-all duration-300">
              <svg
                width="22"
                height="22"
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
    </section>
  );
}
