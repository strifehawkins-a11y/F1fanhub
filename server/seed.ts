import { db } from "./db";
import { races, quizQuestions, articles, userProfile } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Seed races
  const existingRaces = await db.select().from(races).limit(1);
  if (existingRaces.length === 0) {
    await db.insert(races).values([
      { round: 1, name: "Australian Grand Prix", circuit: "Albert Park Circuit", location: "Melbourne", country: "Australia", raceDate: "2025-03-16", qualifyingDate: "2025-03-15", hasSprint: false, status: "completed", flagEmoji: "🇦🇺" },
      { round: 2, name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", location: "Shanghai", country: "China", raceDate: "2025-03-23", qualifyingDate: "2025-03-22", hasSprint: true, status: "completed", flagEmoji: "🇨🇳" },
      { round: 3, name: "Japanese Grand Prix", circuit: "Suzuka Circuit", location: "Suzuka", country: "Japan", raceDate: "2025-04-06", qualifyingDate: "2025-04-05", hasSprint: false, status: "completed", flagEmoji: "🇯🇵" },
      { round: 4, name: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", location: "Sakhir", country: "Bahrain", raceDate: "2025-04-13", qualifyingDate: "2025-04-12", hasSprint: false, status: "upcoming", flagEmoji: "🇧🇭" },
      { round: 5, name: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", location: "Jeddah", country: "Saudi Arabia", raceDate: "2025-04-20", qualifyingDate: "2025-04-19", hasSprint: false, status: "upcoming", flagEmoji: "🇸🇦" },
      { round: 6, name: "Miami Grand Prix", circuit: "Miami International Autodrome", location: "Miami", country: "USA", raceDate: "2025-05-04", qualifyingDate: "2025-05-03", hasSprint: true, status: "upcoming", flagEmoji: "🇺🇸" },
      { round: 7, name: "Emilia Romagna Grand Prix", circuit: "Autodromo Enzo e Dino Ferrari", location: "Imola", country: "Italy", raceDate: "2025-05-18", qualifyingDate: "2025-05-17", hasSprint: false, status: "upcoming", flagEmoji: "🇮🇹" },
      { round: 8, name: "Monaco Grand Prix", circuit: "Circuit de Monaco", location: "Monte Carlo", country: "Monaco", raceDate: "2025-05-25", qualifyingDate: "2025-05-24", hasSprint: false, status: "upcoming", flagEmoji: "🇲🇨" },
      { round: 9, name: "Spanish Grand Prix", circuit: "Circuit de Barcelona-Catalunya", location: "Barcelona", country: "Spain", raceDate: "2025-06-15", qualifyingDate: "2025-06-14", hasSprint: false, status: "upcoming", flagEmoji: "🇪🇸" },
      { round: 10, name: "Canadian Grand Prix", circuit: "Circuit Gilles Villeneuve", location: "Montreal", country: "Canada", raceDate: "2025-06-29", qualifyingDate: "2025-06-28", hasSprint: false, status: "upcoming", flagEmoji: "🇨🇦" },
      { round: 11, name: "Austrian Grand Prix", circuit: "Red Bull Ring", location: "Spielberg", country: "Austria", raceDate: "2025-07-06", qualifyingDate: "2025-07-05", hasSprint: false, status: "upcoming", flagEmoji: "🇦🇹" },
      { round: 12, name: "British Grand Prix", circuit: "Silverstone Circuit", location: "Silverstone", country: "United Kingdom", raceDate: "2025-07-27", qualifyingDate: "2025-07-26", hasSprint: false, status: "upcoming", flagEmoji: "🇬🇧" },
      { round: 13, name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", location: "Spa", country: "Belgium", raceDate: "2025-08-03", qualifyingDate: "2025-08-02", hasSprint: true, status: "upcoming", flagEmoji: "🇧🇪" },
      { round: 14, name: "Dutch Grand Prix", circuit: "Circuit Zandvoort", location: "Zandvoort", country: "Netherlands", raceDate: "2025-08-31", qualifyingDate: "2025-08-30", hasSprint: false, status: "upcoming", flagEmoji: "🇳🇱" },
      { round: 15, name: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", location: "Monza", country: "Italy", raceDate: "2025-09-07", qualifyingDate: "2025-09-06", hasSprint: false, status: "upcoming", flagEmoji: "🇮🇹" },
      { round: 16, name: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", location: "Baku", country: "Azerbaijan", raceDate: "2025-09-21", qualifyingDate: "2025-09-20", hasSprint: false, status: "upcoming", flagEmoji: "🇦🇿" },
      { round: 17, name: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", location: "Singapore", country: "Singapore", raceDate: "2025-10-05", qualifyingDate: "2025-10-04", hasSprint: false, status: "upcoming", flagEmoji: "🇸🇬" },
      { round: 18, name: "United States Grand Prix", circuit: "Circuit of the Americas", location: "Austin, Texas", country: "USA", raceDate: "2025-10-19", qualifyingDate: "2025-10-18", hasSprint: true, status: "upcoming", flagEmoji: "🇺🇸" },
      { round: 19, name: "Mexico City Grand Prix", circuit: "Autodromo Hermanos Rodriguez", location: "Mexico City", country: "Mexico", raceDate: "2025-10-26", qualifyingDate: "2025-10-25", hasSprint: false, status: "upcoming", flagEmoji: "🇲🇽" },
      { round: 20, name: "São Paulo Grand Prix", circuit: "Autodromo Jose Carlos Pace", location: "Interlagos", country: "Brazil", raceDate: "2025-11-09", qualifyingDate: "2025-11-08", hasSprint: true, status: "upcoming", flagEmoji: "🇧🇷" },
      { round: 21, name: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", location: "Las Vegas", country: "USA", raceDate: "2025-11-22", qualifyingDate: "2025-11-21", hasSprint: false, status: "upcoming", flagEmoji: "🇺🇸" },
      { round: 22, name: "Qatar Grand Prix", circuit: "Lusail International Circuit", location: "Lusail", country: "Qatar", raceDate: "2025-11-30", qualifyingDate: "2025-11-29", hasSprint: true, status: "upcoming", flagEmoji: "🇶🇦" },
      { round: 23, name: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", location: "Yas Marina", country: "UAE", raceDate: "2025-12-07", qualifyingDate: "2025-12-06", hasSprint: false, status: "upcoming", flagEmoji: "🇦🇪" },
    ]);
    console.log("Races seeded.");
  }

  // Seed 2026 races
  const existing2026Races = await db.select().from(races).where(sql`season = 2026`).limit(1);
  if (existing2026Races.length === 0) {
    await db.insert(races).values([
      { season: 2026, round: 1, name: "Australian Grand Prix", circuit: "Albert Park Circuit", location: "Melbourne", country: "Australia", raceDate: "2026-03-08", qualifyingDate: "2026-03-07", hasSprint: false, status: "upcoming", flagEmoji: "🇦🇺" },
      { season: 2026, round: 2, name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", location: "Shanghai", country: "China", raceDate: "2026-03-15", qualifyingDate: "2026-03-14", hasSprint: true, status: "upcoming", flagEmoji: "🇨🇳" },
      { season: 2026, round: 3, name: "Japanese Grand Prix", circuit: "Suzuka Circuit", location: "Suzuka", country: "Japan", raceDate: "2026-03-29", qualifyingDate: "2026-03-28", hasSprint: false, status: "upcoming", flagEmoji: "🇯🇵" },
      { season: 2026, round: 4, name: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", location: "Sakhir", country: "Bahrain", raceDate: "2026-04-12", qualifyingDate: "2026-04-11", hasSprint: false, status: "upcoming", flagEmoji: "🇧🇭" },
      { season: 2026, round: 5, name: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", location: "Jeddah", country: "Saudi Arabia", raceDate: "2026-04-19", qualifyingDate: "2026-04-18", hasSprint: false, status: "upcoming", flagEmoji: "🇸🇦" },
      { season: 2026, round: 6, name: "Miami Grand Prix", circuit: "Miami International Autodrome", location: "Miami", country: "USA", raceDate: "2026-05-03", qualifyingDate: "2026-05-02", hasSprint: true, status: "upcoming", flagEmoji: "🇺🇸" },
      { season: 2026, round: 7, name: "Canadian Grand Prix", circuit: "Circuit Gilles Villeneuve", location: "Montreal", country: "Canada", raceDate: "2026-05-24", qualifyingDate: "2026-05-23", hasSprint: true, status: "upcoming", flagEmoji: "🇨🇦" },
      { season: 2026, round: 8, name: "Monaco Grand Prix", circuit: "Circuit de Monaco", location: "Monte Carlo", country: "Monaco", raceDate: "2026-06-07", qualifyingDate: "2026-06-06", hasSprint: false, status: "upcoming", flagEmoji: "🇲🇨" },
      { season: 2026, round: 9, name: "Spanish Grand Prix", circuit: "Circuit de Barcelona-Catalunya", location: "Barcelona", country: "Spain", raceDate: "2026-06-14", qualifyingDate: "2026-06-13", hasSprint: false, status: "upcoming", flagEmoji: "🇪🇸" },
      { season: 2026, round: 10, name: "Austrian Grand Prix", circuit: "Red Bull Ring", location: "Spielberg", country: "Austria", raceDate: "2026-06-28", qualifyingDate: "2026-06-27", hasSprint: false, status: "upcoming", flagEmoji: "🇦🇹" },
      { season: 2026, round: 11, name: "British Grand Prix", circuit: "Silverstone Circuit", location: "Silverstone", country: "United Kingdom", raceDate: "2026-07-05", qualifyingDate: "2026-07-04", hasSprint: true, status: "upcoming", flagEmoji: "🇬🇧" },
      { season: 2026, round: 12, name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", location: "Spa", country: "Belgium", raceDate: "2026-07-19", qualifyingDate: "2026-07-18", hasSprint: false, status: "upcoming", flagEmoji: "🇧🇪" },
      { season: 2026, round: 13, name: "Hungarian Grand Prix", circuit: "Hungaroring", location: "Budapest", country: "Hungary", raceDate: "2026-07-26", qualifyingDate: "2026-07-25", hasSprint: false, status: "upcoming", flagEmoji: "🇭🇺" },
      { season: 2026, round: 14, name: "Dutch Grand Prix", circuit: "Circuit Zandvoort", location: "Zandvoort", country: "Netherlands", raceDate: "2026-08-23", qualifyingDate: "2026-08-22", hasSprint: true, status: "upcoming", flagEmoji: "🇳🇱" },
      { season: 2026, round: 15, name: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", location: "Monza", country: "Italy", raceDate: "2026-09-06", qualifyingDate: "2026-09-05", hasSprint: false, status: "upcoming", flagEmoji: "🇮🇹" },
      { season: 2026, round: 16, name: "Madrid Grand Prix", circuit: "Circuito del Jarama Madrid", location: "Madrid", country: "Spain", raceDate: "2026-09-13", qualifyingDate: "2026-09-12", hasSprint: false, status: "upcoming", flagEmoji: "🇪🇸" },
      { season: 2026, round: 17, name: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", location: "Baku", country: "Azerbaijan", raceDate: "2026-09-26", qualifyingDate: "2026-09-25", hasSprint: false, status: "upcoming", flagEmoji: "🇦🇿" },
      { season: 2026, round: 18, name: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", location: "Singapore", country: "Singapore", raceDate: "2026-10-11", qualifyingDate: "2026-10-10", hasSprint: true, status: "upcoming", flagEmoji: "🇸🇬" },
      { season: 2026, round: 19, name: "United States Grand Prix", circuit: "Circuit of the Americas", location: "Austin, Texas", country: "USA", raceDate: "2026-10-25", qualifyingDate: "2026-10-24", hasSprint: false, status: "upcoming", flagEmoji: "🇺🇸" },
      { season: 2026, round: 20, name: "Mexico City Grand Prix", circuit: "Autodromo Hermanos Rodriguez", location: "Mexico City", country: "Mexico", raceDate: "2026-11-01", qualifyingDate: "2026-10-31", hasSprint: false, status: "upcoming", flagEmoji: "🇲🇽" },
      { season: 2026, round: 21, name: "São Paulo Grand Prix", circuit: "Autodromo Jose Carlos Pace", location: "Interlagos", country: "Brazil", raceDate: "2026-11-08", qualifyingDate: "2026-11-07", hasSprint: false, status: "upcoming", flagEmoji: "🇧🇷" },
      { season: 2026, round: 22, name: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", location: "Las Vegas", country: "USA", raceDate: "2026-11-21", qualifyingDate: "2026-11-20", hasSprint: false, status: "upcoming", flagEmoji: "🇺🇸" },
      { season: 2026, round: 23, name: "Qatar Grand Prix", circuit: "Lusail International Circuit", location: "Lusail", country: "Qatar", raceDate: "2026-11-29", qualifyingDate: "2026-11-28", hasSprint: false, status: "upcoming", flagEmoji: "🇶🇦" },
      { season: 2026, round: 24, name: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", location: "Yas Marina", country: "UAE", raceDate: "2026-12-06", qualifyingDate: "2026-12-05", hasSprint: false, status: "upcoming", flagEmoji: "🇦🇪" },
    ]);
    console.log("2026 races seeded.");
  }

  // Seed quiz questions
  const existingQuestions = await db.select().from(quizQuestions).limit(1);
  if (existingQuestions.length === 0) {
    await db.insert(quizQuestions).values([
      { question: "Who won the 2024 Formula 1 World Drivers' Championship?", options: ["Max Verstappen", "Lando Norris", "Charles Leclerc", "Lewis Hamilton"], correctAnswer: 0, points: 100, difficulty: "easy", category: "drivers" },
      { question: "Which constructor won the 2024 Formula 1 World Constructors' Championship?", options: ["McLaren", "Ferrari", "Red Bull Racing", "Mercedes"], correctAnswer: 2, points: 100, difficulty: "easy", category: "constructors" },
      { question: "How many Grand Prix races are in the 2025 F1 season?", options: ["22", "23", "24", "25"], correctAnswer: 2, points: 100, difficulty: "easy", category: "general" },
      { question: "Which circuit hosts the 2025 Formula 1 season opener?", options: ["Bahrain International Circuit", "Albert Park Circuit, Melbourne", "Jeddah Corniche Circuit", "Shanghai International Circuit"], correctAnswer: 1, points: 150, difficulty: "medium", category: "circuits" },
      { question: "Lewis Hamilton joined which team for the 2025 F1 season?", options: ["McLaren", "Aston Martin", "Red Bull Racing", "Ferrari"], correctAnswer: 3, points: 100, difficulty: "easy", category: "drivers" },
      { question: "What does DRS stand for in Formula 1?", options: ["Drag Reduction System", "Dynamic Racing Strategy", "Driver Response Signal", "Downforce Reduction System"], correctAnswer: 0, points: 100, difficulty: "easy", category: "general" },
      { question: "How many points does the race winner receive in a standard Grand Prix?", options: ["20", "25", "30", "15"], correctAnswer: 1, points: 100, difficulty: "easy", category: "general" },
      { question: "Which circuit is nicknamed 'The Temple of Speed'?", options: ["Spa-Francorchamps", "Silverstone", "Autodromo Nazionale Monza", "Suzuka"], correctAnswer: 2, points: 150, difficulty: "medium", category: "circuits" },
      { question: "How many points does the driver with the fastest lap receive?", options: ["2 points", "1 point", "3 points", "5 points"], correctAnswer: 1, points: 150, difficulty: "medium", category: "general" },
      { question: "Which constructor is associated with the 'Prancing Horse' logo?", options: ["Lamborghini", "Ferrari", "Alfa Romeo", "Maserati"], correctAnswer: 1, points: 100, difficulty: "easy", category: "constructors" },
      { question: "What does VSC stand for in Formula 1?", options: ["Vehicle Speed Control", "Variable Safety Car", "Virtual Safety Car", "Velocity Speed Cap"], correctAnswer: 2, points: 150, difficulty: "medium", category: "general" },
      { question: "How many World Championship titles has Lewis Hamilton won?", options: ["5", "6", "7", "8"], correctAnswer: 2, points: 150, difficulty: "medium", category: "drivers" },
      { question: "The Monaco Grand Prix is held on which circuit?", options: ["Circuit de Monaco", "Monte Carlo Ring", "Côte d'Azur Circuit", "Principality Park"], correctAnswer: 0, points: 100, difficulty: "easy", category: "circuits" },
      { question: "Which Grand Prix features a Sprint race in the 2025 season?", options: ["Monaco Grand Prix", "British Grand Prix", "Miami Grand Prix", "Austrian Grand Prix"], correctAnswer: 2, points: 200, difficulty: "hard", category: "general" },
      { question: "What flag color signals the end of a Formula 1 race?", options: ["White flag", "Blue flag", "Red flag", "Checkered flag"], correctAnswer: 3, points: 100, difficulty: "easy", category: "general" },
      { question: "In which city is the Singapore Grand Prix held?", options: ["Kuala Lumpur", "Bangkok", "Singapore", "Jakarta"], correctAnswer: 2, points: 100, difficulty: "easy", category: "circuits" },
      { question: "How many constructors competed in the 2024 F1 season?", options: ["8", "9", "10", "11"], correctAnswer: 2, points: 200, difficulty: "hard", category: "constructors" },
      { question: "Which 2025 Grand Prix takes place under lights in the desert?", options: ["Abu Dhabi Grand Prix", "Bahrain Grand Prix", "Saudi Arabian Grand Prix", "Both Bahrain and Abu Dhabi"], correctAnswer: 3, points: 200, difficulty: "hard", category: "circuits" },
      { question: "What color is the flag waved to warn of a slow car on track?", options: ["Red", "Yellow", "Blue", "Green"], correctAnswer: 1, points: 150, difficulty: "medium", category: "general" },
      { question: "The Brazilian Grand Prix is held at which circuit?", options: ["Autodromo Jose Carlos Pace", "Autodromo do Ayrton Senna", "Circuit Hermanos Rodriguez", "Autodromo Oscar Alfredo Galvez"], correctAnswer: 0, points: 150, difficulty: "medium", category: "circuits" },
    ]);
    console.log("Quiz questions seeded.");
  }

  // Seed articles
  const existingArticles = await db.select().from(articles).limit(1);
  if (existingArticles.length === 0) {
    const adminId = "seed-admin";
    await db.insert(articles).values([
      {
        title: "2025 Season Preview: Who Will Take the Crown?",
        excerpt: "As the lights go out in Melbourne, the battle for the 2025 World Championship begins. With Lewis Hamilton at Ferrari and Lando Norris hungry for glory, the grid has never looked more competitive.",
        content: `The 2025 Formula 1 season is shaping up to be one of the most exciting in recent memory. With Lewis Hamilton making the seismic move to Ferrari and Lando Norris now a genuine championship contender at McLaren, the established order of Red Bull dominance faces its most serious challenge yet.\n\nMax Verstappen enters the season as four-time World Champion, but the Red Bull RB21 faces stiffer competition than ever before. McLaren's MCL39 showed incredible pace in the closing stages of 2024, and with Norris fully focused on the championship, expect him to push Verstappen all the way.\n\nAt Ferrari, the arrival of Hamilton alongside Charles Leclerc creates the most formidable driver pairing in the paddock. The Prancing Horse has invested massively in their power unit and aerodynamic package, giving both drivers a genuine chance at victory.\n\nMercedes, meanwhile, will be hoping George Russell can carry the Silver Arrows back to the front, while Aston Martin's investment in facilities and personnel makes Fernando Alonso dangerous on his day.\n\nWith 24 races spanning five continents, 2025 promises drama, controversy, and moments of pure racing brilliance. The season begins at Albert Park in Melbourne — and we cannot wait.`,
        authorId: adminId,
        tags: ["2025 Season", "Preview", "Hamilton", "Verstappen"],
        imageUrl: null,
      },
      {
        title: "The Hamilton Effect: How Ferrari Changed Overnight",
        excerpt: "Lewis Hamilton's arrival at Ferrari has transformed the Maranello outfit — from team culture to car development. We look at what has changed since the announcement.",
        content: `When Lewis Hamilton announced in February 2024 that he would leave Mercedes — a team he had been with for twelve years and with which he had won six of his seven World Championships — the racing world was stunned. When the destination was revealed as Ferrari, the shock became disbelief.\n\nNow, a year on, the evidence of what Hamilton brings to Ferrari goes far beyond his talent behind the wheel. His technical feedback, developed over a decade at the cutting edge of F1 development, has given Ferrari's engineers new perspectives. His professionalism has elevated the standards expected of every member of the team.\n\nCharles Leclerc, to his enormous credit, has welcomed the challenge. Rather than feeling threatened, the Monégasque driver has raised his game — and the rivalry between the two is already being called one of the greatest partnerships in Ferrari history.\n\nThe first three races of 2025 have shown a Ferrari more consistent than we have seen for years. If they can maintain this form through the European summer, the Scuderia may well end their long wait for a Constructors' Championship.`,
        authorId: adminId,
        tags: ["Hamilton", "Ferrari", "2025 Season"],
        imageUrl: null,
      },
      {
        title: "Australian GP Race Report: Drama at Albert Park",
        excerpt: "The 2025 season opened with a classic Melbourne showdown. Safety cars, strategy battles, and a late-race twist made for an unforgettable opener.",
        content: `Melbourne delivered everything a season opener should — sunshine, drama, wheel-to-wheel battles, and a result nobody predicted.\n\nFrom pole position, Max Verstappen led into Turn 1 with characteristic authority. But McLaren's Lando Norris, starting from third, executed an audacious overtake at Turn 3 on lap 4, signalling immediately that 2025 would be different.\n\nA safety car period on lap 22 — brought out by a collision in the midfield — triggered a flurry of pit stops that reshuffled the order. Ferrari split their strategy, leaving Hamilton out on old tyres while Leclerc pitted for fresh mediums. The gamble nearly paid off: Hamilton's tyre advantage in the closing laps saw him close rapidly on the leader.\n\nNorris ultimately held on to claim his second career victory, crossing the line 1.4 seconds ahead of a furious Verstappen. Hamilton completed the podium after passing Leclerc in the penultimate lap.\n\n"This team is ready," said Norris on the podium. "We're coming for everything." The message to Red Bull was clear.`,
        authorId: adminId,
        tags: ["Australian GP", "Race Report", "Norris", "2025 Season"],
        imageUrl: null,
      },
    ]).onConflictDoNothing();
    console.log("Articles seeded.");
  }

  console.log("Database seeding complete.");
}
