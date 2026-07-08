"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export default function GlobeView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;
    
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 800, // Explicit size
      height: 800,
      phi: 0,
      theta: 0.1,
      dark: 1, // dark mode on
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      // PURE WHITE landmasses so they are 100% visible
      baseColor: [1, 1, 1], 
      markerColor: [0, 0.72, 0.48], // Scoredeck Green
      glowColor: [0.1, 0.1, 0.1],
      markers: [
        { location: [20.5937, 78.9629], size: 0.12 }, // India
        { location: [51.5072, -0.1276], size: 0.08 }, // UK
        { location: [-33.8688, 151.2093], size: 0.08 }, // Australia
        { location: [25.2048, 55.2708], size: 0.07 }, // UAE
        { location: [37.7749, -122.4194], size: 0.05 }, // California
        { location: [40.7128, -74.0060], size: 0.06 }, // NY
        { location: [-23.5505, -46.6333], size: 0.06 }, // Brazil
        { location: [6.5244, 3.3792], size: 0.05 }, // Nigeria
      ],
      // @ts-ignore
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.003;
      },
    } as any);

    return () => globe.destroy();
  }, []);

  return (
    <div className="w-full flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10 pointer-events-none" />
      <canvas 
        ref={canvasRef} 
        style={{ width: 400, height: 400, maxWidth: "100%", aspectRatio: "1/1" }} 
      />
    </div>
  );
}
