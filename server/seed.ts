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

  // Seed news articles (editorial content)
  const existingNewsArticles = await db.select().from(articles).where(eq(articles.section, "news")).limit(1);
  if (existingNewsArticles.length === 0) {
    const adminId = "seed-admin";
    await db.insert(articles).values([
      {
        title: "How F1 Cars Have Changed From the 1950s to Today: A Visual History",
        slug: "how-f1-cars-have-changed-from-1950s-to-today",
        excerpt: "From front-engined roadsters to carbon-fibre missiles, Formula 1 machinery has undergone a breathtaking transformation over seven decades. We trace the most pivotal moments in F1 car design.",
        content: `The story of Formula 1 car design is one of relentless innovation driven by speed, safety, and the search for competitive advantage.\n\nIn the early 1950s, the cars that contested the inaugural World Championship bore more resemblance to pre-war grand prix machinery than to anything we would recognise today. The Alfa Romeo 158, which powered Nino Farina to the first-ever World Drivers' Championship in 1950, was a front-engined, narrow-bodied machine with exposed wheels, a long bonnet, and a cockpit that offered its driver almost no protection whatsoever.\n\nThe pivotal revolution came in 1959 when Cooper placed their engine behind the driver. The mid-engined layout transformed weight distribution, lowered the car's centre of gravity, and gave drivers far greater feel through corners. Within two seasons, every serious constructor had followed suit.\n\nThe aerodynamic era began tentatively in 1968 when Lotus and Ferrari both experimented with wings. The following decade saw an explosion of downforce-generating bodywork — high wings, sidepod tunnels, and the ground-effect Lotus 78 and 79 that created enormous suction from the road surface. Ground effect was banned in 1983, triggering a turbo era that saw power outputs approach 1,500bhp in qualifying trim.\n\nCarbon fibre monocoques arrived in 1981 with the McLaren MP4/1, fundamentally changing crash safety forever. By the time of Ayrton Senna's fatal accident at Imola in 1994, the sport was already mid-revolution in its approach to driver protection, leading to the near-elimination of fatalities through the 1990s and 2000s.\n\nThe modern hybrid era, which began in 2014, and the ground-effect return of 2022, represent the latest chapters in a story of constant reinvention — and with 2026's radical new power unit rules now in force, the next chapter is already being written.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["History", "Technical", "Car Design", "Heritage"],
        sortOrder: 50,
        imageUrl: null,
      },
      {
        title: "The Greatest F1 Drivers of All Time: Schumacher, Senna, Hamilton and Beyond",
        slug: "greatest-f1-drivers-of-all-time",
        excerpt: "Seven World Championships. Pole positions beyond counting. Lap records that lasted decades. We rank the greatest drivers ever to grace a Formula 1 grid.",
        content: `Determining the greatest Formula 1 driver of all time is the sport's most enduring argument — and perhaps its most enjoyable one.\n\nAyrton Senna occupies a unique place in the sport's mythology. The Brazilian won three World Championships (1988, 1990, 1991) and 41 races, but it is the manner of his victories — the wet-weather brilliance at Donington in 1993, the qualifying laps that seemed to defy physics, the raw emotion of his driving — that elevates him beyond mere statistics. Many who watched him race never recovered from the shock of his death at Imola in 1994.\n\nMichael Schumacher rewrote the record books entirely. Seven World Championships, five of them consecutive with Ferrari, 91 race victories, 68 pole positions — the numbers are staggering. Schumacher's physical preparation, his technical feedback, and his ability to elevate an entire team were revolutionary.\n\nLewis Hamilton has equalled and in some metrics surpassed both. His 103 race victories, 104 pole positions, and seven World Championships make a statistical case that is almost unanswerable. The debate about how much of Hamilton's success is attributable to the dominant Mercedes machinery of the hybrid era is legitimate, but it cannot diminish achievements of such sustained excellence across such a long period.\n\nBeyond this trio, the pantheon includes Juan Manuel Fangio (five championships in the 1950s with remarkable versatility across different machinery), Alain Prost (four titles and a masterclass in strategic racing), Jim Clark (two titles and a genius so obvious it silenced all argument), and Niki Lauda, whose courage in returning to race six weeks after his near-fatal Nürburgring accident in 1976 remains the sport's defining act of bravery.\n\nThe current era has produced its own candidates. Max Verstappen's three consecutive championships have been achieved with a dominance that invites comparison with Schumacher at his peak.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Drivers", "History", "GOAT", "Senna", "Hamilton", "Schumacher"],
        sortOrder: 60,
        imageUrl: null,
      },
      {
        title: "The Greatest Rivalries in F1 History: Senna vs Prost, Hamilton vs Rosberg",
        slug: "greatest-rivalries-in-f1-history",
        excerpt: "Formula 1's greatest battles have not been between drivers and circuits, but between drivers and each other. We revisit the rivalries that defined eras and changed the sport forever.",
        content: `No rivalry in Formula 1 history has been more fiercely contested, more psychologically complex, or more consequential to the sport's development than that between Ayrton Senna and Alain Prost.\n\nThe two men were teammates at McLaren in 1988 and 1989, and their confrontations went far beyond the racetrack. Prost was methodical, intelligent, and politically astute. Senna was intuitive, intensely spiritual, and willing to use the car as a weapon when he felt the title demanded it. Their collisions at Suzuka in 1989 and 1990 — both of which decided World Championships — remain the most controversial incidents in the sport's history.\n\nNiki Lauda and James Hunt provided a different kind of rivalry — a battle of personality as much as pace. The ice-cold Austrian and the charismatic Englishman contested the 1976 championship in circumstances that stretched beyond sport into genuine human drama: Lauda's near-fatal accident at the Nürburgring, his extraordinary return six weeks later, and Hunt's title-deciding drive through the rain at Fuji remain the stuff of legend.\n\nNearer to the present, the 2016 battle between Lewis Hamilton and his Mercedes teammate Nico Rosberg showed that rivalry does not require manufactured hostility — the tension between two friends competing for the ultimate prize proved quite sufficient. Rosberg's decision to retire immediately after claiming his first and only World Championship remains one of the sport's most surprising and poignant footnotes.\n\nThe Verstappen-Hamilton battle of 2021, decided in the most controversial circumstances at the final corner of the final lap of the season in Abu Dhabi, may yet prove the most consequential rivalry of the modern era — not least for the debate it provoked about racing governance that continues to this day.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["History", "Rivalries", "Senna", "Prost", "Hamilton"],
        sortOrder: 70,
        imageUrl: null,
      },
      {
        title: "The Most Dominant F1 Seasons in History: Vettel 2013, Hamilton 2020, and More",
        slug: "most-dominant-f1-seasons-in-history",
        excerpt: "Some Formula 1 seasons are defined by close battles. Others are defined by the complete absence of one. We rank the most dominant championship campaigns ever seen.",
        content: `Dominance in Formula 1 is a complicated concept. When one driver and team is so superior to the rest of the field that the championship becomes a foregone conclusion, the season risks being classified as boring — yet within that domination there are often remarkable stories of human achievement.\n\nSebastian Vettel's 2013 season with Red Bull Racing stands among the most statistically dominant in the sport's history. The German won the final nine consecutive races of the season, a streak that may never be equalled, and finished the championship with 397 points — nearly 200 more than his nearest rival. The Red Bull RB9 was in a class of its own, but Vettel's ability to extract maximum performance lap after lap was equally remarkable.\n\nLewis Hamilton's 2020 campaign, conducted under the extraordinary circumstances of the COVID-affected season, was similarly overwhelming. Eleven victories from seventeen races, a record-equalling seventh World Championship, and performances of breathtaking precision in a season that required immense mental resilience given the global context.\n\nAyrton Senna and McLaren in 1988 won fifteen of sixteen races — a winning rate of 93.75% that remains the highest ever achieved in a single season. The Honda-powered MP4/4 was so superior that the Senna-Prost internal battle was in some ways the only real competition of the year.\n\nMichael Schumacher's 2002 season saw him clinch the championship with six races still remaining — the earliest-ever title conclusion at the time. He finished every race on the podium, a feat of consistency that bordered on the supernatural.\n\nThe 2022 season showed what happens when dominance is established not at the start of a championship but mid-stream: Max Verstappen won fifteen of twenty-two races after a slow opening, illustrating that momentum and machinery alignment can transform a season's narrative.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["History", "Records", "Dominance", "Vettel", "Hamilton", "Schumacher"],
        sortOrder: 80,
        imageUrl: null,
      },
      {
        title: "The History of F1 Safety Innovations: From Seatbelts to the Halo",
        slug: "history-of-f1-safety-innovations",
        excerpt: "Formula 1 has been transformed from one of the world's most deadly sports into one of its safest. The journey involved tragedy, courage, and engineering breakthroughs that saved countless lives.",
        content: `In the inaugural Formula 1 World Championship season of 1950, safety was not a concept that featured prominently in the sport's culture. Drivers wore thin helmets, leather gloves, and little else. Barriers were absent from many circuits. Spectators stood feet from the cars. The sport claimed numerous lives throughout its early decades.\n\nThe campaign for meaningful safety reform was championed most loudly by Jackie Stewart, who survived a near-fatal accident at Spa in 1966 — he was trapped in his car, leaking fuel, for 45 minutes before being extracted — and subsequently became the sport's most persistent advocate for change. Stewart pushed for Armco barriers, improved medical facilities, and the elimination of the most dangerous circuit features.\n\nThe introduction of the carbon fibre monocoque by McLaren in 1981 was perhaps the single most important safety development in the sport's history. Carbon fibre absorbs and dissipates crash energy in a fundamentally different way to the aluminium construction it replaced, creating a survival cell that has saved drivers' lives in accidents that would previously have been fatal.\n\nAfter Ayrton Senna's death at Imola in 1994, the pace of safety improvement accelerated dramatically. Head-and-neck support devices (HANS) became mandatory. Cockpit height was increased. Kerbs and barriers were redesigned. The combination of improvements meant the 2000s, 2010s, and 2020s passed without a single fatality in a World Championship race — an extraordinary achievement.\n\nThe introduction of the Halo — a titanium structure designed to protect the driver's head from debris and barriers — was met with aesthetic objections when mandated in 2018, but its life-saving credentials have since been established beyond doubt. Romain Grosjean's fiery crash at Bahrain in 2020, from which he escaped with minor burns, was almost certainly fatal without it.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Safety", "History", "Technical", "Halo", "Heritage"],
        sortOrder: 90,
        imageUrl: null,
      },
      {
        title: "The 10 Greatest Formula 1 Circuits in History: Monaco, Spa, Suzuka and More",
        slug: "10-greatest-formula-1-circuits-in-history",
        excerpt: "From the tunnel at Monaco to the 130R at Suzuka, Formula 1 has been shaped by the circuits that host it. These are the venues that define the sport.",
        content: `Every Formula 1 circuit tells a story. The greatest of them tell many.\n\n**Monaco** remains the most iconic address in motorsport. The streets of Monte Carlo — narrow, unforgiving, hemmed in by armco and barriers — have hosted grands prix since 1929. The circuit demands perfection and punishes any deviation from it. Winning at Monaco carries a prestige no other victory can match.\n\n**Spa-Francorchamps** in Belgium is widely regarded by drivers and engineers as the most technically complete challenge in the calendar. Eau Rouge and Raidillon, taken flat in modern machinery, remain the most breathtaking sequence in racing. The 7km layout winds through the Ardennes forests, its weather notoriously changeable — a race can begin in sunshine and end in snow.\n\n**Suzuka** in Japan is the circuit most drivers cite as their favourite. The figure-of-eight layout creates a sequence of high-speed corners — 130R, the Esses, Degner — that require the perfect car and the perfect driver. The Japanese crowd, among the most knowledgeable in any sport, treat it as a cathedral.\n\n**Silverstone** carries the weight of being Formula 1's spiritual home. The original circuit used the runways of a wartime RAF airfield, and the British Grand Prix has been held there almost continuously since 1950. Maggots, Becketts, and Chapel — a sequence taken at over 200mph — is unmatched for sustained high-speed commitment.\n\n**Monza** is the Temple of Speed: the oldest active circuit on the calendar, a 5.8km loop of straights and chicanes on the outskirts of Milan that produces the highest average speeds of any race. The Parabolica, Ascari, and the banking (no longer used in racing) give the circuit a timeless grandeur.\n\nThe list continues through Interlagos, the Nürburgring Nordschleife, Imola, Fuji Speedway, and Brands Hatch — each a chapter in Formula 1's extraordinary history.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Circuits", "History", "Monaco", "Spa", "Suzuka", "Silverstone"],
        sortOrder: 100,
        imageUrl: null,
      },
      {
        title: "The Greatest Formula 1 Races in History: Rain, Drama, and Glory",
        slug: "greatest-formula-1-races-in-history",
        excerpt: "Some races are memorable. A few are immortal. We look back at the grands prix that stopped the world — from Gilles Villeneuve's 1979 French GP to the 1984 Monaco Grand Prix.",
        content: `The greatest Formula 1 races share a quality that transcends mere sporting excellence. They become stories — ones you tell to people who don't follow the sport and watch their eyes widen anyway.\n\n**The 1979 French Grand Prix at Dijon** produced the most celebrated duel in the sport's history. Gilles Villeneuve and René Arnoux fought over second position for the final laps in a battle of mutual respect and mutual refusal to yield. They touched, they ran side-by-side, they kept going. The footage remains impossible to watch without a racing pulse.\n\n**The 1984 Monaco Grand Prix** gave the world Ayrton Senna in full, bewildering flight. In treacherous rain, the then-unknown Toleman driver reduced Alain Prost's lead from 45 seconds to 7 seconds in just 19 laps. The race was controversially stopped early, denying Senna almost certain victory, but the footage confirmed that a phenomenon had arrived.\n\n**The 2008 Brazilian Grand Prix** — the final round of the season — produced the most astonishing finish in championship history. Lewis Hamilton needed fifth place to claim his first title. With one lap to go, he was sixth. On the final corner, in the final sector, Timo Glock's Toyota (on dry tyres on a damp track) slowed. Hamilton passed him. The title was his by one point.\n\n**The 1996 Spanish Grand Prix** is remembered as the race Michael Schumacher confirmed his genius to those who still doubted it. Starting from third, he drove the second half of the race on a single surviving cylinder, nursing the failing Ferrari around Circuit de Barcelona-Catalunya to an extraordinary third place.\n\n**The 2021 Italian Grand Prix at Monza** produced the era's most dramatic image: Verstappen's Red Bull landing atop Hamilton's Mercedes at the chicane, the Dutchman's wheel resting directly on the Englishman's helmet — and the Halo absorbing the impact.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["History", "Greatest Races", "Heritage", "Monaco", "Brazil"],
        sortOrder: 110,
        imageUrl: null,
      },
      {
        title: "Why Monaco Will Always Be Formula 1's Greatest Race",
        slug: "why-monaco-will-always-be-formula-1-greatest-race",
        excerpt: "Every year there are calls to drop Monaco from the calendar. Every year they fail. We explain why the streets of Monte Carlo remain the sport's most important event.",
        content: `The argument against Monaco is a strong one. The circuit is too narrow for meaningful overtaking. The cars are too wide to race wheel-to-wheel through the tunnels and hairpins. A safety car or minor incident can render the result a lottery. By almost every modern metric of what makes a good racing circuit, Monaco fails.\n\nAnd yet.\n\nMonaco is the race every driver wants to win above all others. It is the race every sponsor wants their logo on. It is the event that attracts heads of state, film stars, and billionaires to the same sun-drenched cramped terraces as genuine racing fans. It is held on roads that, 51 weeks a year, are used by taxis and delivery vans and the occasional supercar. The transformation from city street to Formula 1 circuit is itself a spectacle.\n\nThe demands Monaco places on a driver are unique and unreplicable. Qualifying at Monaco is among the highest-pressure 60 minutes in sport — pole position is so decisive that the race sometimes produces the least dramatic result, but the cost of the slightest error is immediate elimination. A wall that does not move, on a circuit where the acceptable margin of error is measured in millimetres.\n\nDrivers speak of Monaco in almost spiritual terms. Senna described entering a kind of trance state during his extraordinary 1984 performance in the rain. Hill, winning in 1996 to demonstrate he was finally beyond his father's shadow, was overcome with emotion on the podium. Hamilton winning six times in Monte Carlo, and Verstappen finally winning in 2021, speak to the circuit's capacity to define careers.\n\nDrop Monaco from the calendar? The day that happens is the day Formula 1 finally forgets what made it extraordinary.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Monaco", "Circuits", "Heritage", "Opinion"],
        sortOrder: 120,
        imageUrl: null,
      },
      {
        title: "The Fastest Formula 1 Tracks in the World: Monza, Spa, Baku and Beyond",
        slug: "fastest-formula-1-tracks-in-the-world",
        excerpt: "Speed is the heartbeat of Formula 1. These circuits produce the highest average speeds, the longest flat-out sections, and the most demanding top-speed tests in the sport.",
        content: `Formula 1 cars are capable of reaching over 370km/h in qualifying trim, yet not all circuits allow them to approach that figure. Track layout, elevation changes, and the balance between high and low-speed corners determine how fast a car can actually travel across a lap.\n\n**Monza** is the fastest circuit on the current calendar, with average race speeds approaching 260km/h. The combination of three long straights — the main straight, the back straight to Lesmo, and the run to Parabolica — allows cars to reach maximum speed repeatedly. The circuit is so power-sensitive that teams run the least downforce of the season here.\n\n**Spa-Francorchamps** produces high average speeds despite its varied layout, because sections like Eau Rouge-Raidillon, Blanchimont, and the run to Bus Stop are taken at enormous velocity. The 7km lap means cars spend a high proportion of time at full throttle.\n\n**Baku** has surprised many with its straight-line speeds. The 2.2km run along the Azerbaijan waterfront is the longest full-throttle section in the championship, regularly seeing speeds in excess of 360km/h during qualifying.\n\n**Silverstone** in high-speed trim — Copse, Maggots, Becketts — sees cars carrying extraordinary speed through sustained directional changes, with G-forces that test driver endurance more than any other circuit on the calendar.\n\nThe **Mexican Grand Prix** at the Autodromo Hermanos Rodriguez sits at 2,285 metres above sea level — the highest circuit in the championship. The thin air reduces downforce and cooling efficiency, allowing cars to reach higher straight-line speeds than at sea level, though the reduced aerodynamic grip makes corner entry particularly challenging.\n\nAs aerodynamic regulations evolve and power outputs increase under the 2026 rules, the record books at these speed temples are already being rewritten.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Circuits", "Speed", "Monza", "Baku", "Technical"],
        sortOrder: 130,
        imageUrl: null,
      },
      {
        title: "Silverstone: The History of Formula 1's Birthplace",
        slug: "silverstone-history-of-formula-1-birthplace",
        excerpt: "A wartime airfield in Northamptonshire became the home of the world's most glamorous sport. The story of Silverstone is the story of Formula 1 itself.",
        content: `The first Formula 1 World Championship race took place at Silverstone on 13 May 1950. His Majesty King George VI attended, alongside a crowd of 100,000 spectators who packed the temporary grandstands erected around the runways of a decommissioned Royal Air Force airfield in Northamptonshire.\n\nGiuseppe Farina won that inaugural race in an Alfa Romeo 158, crossing the line ahead of Luigi Fagioli and Reg Parnell. The British crowd was immense and enthusiastic; the event was a sensation. Formula 1 had arrived.\n\nSilverstone's geography — flat, open, exposed to the Midlands weather — gives it a character unlike any other circuit. The corners are named for the RAF connections that preceded them: Copse, Maggots, Becketts, Chapel. The high-speed sections through these corners produce some of the most dramatic racing on the calendar, with drivers carrying speeds that even experienced engineers find difficult to comprehend.\n\nThe circuit has been continuously modernised since those early days, with new pit complexes, revised layouts, and significant investment in spectator facilities. Yet the essential character of Silverstone — fast, flowing, technical, English — remains unchanged.\n\nThe British Grand Prix has been held at Silverstone in every season save three since 1950, making it the most consistently represented event in the championship's history. Every driver dreams of winning their home grand prix; for the British drivers who have succeeded — Jim Clark, Nigel Mansell, Damon Hill, David Coulthard, Lewis Hamilton — Silverstone victory carries a particular emotional weight.\n\nHamilton's record six British Grand Prix victories, each celebrated with a crowd of over 100,000 passionate, partisan supporters, represent the circuit's greatest modern story. That he may yet add to that total in the twilight of his career at Ferrari adds another chapter to a narrative that shows no sign of ending.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Silverstone", "History", "Heritage", "British GP", "Circuits"],
        sortOrder: 140,
        imageUrl: null,
      },
      {
        title: "How Formula 1 Engines Have Changed Over 70 Years: From Supercharged to Hybrid",
        slug: "how-formula-1-engines-have-changed-over-70-years",
        excerpt: "Seven decades of Formula 1 power unit development have produced some of the most extraordinary engineering in history. We trace the engine story from 1950 to the present day.",
        content: `The story of Formula 1 power units is a story of constant reinvention driven by the tension between performance and regulation.\n\nThe supercharged 1.5-litre engines of the 1950s produced approximately 425bhp — impressive for the era, but a fraction of what followed. The switch to naturally-aspirated 2.5-litre engines in 1954 reflected the FIA's desire to limit outright performance, though in practice the Dino 246 Ferrari V6 and the Coventry Climax four-cylinder that powered so many Cooper and Lotus successes were engineering masterpieces for their time.\n\nThe Cosworth DFV, introduced in 1967, democratised Formula 1 power. By the early 1970s, the Ford-funded Cosworth engine was available to any team willing to pay the fee, powering 155 Grand Prix victories across two decades. It remains the most successful engine in the sport's history by number of wins.\n\nThe first turbo era, between 1977 and 1988, produced the most extreme machinery Formula 1 has ever seen. The BMW four-cylinder unit, in extreme qualifying trim, was estimated to produce 1,400bhp. The Renault RS turbo, the Honda V6, and the TAG Porsche engine defined the era of excess before fuel restrictions, then an outright turbo ban, ended the experiment.\n\nThe naturally-aspirated V10 era of the 1990s and early 2000s — the screaming 18,000rpm symphony of the Ferrari 049, the Cosworth CR-7, the BMW P84 — remains the era most referenced by fans who still mourn the sound of Formula 1 before modern restrictions.\n\nThe current hybrid era, which began in 2014 with the introduction of the 1.6-litre V6 turbo-hybrid Power Unit, represents the most complex internal combustion engineering ever deployed in a racing context. The 2026 regulations take the next step, increasing electrical output to create a genuinely 50/50 split between combustion and electrical power.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Technical", "Engines", "History", "Heritage", "Power Units"],
        sortOrder: 150,
        imageUrl: null,
      },
      {
        title: "F1 Pit Stop Strategy Explained: How Tyres, Seconds, and Decisions Win Races",
        slug: "f1-pit-stop-strategy-explained",
        excerpt: "A Formula 1 race is not won only at the front of the grid. It is won in the pit lane, on the strategy wall, and in the minds of engineers making decisions in fractions of seconds.",
        content: `A modern Formula 1 pit stop takes approximately 2.4 seconds from the car stopping to it leaving the pit box. Inside those 2.4 seconds, a crew of 20 mechanics performs a choreographed sequence of tasks with zero margin for error: front and rear jack operators lift the car, wheelman on each corner remove and refit the 12kg wheel and tyre assembly, a lollipop or light system controls the release.\n\nBut the pit stop itself is just the most visible element of a vastly complex strategic operation that begins weeks before race day and continues until the chequered flag.\n\nPirelli supplies three tyre compounds per race weekend — typically designated soft, medium, and hard — each with different performance characteristics and degradation rates. The softest compounds provide more grip but wear faster; the hardest last longer but are slower. Choosing which compounds to use, when to switch between them, and how many stops to make is the central strategic decision of every race.\n\nThe safety car is perhaps the biggest wild card in strategic planning. A safety car deployment allows teams to make pit stops without losing significant time to cars that have not stopped — closing what might have been a 25-second advantage instantly. Teams that have already stopped must decide whether to extend their stint; teams yet to stop must decide whether to pit under the safety car or gamble on staying out.\n\nUndercut and overcut are the two primary offensive tools. An undercut sees a driver pit earlier than the rival ahead, fitting fresh tyres that allow them to set faster laps while the rival's older tyres degrade — if the gap is sufficient, the car pitting first emerges ahead. An overcut works in reverse: staying out on old tyres while a rival pits, maintaining track position, and hoping the new tyres don't generate enough pace to recover the lost time.\n\nIn an era of real-time telemetry, machine-learning degradation models, and sub-second decision-making, the strategy call that wins or loses a race is rarely the most obvious one.`,
        authorId: adminId,
        section: "news",
        status: "published",
        tags: ["Strategy", "Technical", "Pit Stops", "Tyres", "Explainer"],
        sortOrder: 160,
        imageUrl: null,
      },
    ]).onConflictDoNothing();
    console.log("News articles seeded.");
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
