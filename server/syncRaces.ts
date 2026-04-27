import { storage } from "./storage";
import { log } from "./index";

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";

const COUNTRY_FLAGS: Record<string, string> = {
  "Bahrain": "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  "Australia": "🇦🇺",
  "Japan": "🇯🇵",
  "China": "🇨🇳",
  "USA": "🇺🇸",
  "United States": "🇺🇸",
  "Italy": "🇮🇹",
  "Monaco": "🇲🇨",
  "Canada": "🇨🇦",
  "Spain": "🇪🇸",
  "Austria": "🇦🇹",
  "UK": "🇬🇧",
  "United Kingdom": "🇬🇧",
  "Hungary": "🇭🇺",
  "Belgium": "🇧🇪",
  "Netherlands": "🇳🇱",
  "Singapore": "🇸🇬",
  "Azerbaijan": "🇦🇿",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "UAE": "🇦🇪",
  "United Arab Emirates": "🇦🇪",
  "Las Vegas": "🇺🇸",
  "Qatar": "🇶🇦",
  "France": "🇫🇷",
  "Portugal": "🇵🇹",
  "Turkey": "🇹🇷",
  "Russia": "🇷🇺",
  "Germany": "🇩🇪",
  "South Korea": "🇰🇷",
  "India": "🇮🇳",
  "Malaysia": "🇲🇾",
  "Morocco": "🇲🇦",
};

function resolveFlag(country: string): string {
  if (COUNTRY_FLAGS[country]) return COUNTRY_FLAGS[country];
  const key = Object.keys(COUNTRY_FLAGS).find(k =>
    country.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(country.toLowerCase())
  );
  return key ? COUNTRY_FLAGS[key] : "🏁";
}

function raceStatus(dateStr: string): "completed" | "upcoming" | "live" {
  const raceDate = new Date(dateStr);
  const now = new Date();
  // Add 4 hours buffer for race duration
  return raceDate.getTime() + 4 * 3600 * 1000 < now.getTime() ? "completed" : "upcoming";
}

export async function syncRacesFromAPI(season = "current"): Promise<{ races: number; season: number }> {
  const res = await fetch(`${JOLPICA_BASE}/${season}/races/?format=json`);
  if (!res.ok) throw new Error(`Jolpica races API error: ${res.status}`);

  const data = await res.json() as any;
  const raceTable = data?.MRData?.RaceTable;
  const raceList: any[] = raceTable?.Races || [];

  if (raceList.length === 0) throw new Error("No race data returned from API");

  const apiSeason = parseInt(raceTable.season || new Date().getFullYear().toString());

  // Delete existing races for this season and re-insert fresh data
  await storage.deleteRacesBySeason(apiSeason);

  const sprintRounds = new Set<number>();

  for (const race of raceList) {
    const round = parseInt(race.round);
    const hasSprint = !!race.Sprint;
    if (hasSprint) sprintRounds.add(round);

    const qualDate = race.Qualifying?.date || race.date;
    const country = race.Circuit?.Location?.country || "Unknown";
    const circuit = race.Circuit?.circuitName || "Unknown Circuit";
    const location = race.Circuit?.Location?.locality || country;

    await storage.upsertRace({
      season: apiSeason,
      round,
      name: race.raceName,
      circuit,
      location,
      country,
      raceDate: race.date,
      qualifyingDate: qualDate,
      hasSprint,
      status: raceStatus(race.date),
      flagEmoji: resolveFlag(country),
    });
  }

  log(`Race schedule synced: ${raceList.length} races for ${apiSeason} season`, "sync");
  return { races: raceList.length, season: apiSeason };
}
