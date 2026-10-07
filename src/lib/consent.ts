// Decides whether the website may collect anonymous usage stats for this
// visitor. Outside consent countries: yes (unless Do Not Track). Inside:
// only if the visitor accepted "store information on a device" (TCF purpose
// 1) and "measure content performance" (purpose 8) in Google's consent
// popup, which AdSense loads. No popup available → no tracking.

type TcData = {
  eventStatus?: string;
  purpose?: { consents?: Record<number, boolean> };
};
type TcfApi = (cmd: string, version: number, cb: (data: TcData, ok: boolean) => void) => void;

let decision: Promise<boolean> | null = null;

function tcfConsent(timeoutMs = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    const started = Date.now();
    let settled = false;
    const finish = (v: boolean) => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    const poll = () => {
      const api = (window as unknown as { __tcfapi?: TcfApi }).__tcfapi;
      if (typeof api === "function") {
        api("addEventListener", 2, (tc, ok) => {
          if (!ok) return finish(false);
          if (tc.eventStatus === "tcloaded" || tc.eventStatus === "useractioncomplete") {
            finish(!!tc.purpose?.consents?.[1] && !!tc.purpose?.consents?.[8]);
          }
        });
      } else if (Date.now() - started < timeoutMs) {
        setTimeout(poll, 500);
      } else {
        finish(false);
      }
    };
    poll();
  });
}

export function analyticsAllowed(): Promise<boolean> {
  if (!decision) {
    decision = (async () => {
      if (navigator.doNotTrack === "1") return false;
      try {
        const r = await fetch("/api/region").then((res) => res.json());
        if (!r.consentRequired) return true;
      } catch {
        // Region unknown: fall through to requiring consent.
      }
      return tcfConsent();
    })();
  }
  return decision;
}
