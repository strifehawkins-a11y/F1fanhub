import { db } from "./db";
import { races, quizQuestions, articles, userProfile, driverStandings, constructorStandings, localCredentials, polls, forumPosts } from "@shared/schema";
import { sql, eq, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import { authStorage } from "./replit_integrations/auth/storage";

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
    ]);
    console.log("Races seeded.");
  }

  // Seed 2026 races
  const existing2026Races = await db.select().from(races).where(sql`season = 2026`).limit(1);
  if (existing2026Races.length === 0) {
    await db.insert(races).values([
      { season: 2026, round: 1, name: "Australian Grand Prix", circuit: "Albert Park Circuit", location: "Melbourne", country: "Australia", raceDate: "2026-03-08", qualifyingDate: "2026-03-07", hasSprint: false, status: "completed", flagEmoji: "🇦🇺" },
      { season: 2026, round: 2, name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", location: "Shanghai", country: "China", raceDate: "2026-03-15", qualifyingDate: "2026-03-14", hasSprint: true, status: "live", flagEmoji: "🇨🇳" },
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
      { question: "How many Grand Prix races are in the 2026 F1 season?", options: ["22", "23", "24", "25"], correctAnswer: 2, points: 100, difficulty: "easy", category: "general" },
      { question: "Which circuit hosts the 2026 Formula 1 season opener?", options: ["Bahrain International Circuit", "Albert Park Circuit, Melbourne", "Jeddah Corniche Circuit", "Shanghai International Circuit"], correctAnswer: 1, points: 150, difficulty: "medium", category: "circuits" },
      { question: "Lewis Hamilton joined which team for the 2025 F1 season?", options: ["McLaren", "Aston Martin", "Red Bull Racing", "Ferrari"], correctAnswer: 3, points: 100, difficulty: "easy", category: "drivers" },
      { question: "What does DRS stand for in Formula 1?", options: ["Drag Reduction System", "Dynamic Racing Strategy", "Driver Response Signal", "Downforce Reduction System"], correctAnswer: 0, points: 100, difficulty: "easy", category: "general" },
      { question: "How many points does the race winner receive in a standard Grand Prix?", options: ["20", "25", "30", "15"], correctAnswer: 1, points: 100, difficulty: "easy", category: "general" },
      { question: "Which circuit is nicknamed 'The Temple of Speed'?", options: ["Spa-Francorchamps", "Silverstone", "Autodromo Nazionale Monza", "Suzuka"], correctAnswer: 2, points: 150, difficulty: "medium", category: "circuits" },
      { question: "How many points does the driver with the fastest lap receive?", options: ["2 points", "1 point", "3 points", "5 points"], correctAnswer: 1, points: 150, difficulty: "medium", category: "general" },
      { question: "Which constructor is associated with the 'Prancing Horse' logo?", options: ["Lamborghini", "Ferrari", "Alfa Romeo", "Maserati"], correctAnswer: 1, points: 100, difficulty: "easy", category: "constructors" },
      { question: "What does VSC stand for in Formula 1?", options: ["Vehicle Speed Control", "Variable Safety Car", "Virtual Safety Car", "Velocity Speed Cap"], correctAnswer: 2, points: 150, difficulty: "medium", category: "general" },
      { question: "How many World Championship titles has Lewis Hamilton won?", options: ["5", "6", "7", "8"], correctAnswer: 2, points: 150, difficulty: "medium", category: "drivers" },
      { question: "The Monaco Grand Prix is held on which circuit?", options: ["Circuit de Monaco", "Monte Carlo Ring", "Côte d'Azur Circuit", "Principality Park"], correctAnswer: 0, points: 100, difficulty: "easy", category: "circuits" },
      { question: "What flag color signals the end of a Formula 1 race?", options: ["White flag", "Blue flag", "Red flag", "Checkered flag"], correctAnswer: 3, points: 100, difficulty: "easy", category: "general" },
      { question: "In which city is the Singapore Grand Prix held?", options: ["Kuala Lumpur", "Bangkok", "Singapore", "Jakarta"], correctAnswer: 2, points: 100, difficulty: "easy", category: "circuits" },
    ]);
    console.log("Quiz questions seeded.");
  }

  // Seed articles
  const existingArticles = await db.select().from(articles).limit(1);
  if (existingArticles.length === 0) {
    const adminId = "seed-admin";
    await db.insert(articles).values([
      {
        title: "2026 Season Preview: The New Era Begins",
        excerpt: "As the lights go out in Melbourne for the first time under the new 2026 regulations, the battle for the World Championship is completely open. With revolutionary power units and radical aerodynamic changes, every team starts from zero.",
        content: `The 2026 Formula 1 season represents the most significant regulatory overhaul the sport has seen in decades. New power unit regulations bring a massive increase in electrical power, with hybrid systems now generating over 400kW — more than double the current output. Combined with sweeping aerodynamic changes designed to reduce drag and improve wheel-to-wheel racing, the competitive order is completely unpredictable.\n\nMax Verstappen enters the season as the defending champion, but with Red Bull forced to develop an entirely new power unit in partnership with Ford, the Austrian outfit faces their most challenging pre-season in years. The RB22 was notoriously difficult to drive in testing, sparking rare concerns in Milton Keynes.\n\nMcLaren, meanwhile, arrive in Melbourne brimming with confidence. Lando Norris and Oscar Piastri form the strongest driver pairing on the grid, and the Woking outfit have been among the most impressive in testing. If their power unit proves reliable, a maiden Constructors' Championship is genuinely within reach.\n\nAt Ferrari, Lewis Hamilton's second season in red promises fireworks. The 40-year-old has spoken openly about his determination to claim an eighth title before retiring — and with Charles Leclerc alongside him, the Scuderia's driver lineup has never been stronger.\n\nWith 24 races spanning five continents, and every team genuinely capable of winning, 2026 may be the most spectacular season in the sport's history.`,
        authorId: adminId,
        tags: ["2026 Season", "Preview", "New Regulations"],
        imageUrl: null,
      },
      {
        title: "Australian GP: Norris Breaks the Duck in Melbourne",
        excerpt: "Lando Norris converted pole position into a dominant victory at Albert Park, setting the tone for McLaren's 2026 campaign. Verstappen recovered from a slow start to finish second, while Hamilton's Ferrari claimed the final podium spot.",
        content: `Melbourne delivered a stunning season opener as Lando Norris led every lap from pole to flag to claim the first victory of the 2026 Formula 1 season.\n\nThe British driver was peerless throughout, managing his tyres with expert precision while controlling the gap to Max Verstappen's Red Bull behind him. Despite early pressure from the defending champion, Norris never looked troubled, pulling away during the mid-race stint to build a buffer that proved decisive.\n\n"This car is something special," said Norris on the podium, visibly emotional. "The whole team has worked so hard over the winter. This win is for all of them."\n\nVerstappen salvaged second after a difficult weekend that included a spin in FP2 and a brush with the wall in qualifying. The Red Bull driver was philosophical about the deficit: "McLaren were just faster today. We need to understand why and fix it before Shanghai."\n\nLewis Hamilton completed the podium in third, marking a perfect start to his second season at Ferrari. The seven-time champion showed his class in the closing stages, managing fresher tyres brilliantly to hold off the charging Charles Leclerc, who crossed the line fourth.\n\nThe result sets up a tantalising championship battle, with McLaren immediately establishing themselves as the team to beat.`,
        authorId: adminId,
        tags: ["Australian GP", "Race Report", "Norris", "2026 Season"],
        imageUrl: null,
      },
      {
        title: "Chinese GP Preview: Can Red Bull Strike Back in Shanghai?",
        excerpt: "Red Bull arrive at the Shanghai International Circuit with upgrades for the RB22, determined to close the gap to McLaren after their Melbourne defeat. The Sprint race format adds an extra layer of intrigue to this pivotal weekend.",
        content: `The Formula 1 circus touches down in Shanghai for Round 2 of the 2026 season, with Red Bull desperate to respond to McLaren's dominant Melbourne performance.\n\nThe Austrian team have flown in a significant aerodynamic upgrade package for the RB22, targeting the front-end instability that hampered Verstappen throughout the Australian weekend. Chief Technical Officer Pierre Waché has been cautiously optimistic: "We understand the issues now. Shanghai should tell us much more."\n\nThe Shanghai International Circuit suits the characteristics of power-unit-sensitive cars, which could play into Mercedes' hands — the Silver Arrows were surprisingly competitive in the opening race, with George Russell finishing a strong fifth.\n\nThe Sprint race on Saturday adds an additional tactical dimension, with teams forced to balance risk against the potential championship points on offer. With the Drivers' Championship already showing McLaren's advantage after just one race, the pressure on their rivals to respond immediately is intense.\n\nFerri will be looking to replicate Melbourne's performance, but Leclerc has spoken about needing to find more pace from the SF-26 in the fast, flowing corners where McLaren appear particularly strong.\n\nAll eyes will also be on the freshly-introduced Bea Voss, making her second F1 appearance in a Red Bull Academy car. The young German has been impressive in every category she's raced, and a points finish in Shanghai would make headlines worldwide.`,
        authorId: adminId,
        tags: ["Chinese GP", "Preview", "2026 Season", "Verstappen"],
        imageUrl: null,
      },
      {
        title: "Hamilton at 40: Still Hungry, Still the Best",
        excerpt: "A year into his Ferrari adventure, Lewis Hamilton shows no signs of slowing down. We speak exclusively with the seven-time champion about motivation, legacy, and why 2026 might be his year.",
        content: `There is a moment, early in our conversation, when Lewis Hamilton's eyes light up in a way that suggests the fire still burns as brightly as ever. We are discussing the new 2026 regulations — the blank canvas that has given every driver on the grid a fresh chance — and the seven-time World Champion leans forward in his chair.\n\n"This is why I stayed," he says, quietly but with absolute conviction. "I knew these rules were coming. I knew Ferrari had been preparing for this moment for years. And I knew I wanted to be part of it."\n\nAt 40, Hamilton is the oldest driver on the 2026 grid by a significant margin. The question of when he will retire has followed him since his move to Ferrari in 2025, yet he dismisses it with characteristic precision. "Age is just a number. What matters is whether you can still do the job better than anyone else. I believe I can."\n\nHis first season with the Scuderia was, by his own admission, a learning process. The SF-25 was not the machine he had hoped for, and adapting to a new team environment after twelve years at Mercedes took time. But the early signs in 2026 are encouraging — a podium in Melbourne, and a race pace that genuinely troubles Norris and Verstappen alike.\n\nWhen asked what an eighth title would mean, Hamilton pauses for the first time in our conversation. "It would mean everything," he says, finally. "Not for me. For everyone who told me I couldn't still do it."`,
        authorId: adminId,
        tags: ["Hamilton", "Ferrari", "2026 Season", "Interview"],
        imageUrl: null,
      },
      {
        title: "The New Power Units Explained: What Changes in 2026",
        excerpt: "The 2026 F1 power unit regulations are the most radical in the sport's history. We break down exactly what has changed, why it matters, and which teams stand to benefit most.",
        content: `Formula 1's 2026 power unit regulations represent a wholesale reimagining of how F1 cars are powered. The changes are so fundamental that every engine manufacturer — Red Bull Ford Powertrains, Ferrari, Mercedes, Renault, and newcomers Honda returning to the sport — effectively started development from scratch.\n\nThe headline change is the dramatic increase in electrical power. Under the previous regulations, the MGU-K (Motor Generator Unit-Kinetic) was limited to 120kW. In 2026, this cap is removed, with electrical deployment now capable of generating over 400kW — meaning electrical power accounts for roughly 50% of total power output for the first time.\n\nThe MGU-H (Motor Generator Unit-Heat), controversial for its complexity and expense, has been eliminated entirely. In its place, a larger battery and a more powerful MGU-K do the work of energy recovery, making the systems theoretically simpler and more reliable.\n\nOn the fuel side, F1 has moved to fully sustainable fuels — a blend of e-fuels and biofuels that produces the same carbon output as conventional petrol but with a dramatically smaller net carbon footprint.\n\nFor the teams, the biggest challenge has been integration. The massive increase in electrical power requires new cooling systems, new battery management software, and fundamental changes to car packaging. McLaren and Mercedes appear to have solved these challenges most elegantly in testing, while Red Bull and Ferrari have acknowledged ongoing development work.\n\nThe racing impact should be significant: more deployable electrical power means more opportunities to overtake, as drivers can time their electrical boost to create passing opportunities that previously required mechanical grip alone.`,
        authorId: adminId,
        tags: ["Technical", "Power Units", "2026 Regulations", "Analysis"],
        imageUrl: null,
      },
    ]).onConflictDoNothing();
    console.log("Articles seeded.");
  }

  // Seed 2026 driver standings
  const existingDriverStandings = await db.select().from(driverStandings).where(sql`season = 2026`).limit(1);
  if (existingDriverStandings.length === 0) {
    await db.insert(driverStandings).values([
      { position: 1, driverName: "Lando Norris", driverCode: "NOR", nationality: "British", flagEmoji: "🇬🇧", teamName: "McLaren", teamColor: "#FF8000", points: 25, wins: 1, podiums: 1, season: 2026 },
      { position: 2, driverName: "Max Verstappen", driverCode: "VER", nationality: "Dutch", flagEmoji: "🇳🇱", teamName: "Red Bull Racing", teamColor: "#3671C6", points: 18, wins: 0, podiums: 1, season: 2026 },
      { position: 3, driverName: "Lewis Hamilton", driverCode: "HAM", nationality: "British", flagEmoji: "🇬🇧", teamName: "Ferrari", teamColor: "#DC0000", points: 15, wins: 0, podiums: 1, season: 2026 },
      { position: 4, driverName: "Charles Leclerc", driverCode: "LEC", nationality: "Monégasque", flagEmoji: "🇲🇨", teamName: "Ferrari", teamColor: "#DC0000", points: 12, wins: 0, podiums: 0, season: 2026 },
      { position: 5, driverName: "George Russell", driverCode: "RUS", nationality: "British", flagEmoji: "🇬🇧", teamName: "Mercedes", teamColor: "#27F4D2", points: 10, wins: 0, podiums: 0, season: 2026 },
      { position: 6, driverName: "Oscar Piastri", driverCode: "PIA", nationality: "Australian", flagEmoji: "🇦🇺", teamName: "McLaren", teamColor: "#FF8000", points: 8, wins: 0, podiums: 0, season: 2026 },
      { position: 7, driverName: "Fernando Alonso", driverCode: "ALO", nationality: "Spanish", flagEmoji: "🇪🇸", teamName: "Aston Martin", teamColor: "#358C75", points: 6, wins: 0, podiums: 0, season: 2026 },
      { position: 8, driverName: "Kimi Antonelli", driverCode: "ANT", nationality: "Italian", flagEmoji: "🇮🇹", teamName: "Mercedes", teamColor: "#27F4D2", points: 4, wins: 0, podiums: 0, season: 2026 },
      { position: 9, driverName: "Lance Stroll", driverCode: "STR", nationality: "Canadian", flagEmoji: "🇨🇦", teamName: "Aston Martin", teamColor: "#358C75", points: 2, wins: 0, podiums: 0, season: 2026 },
      { position: 10, driverName: "Pierre Gasly", driverCode: "GAS", nationality: "French", flagEmoji: "🇫🇷", teamName: "Alpine", teamColor: "#0093CC", points: 1, wins: 0, podiums: 0, season: 2026 },
      { position: 11, driverName: "Carlos Sainz", driverCode: "SAI", nationality: "Spanish", flagEmoji: "🇪🇸", teamName: "Williams", teamColor: "#64C4FF", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 12, driverName: "Yuki Tsunoda", driverCode: "TSU", nationality: "Japanese", flagEmoji: "🇯🇵", teamName: "RB", teamColor: "#6692FF", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 13, driverName: "Alex Albon", driverCode: "ALB", nationality: "Thai", flagEmoji: "🇹🇭", teamName: "Williams", teamColor: "#64C4FF", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 14, driverName: "Isack Hadjar", driverCode: "HAD", nationality: "French", flagEmoji: "🇫🇷", teamName: "RB", teamColor: "#6692FF", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 15, driverName: "Oliver Bearman", driverCode: "BEA", nationality: "British", flagEmoji: "🇬🇧", teamName: "Haas", teamColor: "#B6BABD", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 16, driverName: "Esteban Ocon", driverCode: "OCO", nationality: "French", flagEmoji: "🇫🇷", teamName: "Haas", teamColor: "#B6BABD", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 17, driverName: "Nico Hulkenberg", driverCode: "HUL", nationality: "German", flagEmoji: "🇩🇪", teamName: "Kick Sauber", teamColor: "#52E252", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 18, driverName: "Gabriel Bortoleto", driverCode: "BOR", nationality: "Brazilian", flagEmoji: "🇧🇷", teamName: "Kick Sauber", teamColor: "#52E252", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 19, driverName: "Jack Doohan", driverCode: "DOO", nationality: "Australian", flagEmoji: "🇦🇺", teamName: "Alpine", teamColor: "#0093CC", points: 0, wins: 0, podiums: 0, season: 2026 },
      { position: 20, driverName: "Bea Voss", driverCode: "VOB", nationality: "German", flagEmoji: "🇩🇪", teamName: "Red Bull Academy", teamColor: "#3671C6", points: 0, wins: 0, podiums: 0, season: 2026 },
    ]);
    console.log("2026 driver standings seeded.");
  }

  // Seed 2026 constructor standings
  const existingConstructorStandings = await db.select().from(constructorStandings).where(sql`season = 2026`).limit(1);
  if (existingConstructorStandings.length === 0) {
    await db.insert(constructorStandings).values([
      { position: 1, teamName: "McLaren", teamColor: "#FF8000", points: 33, wins: 1, season: 2026 },
      { position: 2, teamName: "Ferrari", teamColor: "#DC0000", points: 27, wins: 0, season: 2026 },
      { position: 3, teamName: "Red Bull Racing", teamColor: "#3671C6", points: 18, wins: 0, season: 2026 },
      { position: 4, teamName: "Mercedes", teamColor: "#27F4D2", points: 14, wins: 0, season: 2026 },
      { position: 5, teamName: "Aston Martin", teamColor: "#358C75", points: 8, wins: 0, season: 2026 },
      { position: 6, teamName: "Alpine", teamColor: "#0093CC", points: 1, wins: 0, season: 2026 },
      { position: 7, teamName: "Williams", teamColor: "#64C4FF", points: 0, wins: 0, season: 2026 },
      { position: 8, teamName: "RB", teamColor: "#6692FF", points: 0, wins: 0, season: 2026 },
      { position: 9, teamName: "Haas", teamColor: "#B6BABD", points: 0, wins: 0, season: 2026 },
      { position: 10, teamName: "Kick Sauber", teamColor: "#52E252", points: 0, wins: 0, season: 2026 },
    ]);
    console.log("2026 constructor standings seeded.");
  }

  // Seed admin account — always ensure credentials + admin flag exist
  const adminEmail = "strifehawkins@gmail.com";
  const adminPassword = "Lansanah1!";
  const adminUserId = "local_5ea2369b-25f8-4e1d-bac8-3692e6bd5c56";

  const [existingAdmin] = await db.select().from(localCredentials).where(eq(localCredentials.email, adminEmail));
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.insert(localCredentials).values({
      userId: adminUserId,
      email: adminEmail,
      passwordHash,
      displayName: "Lansanah",
    });
    await authStorage.upsertUser({
      id: adminUserId,
      email: adminEmail,
      firstName: "Lansanah",
      lastName: "",
      profileImageUrl: "",
    });
    console.log("Admin credentials seeded.");
  }

  // Always guarantee is_admin = true for the admin user
  await db.insert(userProfile).values({
    userId: adminUserId,
    totalPoints: 0,
    lifetimePoints: 0,
    isAdmin: true,
  }).onConflictDoUpdate({ target: userProfile.userId, set: { isAdmin: true } });

  // Seed polls
  const existingPolls = await db.select().from(polls).limit(1);
  if (existingPolls.length === 0) {
    await db.insert(polls).values([
      {
        question: "Who will win the 2026 F1 World Championship?",
        options: ["Lando Norris", "Max Verstappen", "Lewis Hamilton", "Charles Leclerc", "George Russell", "Oscar Piastri"],
        isActive: true,
        closesAt: null,
        authorId: adminUserId,
      },
      {
        question: "Which team will win the 2026 Constructors' Championship?",
        options: ["McLaren", "Red Bull Racing", "Ferrari", "Mercedes", "Aston Martin"],
        isActive: true,
        closesAt: null,
        authorId: adminUserId,
      },
      {
        question: "Who will score the most poles in 2026?",
        options: ["Max Verstappen", "Lando Norris", "Charles Leclerc", "Lewis Hamilton", "George Russell"],
        isActive: true,
        closesAt: null,
        authorId: adminUserId,
      },
      {
        question: "Which circuit produces the best racing in 2026?",
        options: ["Monaco", "Silverstone", "Suzuka", "Spa-Francorchamps", "Monza", "Interlagos"],
        isActive: true,
        closesAt: null,
        authorId: adminUserId,
      },
    ]);
    console.log("Polls seeded.");
  }

  // Seed general forum topics
  const existingGeneralPosts = await db.select().from(forumPosts).where(isNull(forumPosts.raceId)).limit(1);
  if (existingGeneralPosts.length === 0) {
    const seedUserId = "seed-admin";
    await db.insert(forumPosts).values([
      {
        raceId: null,
        userId: seedUserId,
        title: "General Honda F1 Topic",
        content: "Welcome to the general Honda F1 discussion thread! Use this ongoing thread to discuss anything related to Honda's involvement in Formula 1 — past, present, and future. From their Red Bull partnership to the new 2026 power unit regulations and beyond.",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "F1 Fantasy League 2026",
        content: "This is the place to share your Fantasy F1 teams for the 2026 season! Post your picks, discuss strategies, swap tips, and track your points as the season unfolds. Who has the boldest team selection? Who will be the champion of our fantasy league?",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "2026 Drama: Alleged engine loophole",
        content: "There's been a lot of talk about an alleged loophole in the 2026 engine regulations that some teams may be exploiting. The FIA is reportedly investigating. What do you think — is it a genuine technical innovation or a grey area that should be closed? Let's discuss the details here.",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "2026 Regulations - Critique thread",
        content: "The 2026 regulations represent the biggest overhaul in years — new power units, new aero, new weight limits. But are they the right changes? This thread is for constructive critique of the 2026 rules. What do you think the FIA got right, and what could have been done better?",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "Possible solutions to improve the 2026 Engine Regulations",
        content: "Following on from the critique thread — if you could rewrite parts of the 2026 engine regulations, what would you change? This thread is for constructive ideas and technical discussion. The floor is yours: how could the power unit rules be improved to produce better racing?",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "All kinds of news about F1",
        content: "A catch-all thread for general F1 news that doesn't fit neatly into another topic. Rumours, transfers, team updates, driver contract news, technical stories — post it all here! Links to articles and breaking news welcome.",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "Random 2026 Predictions",
        content: "End of season predictions, one-off bet predictions, wild cards — this is the thread for all your 2026 F1 crystal ball moments. Who will win the championship? Which surprise team will punch above their weight? Which driver will have a breakout season? Post your predictions here and we'll revisit them at Abu Dhabi!",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "Is Aston Martin BAR all over again?",
        content: "Aston Martin have invested heavily in infrastructure — a stunning new factory, top engineering talent, and massive funding from Lawrence Stroll. But early 2026 results have been underwhelming. Are we witnessing the slow build of a future champion, or is this another case of big promises and disappointing results? Discuss.",
      },
      {
        raceId: null,
        userId: seedUserId,
        title: "2026 Technical Developments — what's caught your eye?",
        content: "A dedicated thread for spotting and discussing technical innovations on the 2026 cars. Floor designs, sidepod concepts, front wing variations, diffuser details — share your observations and analyses here. Photos and links welcome. Let's nerd out on the engineering!",
      },
    ]);
    console.log("General forum topics seeded.");
  }

  console.log("Database seeding complete.");
}
