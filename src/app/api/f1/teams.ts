// Constructor identity, shared by the F1 routes. The team colour drives the
// coloured bar down the left of every results row, so it needs to be stable and
// match what viewers see on the broadcast.
//
// Keys are matched loosely (lowercased substring), because the constructor name
// differs between upstreams: Jolpica says "RB F1 Team", ESPN says "Racing Bulls".

interface TeamMeta {
  name: string;
  color: string;
}

const TEAMS: { match: string[]; meta: TeamMeta }[] = [
  { match: ["mercedes"], meta: { name: "Mercedes", color: "#27F4D2" } },
  { match: ["ferrari"], meta: { name: "Ferrari", color: "#E8002D" } },
  { match: ["mclaren"], meta: { name: "McLaren", color: "#FF8000" } },
  { match: ["red bull"], meta: { name: "Red Bull Racing", color: "#3671C6" } },
  { match: ["rb f1", "racing bulls", "alphatauri", "visa cash"], meta: { name: "Racing Bulls", color: "#6692FF" } },
  { match: ["alpine"], meta: { name: "Alpine", color: "#00A1E8" } },
  { match: ["aston martin"], meta: { name: "Aston Martin", color: "#229971" } },
  { match: ["williams"], meta: { name: "Williams", color: "#1868DB" } },
  { match: ["haas"], meta: { name: "Haas", color: "#B6BABD" } },
  { match: ["audi", "sauber", "kick"], meta: { name: "Audi", color: "#FF4500" } },
  { match: ["cadillac"], meta: { name: "Cadillac", color: "#C4922F" } },
];

const FALLBACK: TeamMeta = { name: "", color: "#8a9099" };

export function teamMeta(constructor: string): TeamMeta {
  if (!constructor) return FALLBACK;
  const c = constructor.toLowerCase();
  const hit = TEAMS.find((t) => t.match.some((m) => c.includes(m)));
  return hit ? hit.meta : { name: constructor, color: FALLBACK.color };
}

export function teamColor(constructor: string): string {
  return teamMeta(constructor).color;
}

// ISO country code -> ESPN's flag CDN. Jolpica reports nationality as a
// demonym ("Italian"), which no flag service accepts, so map it here.
const NATIONALITY_ISO: Record<string, string> = {
  british: "gbr", english: "gbr", scottish: "gbr",
  dutch: "ned", italian: "ita", monegasque: "mon", monacan: "mon",
  spanish: "esp", mexican: "mex", australian: "aus", french: "fra",
  german: "ger", finnish: "fin", danish: "den", japanese: "jpn",
  canadian: "can", thai: "tha", chinese: "chn", american: "usa",
  brazilian: "bra", argentine: "arg", argentinian: "arg",
  "new zealander": "nzl", austrian: "aut", belgian: "bel",
  swiss: "sui", swedish: "swe", polish: "pol", russian: "rus",
  irish: "irl", portuguese: "por", colombian: "col", indian: "ind",
};

export function flagFor(nationality: string): string {
  const iso = NATIONALITY_ISO[(nationality ?? "").toLowerCase()];
  return iso ? `https://a.espncdn.com/i/teamlogos/countries/500/${iso}.png` : "";
}

// Circuits report a country name, not a demonym, so they need their own map.
const COUNTRY_ISO: Record<string, string> = {
  hungary: "hun", italy: "ita", monaco: "mon", spain: "esp", uk: "gbr",
  "united kingdom": "gbr", england: "gbr", netherlands: "ned", belgium: "bel",
  austria: "aut", france: "fra", germany: "ger", azerbaijan: "aze",
  singapore: "sgp", japan: "jpn", qatar: "qat", usa: "usa",
  "united states": "usa", mexico: "mex", brazil: "bra", "saudi arabia": "ksa",
  bahrain: "brn", australia: "aus", china: "chn", canada: "can",
  uae: "uae", "united arab emirates": "uae", portugal: "por", turkey: "tur",
  russia: "rus", "south korea": "kor", india: "ind", malaysia: "mas",
};

export function countryFlag(country: string): string {
  const iso = COUNTRY_ISO[(country ?? "").toLowerCase()];
  return iso ? `https://a.espncdn.com/i/teamlogos/countries/500/${iso}.png` : "";
}
