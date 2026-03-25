import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "de", "hi", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});
