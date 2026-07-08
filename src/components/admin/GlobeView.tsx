"use client";

import { useEffect, useState, useRef } from "react";
import Globe from "react-globe.gl";

export default function GlobeView() {
  const globeRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Slight delay to ensure WebGL context is ready before accessing controls
    setTimeout(() => {
      if (globeRef.current && globeRef.current.controls) {
        globeRef.current.controls().autoRotate = true;
        globeRef.current.controls().autoRotateSpeed = 1.2;
        globeRef.current.pointOfView({ altitude: 2.2 }, 1000);
      }
    }, 100);
  }, []);

  const gData = [
    { lat: 20.5937, lng: 78.9629, size: 0.1, color: "#00b87a", name: "India" },
    { lat: 51.5072, lng: -0.1276, size: 0.08, color: "#00b87a", name: "UK" },
    { lat: -33.8688, lng: 151.2093, size: 0.08, color: "#00b87a", name: "Australia" },
    { lat: 25.2048, lng: 55.2708, size: 0.06, color: "#00b87a", name: "UAE" },
    { lat: 37.7749, lng: -122.4194, size: 0.05, color: "#00b87a", name: "US West" },
    { lat: 40.7128, lng: -74.0060, size: 0.06, color: "#00b87a", name: "US East" },
    { lat: -23.5505, lng: -46.6333, size: 0.06, color: "#00b87a", name: "Brazil" },
    { lat: 6.5244, lng: 3.3792, size: 0.05, color: "#00b87a", name: "Nigeria" },
    { lat: 35.6762, lng: 139.6503, size: 0.07, color: "#00b87a", name: "Japan" }
  ];

  if (!mounted) {
    return (
      <div className="w-[400px] h-[400px] flex items-center justify-center text-neutral-600 font-mono text-sm animate-pulse">
        INITIALIZING GEOSPATIAL ENGINE...
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center cursor-move" style={{ height: 400 }}>
      <Globe
        ref={globeRef}
        width={400}
        height={400}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        labelsData={gData}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => d.name}
        labelSize={1.5}
        labelDotRadius={0.8}
        labelColor={() => "#00b87a"}
        labelResolution={2}
      />
    </div>
  );
}
