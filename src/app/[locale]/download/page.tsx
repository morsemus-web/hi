"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";

// Version + release URLs.
// Desktop and Android ship on their own cadence — Android moved to 0.2.0 for
// the notification/favourites build, which needed new native modules, while
// desktop is still on 0.1.0. Keep the two versions separate so bumping one
// doesn't silently point the other at a file that was never published.
const DESKTOP_VERSION = "0.1.0";
const ANDROID_VERSION = "0.2.0";

// Desktop installers live as assets on the corresponding GitHub Release —
// permanent, versioned, no 200 MB installer in the repo. Bump DESKTOP_VERSION
// and re-tag on the desktop repo; these URLs update automatically.
const GH_RELEASE = `https://github.com/morsemus-web/scoredeck-desktop/releases/download/v${DESKTOP_VERSION}`;

// Windows: kept in this repo too as a fallback since /downloads/ works today.
const WINDOWS_READY = true;
const WINDOWS_URL   = `/downloads/ScoreDeck-Setup-${DESKTOP_VERSION}.exe`;
const WINDOWS_SIZE  = "95 MB";

// Mac + Linux come from the CI matrix (built on native runners).
const MAC_READY     = true;
const MAC_URL       = `${GH_RELEASE}/ScoreDeck-${DESKTOP_VERSION}-universal.dmg`;

const LINUX_APPIMAGE_READY = true;
const LINUX_APPIMAGE_URL   = `${GH_RELEASE}/ScoreDeck-${DESKTOP_VERSION}-x86_64.AppImage`;
const LINUX_DEB_READY      = true;
const LINUX_DEB_URL        = `${GH_RELEASE}/ScoreDeck-${DESKTOP_VERSION}-amd64.deb`;

// Android APK: built via EAS, hosted from this repo at public/downloads/.
const ANDROID_READY = true;
const ANDROID_URL   = `/downloads/ScoreDeck-${ANDROID_VERSION}.apk`;

function Section({
  eyebrow,
  title,
  desc,
  cta,
  ctaHref,
  disabled,
  note,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  ctaHref?: string;
  disabled?: boolean;
  note?: string;
  secondaryCta?: { label: string; href: string };
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
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={ctaHref}
            download={ctaHref ? ctaHref.split("/").pop() : undefined}
            className="inline-block w-fit px-6 py-3 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md bg-accent text-bg hover:bg-accent/90 transition-colors"
          >
            {cta}
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              download={secondaryCta.href.split("/").pop()}
              className="inline-block w-fit px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md border border-border text-text-dim hover:border-accent/40 hover:text-accent transition-colors"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>
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
              cta={WINDOWS_READY ? "Download .exe" : "Coming soon"}
              ctaHref={WINDOWS_READY ? WINDOWS_URL : undefined}
              disabled={!WINDOWS_READY}
              note={`v${DESKTOP_VERSION} · x64`}
            />
            <Section
              eyebrow="macOS"
              title="ScoreDeck for Mac"
              desc="Universal binary for Intel and Apple Silicon. Unsigned build — control-click the app on first launch and choose Open to bypass Gatekeeper."
              cta={MAC_READY ? "Download .dmg" : "Coming soon"}
              ctaHref={MAC_READY ? MAC_URL : undefined}
              disabled={!MAC_READY}
              note={MAC_READY ? `v${DESKTOP_VERSION} · Intel + Apple Silicon` : "In final testing"}
            />
            <Section
              eyebrow="Linux"
              title="ScoreDeck for Linux"
              desc="AppImage runs anywhere; .deb for Ubuntu/Debian. x64 only. No signing required."
              cta={
                LINUX_APPIMAGE_READY
                  ? "Download AppImage"
                  : LINUX_DEB_READY
                  ? "Download .deb"
                  : "Coming soon"
              }
              ctaHref={
                LINUX_APPIMAGE_READY
                  ? LINUX_APPIMAGE_URL
                  : LINUX_DEB_READY
                  ? LINUX_DEB_URL
                  : undefined
              }
              secondaryCta={
                LINUX_APPIMAGE_READY && LINUX_DEB_READY
                  ? { label: "Download .deb", href: LINUX_DEB_URL }
                  : undefined
              }
              disabled={!LINUX_APPIMAGE_READY && !LINUX_DEB_READY}
              note={
                LINUX_APPIMAGE_READY || LINUX_DEB_READY
                  ? `v${DESKTOP_VERSION} · x64`
                  : "In final testing"
              }
            />
          </div>
        )}

        {tab === "mobile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section
              eyebrow="Android · Free"
              title="ScoreDeck for Android"
              desc="Free to install, requires a free ScoreDeck account. Ad-supported. Direct .apk — no Play Store. First month is ad-free as a trial. Live score alerts for the teams you follow."
              cta={ANDROID_READY ? "Download .apk" : "Coming soon"}
              ctaHref={ANDROID_READY ? ANDROID_URL : undefined}
              disabled={!ANDROID_READY}
              note={ANDROID_READY ? `v${ANDROID_VERSION} · sideload` : "In final testing"}
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
