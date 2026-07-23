"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";

// Version + files — bump on each release
const VERSION = "0.1.0";
const WINDOWS_URL = `/downloads/ScoreDeck-Setup-${VERSION}.exe`;
const WINDOWS_SIZE = "95 MB";
// Android APK is built via EAS. Once uploaded to public/downloads/
// (or migrated to GitHub Releases), flip ANDROID_READY to true.
const ANDROID_READY = false;
const ANDROID_URL = `/downloads/ScoreDeck-${VERSION}.apk`;

function Section({
  eyebrow,
  title,
  desc,
  cta,
  ctaHref,
  disabled,
  note,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  ctaHref?: string;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-8 md:p-10 flex flex-col gap-4">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </span>
      <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
      <p className="text-sm text-text-dim leading-relaxed flex-1">{desc}</p>
      {disabled ? (
        <span className="inline-block w-fit px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md border border-border text-text-muted">
          {cta}
        </span>
      ) : (
        <a
          href={ctaHref}
          className="inline-block w-fit px-6 py-3 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md bg-accent text-bg hover:bg-accent/90 transition-colors"
        >
          {cta}
        </a>
      )}
      {note && (
        <p className="text-[10px] text-text-muted uppercase tracking-[0.1em]">{note}</p>
      )}
    </div>
  );
}

export default function DownloadPage() {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 md:px-8 bg-bg text-text-primary">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-accent">
            Download
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] mt-4 mb-4">
            Get ScoreDeck
          </h1>
          <p className="text-text-dim text-base md:text-lg max-w-xl mx-auto">
            Live scores on your desktop and in your pocket. Free to install; pay only
            to remove ads on mobile.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          <button
            onClick={() => setTab("desktop")}
            className={`px-5 py-2 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md transition-colors ${
              tab === "desktop"
                ? "bg-accent text-bg"
                : "border border-border text-text-muted hover:text-text-dim"
            }`}
          >
            Desktop
          </button>
          <button
            onClick={() => setTab("mobile")}
            className={`px-5 py-2 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md transition-colors ${
              tab === "mobile"
                ? "bg-accent text-bg"
                : "border border-border text-text-muted hover:text-text-dim"
            }`}
          >
            Android
          </button>
        </div>

        {tab === "desktop" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Section
              eyebrow="Windows 10 / 11"
              title="ScoreDeck for Windows"
              desc={`Frameless always-on-top overlay. ${WINDOWS_SIZE} installer. Unsigned build — Windows SmartScreen will ask to confirm on first run.`}
              cta="Download .exe"
              ctaHref={WINDOWS_URL}
              note={`v${VERSION} · x64`}
            />
            <Section
              eyebrow="macOS"
              title="ScoreDeck for Mac"
              desc="Universal binary for Intel and Apple Silicon. Currently in build — join the mailing list to know when it drops."
              cta="Coming soon"
              disabled
            />
            <Section
              eyebrow="Linux"
              title="ScoreDeck for Linux"
              desc="AppImage and .deb, x64. Building alongside the macOS release. Coming soon."
              cta="Coming soon"
              disabled
            />
          </div>
        )}

        {tab === "mobile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section
              eyebrow="Android · Free"
              title="ScoreDeck for Android"
              desc="Free to install, requires a free ScoreDeck account. Ad-supported. Direct .apk — no Play Store. First month is ad-free as a trial."
              cta={ANDROID_READY ? "Download .apk" : "Coming soon"}
              ctaHref={ANDROID_READY ? ANDROID_URL : undefined}
              disabled={!ANDROID_READY}
              note={ANDROID_READY ? `v${VERSION} · sideload` : "In final testing"}
            />
            <div className="glass-card rounded-2xl p-8 md:p-10 flex flex-col gap-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
                Android · Ad-free
              </span>
              <h3 className="text-xl md:text-2xl font-semibold">
                $20 / year — all sports, no ads
              </h3>
              <ul className="text-sm text-text-dim leading-relaxed space-y-1 flex-1">
                <li>· 1 month free trial (starts on first sign-in)</li>
                <li>· All 4 sports live</li>
                <li>· Zero ads across the app</li>
                <li>· Billed annually via Dodo Payments in-app</li>
              </ul>
              <Link
                href="/account"
                className="inline-block w-fit px-6 py-3 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md bg-accent text-bg hover:bg-accent/90 transition-colors"
              >
                Manage subscription
              </Link>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.1em]">
                Purchase happens inside the mobile app
              </p>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-xs text-text-muted">
          <p>
            iOS is not currently supported. See the{" "}
            <Link href="/" className="text-accent hover:underline">
              home page
            </Link>{" "}
            for the roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}
