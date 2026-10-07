// Countries where storing even an anonymous ID on a device needs prior
// consent (EU/EEA ePrivacy rules, UK PECR, Switzerland).
const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO", "GB", "CH",
]);

/** Unknown country → treat as requiring consent (fail safe). */
export function consentRequired(country: string | null | undefined): boolean {
  return !country || CONSENT_COUNTRIES.has(country.toUpperCase());
}
