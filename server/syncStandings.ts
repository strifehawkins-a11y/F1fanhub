import { storage } from "./storage";
import { log } from "./index";

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";

const NATIONALITY_FLAGS: Record<string, string> = {
  "British": "🇬🇧",
  "Dutch": "🇳🇱",
  "Monegasque": "🇲🇨",
  "Spanish": "🇪🇸",
  "Australian": "🇦🇺",
  "Mexican": "🇲🇽",
  "Canadian": "🇨🇦",
  "Finnish": "🇫🇮",
  "Chinese": "🇨🇳",
  "German": "🇩🇪",
  "French": "🇫🇷",
  "Italian": "🇮🇹",
  "Thai": "🇹🇭",
  "American": "🇺🇸",
  "Brazilian": "🇧🇷",
  "Japanese": "🇯🇵",
  "Argentinian": "🇦🇷",
  "New Zealander": "🇳🇿",
  "Austrian": "🇦🇹",
  "Danish": "🇩🇰",
  "Swedish": "🇸🇪",
  "Belgian": "🇧🇪",
  "Russian": "🇷🇺",
  "Polish": "🇵🇱",
  "Swiss": "🇨🇭",
  "Hungarian": "🇭🇺",
  "Colombian": "🇨🇴",
  "South African": "🇿🇦",
  "Bahraini": "🇧🇭",
  "Zimbabwean": "🇿🇼",
  "Venezuelan": "🇻🇪",
  "Indian": "🇮🇳",
};

const TEAM_COLORS: Record<string, string> = {
  "Mercedes": "#27F4D2",
  "Ferrari": "#DC0000",
  "Red Bull": "#3671C6",
  "Red Bull Racing": "#3671C6",
  "McLaren": "#FF8000",
  "Aston Martin": "#358C75",
  "Alpine": "#0093CC",
  "Alpine F1 Team": "#0093CC",
  "Williams": "#64C4FF",
  "RB": "#6692FF",
  "Visa Cash App RB": "#6692FF",
  "Haas": "#B6BABD",
  "Haas F1 Team": "#B6BABD",
  "Kick Sauber": "#52E252",
  "Sauber": "#52E252",
};

function resolveTeamColor(name: string): string {
  if (TEAM_COLORS[name]) return TEAM_COLORS[name];
  const key = Object.keys(TEAM_COLORS).find(k => name.toLowerCase().includes(k.toLowerCase()));
  return key ? TEAM_COLORS[key] : "#888888";
}

function resolveFlag(nationality: string): string {
  return NATIONALITY_FLAGS[nationality] || "🏁";
}

function buildDriverCode(givenName: string, familyName: string, apiCode?: string): string {
  if (apiCode && apiCode.length === 3) return apiCode.toUpperCase();
  return familyName.substring(0, 3).toUpperCase();
}

export async function syncStandingsFromAPI(season = "current"): Promise<{ drivers: number; constructors: number }> {
  const [driversRes, constructorsRes] = await Promise.all([
    fetch(`${JOLPICA_BASE}/${season}/driverstandings/?format=json`),
    fetch(`${JOLPICA_BASE}/${season}/constructorstandings/?format=json`),
  ]);

  if (!driversRes.ok || !constructorsRes.ok) {
    throw new Error(`Jolpica API error: drivers=${driversRes.status} constructors=${constructorsRes.status}`);
  }

  const [driversData, constructorsData] = await Promise.all([
    driversRes.json(),
    constructorsRes.json(),
  ]);

  const driversList = driversData?.MRData?.StandingsTable?.StandingsLists?.[0];
  const constructorsList = constructorsData?.MRData?.StandingsTable?.StandingsLists?.[0];

  if (!driversList || !constructorsList) {
    throw new Error("No standings data returned from API");
  }

  const apiSeason = parseInt(driversList.season || new Date().getFullYear().toString());

  const driverRows = (driversList.DriverStandings || []).map((s: any) => ({
    position: parseInt(s.position),
    driverName: `${s.Driver.givenName} ${s.Driver.familyName}`,
    driverCode: buildDriverCode(s.Driver.givenName, s.Driver.familyName, s.Driver.code),
    nationality: s.Driver.nationality || "Unknown",
    flagEmoji: resolveFlag(s.Driver.nationality),
    teamName: s.Constructors?.[0]?.name || "Unknown",
    teamColor: resolveTeamColor(s.Constructors?.[0]?.name || ""),
    points: parseInt(s.points) || 0,
    wins: parseInt(s.wins) || 0,
    podiums: 0,
    season: apiSeason,
  }));

  const constructorRows = (constructorsList.ConstructorStandings || []).map((s: any) => ({
    position: parseInt(s.position),
    teamName: s.Constructor.name,
    teamColor: resolveTeamColor(s.Constructor.name),
    points: parseInt(s.points) || 0,
    wins: parseInt(s.wins) || 0,
    season: apiSeason,
  }));

  await storage.replaceDriverStandings(apiSeason, driverRows);
  await storage.replaceConstructorStandings(apiSeason, constructorRows);

  log(`Standings synced: ${driverRows.length} drivers, ${constructorRows.length} constructors (${apiSeason} S${driversList.round})`, "sync");

  return { drivers: driverRows.length, constructors: constructorRows.length };
}
