import Script from "next/script";

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* Monetag In-Page Push */}
      <Script
        id="monetag-inpage"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10763197',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />

      {/* Monetag Push Notifications */}
      <Script
        src="https://5gvci.com/act/files/tag.min.js?z=10763198"
        strategy="afterInteractive"
        data-cfasync="false"
      />
    </>
  );
}
