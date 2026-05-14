"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function DownloadPage() {
  const t = useTranslations("Hero");
  const downloadUrl = "/downloads/scoredeck-windows.zip";

  useEffect(() => {
    // Auto-trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "scoredeck-windows.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-text-primary">
      <div className="glass-card p-12 rounded-2xl max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent animate-bounce">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold mb-4 tracking-tight">Downloading Scoredeck...</h1>
        <p className="text-text-dim mb-8 text-sm md:text-base font-light leading-relaxed">
          Your download for Windows should start automatically. <br className="hidden md:block" />
          If it doesn&apos;t, click the button below to start it manually.
        </p>
        <a
          href={downloadUrl}
          download="scoredeck-windows.zip"
          className="inline-block px-8 py-4 bg-accent text-bg text-[11px] font-medium uppercase tracking-[0.12em] rounded-md hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/10"
        >
          Download Manually
        </a>
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
