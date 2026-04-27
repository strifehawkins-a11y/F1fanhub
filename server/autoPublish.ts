import { storage } from "./storage";

const ADMIN_ID = "seed-admin";
const MAX_PER_DAY = 5;

const IMGS = {
  aero: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  track: "https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=1200&q=80",
  car: "https://images.unsplash.com/photo-1547124010-9f501dc2ec65?auto=format&fit=crop&w=1200&q=80",
  pit: "https://images.unsplash.com/photo-1607603750909-408e193868c7?auto=format&fit=crop&w=1200&q=80",
  tyre: "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1200&q=80",
  tech: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=1200&q=80",
  cockpit: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=1200&q=80",
  speed: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=80",
  circuit: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
  helmet: "https://images.unsplash.com/photo-1614518921673-2b010ac3d5cd?auto=format&fit=crop&w=1200&q=80",
  data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  carbon: "https://images.unsplash.com/photo-1567761616-a178fd05d9c5?auto=format&fit=crop&w=1200&q=80",
  driver: "https://images.unsplash.com/photo-1615464994218-2f3e16c42e51?auto=format&fit=crop&w=1200&q=80",
  podium: "https://images.unsplash.com/photo-1524514587686-e2909d726e9b?auto=format&fit=crop&w=1200&q=80",
  crowd: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function alreadyCovered(recentTitles: string[], candidateTitle: string): boolean {
  const low = candidateTitle.toLowerCase().trim();
  for (const t of recentTitles) {
    const tl = t.toLowerCase().trim();
    if (tl === low) return true;
    const sigWords = low.split(/\s+/).filter(w => w.length > 4).slice(0, 6).join(" ");
    if (sigWords.length > 15 && tl.includes(sigWords)) return true;
  }
  return false;
}

async function fetchF1Headlines(): Promise<string[]> {
  const feeds = [
    "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
    "https://www.autosport.com/rss/f1/news/",
    "https://racingnews365.com/feed",
  ];
  for (const url of feeds) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "F1FanHub/1.0 (+https://www.f1fanhub.net)" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const cdataMatches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/gs)].map(m => m[1].trim());
      const plainMatches = [...xml.matchAll(/<title>(.*?)<\/title>/gs)].map(m => m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim());
      const titles = (cdataMatches.length > 2 ? cdataMatches : plainMatches).filter(t => t.length > 10 && t.length < 120).slice(1, 10);
      if (titles.length > 0) return titles;
    } catch {
      continue;
    }
  }
  return [];
}

interface Topic {
  title: string;
  tags: string[];
  imageUrl: string;
  content: string;
}

const TECHNICAL_TOPICS: Topic[] = [
  {
    title: "DRS Explained: How Formula 1's Overtaking Aid Changed Racing Forever",
    tags: ["Technical", "DRS", "Aerodynamics", "Explainer"],
    imageUrl: IMGS.aero,
    content: `The Drag Reduction System — universally known as DRS — is one of the most consequential and debated pieces of technology in modern Formula 1. Introduced in 2011 to increase overtaking, it works by allowing a following driver within one second of the car ahead to open a flap in the rear wing, reducing aerodynamic drag and increasing top speed by approximately 12–15 km/h.

DRS zones are designated by the FIA before each race based on the circuit layout. Most tracks have one or two zones on the longest straights. Monza — with multiple long straights — has historically offered the highest DRS activation frequency on the calendar. Zones have start and end detection points; the system only activates between these markers.

The activation rules exist specifically to control deployment. Drivers cannot use DRS until lap three of the race, nor in the first two laps after a safety car period ends. In qualifying, DRS can be deployed freely at any time on any part of the circuit — contributing to the gap between qualifying times and race pace.

Critics argue DRS turns some passes into formalities: a driver presses a button, gains straight-line speed that the defending driver cannot match, and sails past into the braking zone with no genuine contest. Supporters counter that without it, the dirty air generated by modern high-downforce cars would make following within two seconds nearly impossible, eliminating wheel-to-wheel racing entirely. The 2026 regulations introduced active aero to eventually make the traditional DRS system redundant.`,
  },
  {
    title: "Inside the F1 Pit Wall: How Race Strategy Is Decided in Seconds",
    tags: ["Strategy", "Technical", "Behind the Scenes", "Pit Wall"],
    imageUrl: IMGS.pit,
    content: `For every driver who wins a Formula 1 race on track, there is a team of strategists on the pit wall who made it happen. Understanding how the pit wall operates — and the tools it uses — is essential to understanding modern F1.

The race strategist's primary tool is a tyre degradation model, updated lap by lap in real time using live telemetry from the car, historical data from previous events at the same circuit, and weather sensor feeds. From this model, the strategist constructs multiple race scenarios before lights out — one-stop, two-stop, alternative compound sequences — and ranks them by projected finishing position.

As the race unfolds, every variable that changes triggers a model update: a safety car neutralising the field, a rival team making an unexpected pit call, a sudden rain shower, a slow out-lap from a different team. The strategist has seconds — sometimes less — to recalculate and communicate a decision to the driver.

Driver-strategist communication is its own skill. The pit wall might need to ask a driver to hold position to protect a tyre, while the driver — feeling the car behind breathing down their neck — wants to push. Maintaining driver confidence while delivering strategically necessary instructions requires a combination of clear data communication and psychological awareness that takes years to develop.`,
  },
  {
    title: "Pirelli's F1 Compounds Explained: The Science Behind Soft, Medium and Hard",
    tags: ["Technical", "Tyres", "Pirelli", "Explainer"],
    imageUrl: IMGS.tyre,
    content: `Pirelli has been Formula 1's sole tyre supplier since 2011. Their compound range — designated C1 through C5, where C1 is hardest and C5 softest — determines the strategic shape of every grand prix weekend. Understanding how the compounds work, and why their selection matters, reveals much about F1 strategy.

For each round, Pirelli nominates three adjacent compounds from their range and labels them Hard, Medium, and Soft. The specific selection varies by circuit energy level: high-energy tracks like Silverstone or Spa get harder compounds; lower-stress circuits like Monaco or Singapore get softer ones.

The core trade-off is straightforward: softer compounds generate more grip and pace, but degrade faster. Harder compounds last significantly longer but sacrifice pure speed. Teams must balance peak performance against strategic flexibility — choosing when to pit and which compound to use for each stint.

Tyre degradation is not linear. Compounds go through a warm-up phase, a performance peak, and then a degradation phase that can be gradual or sudden. The sudden end of a compound's working range — the "cliff" — is one of the most challenging elements to predict. Crossing it by even one lap can cause lap time losses of two to four seconds per lap as grip disappears rapidly.`,
  },
  {
    title: "How F1 Downforce Works: Ground Effect, Wings and the Physics of Grip",
    tags: ["Technical", "Aerodynamics", "Downforce", "Explainer"],
    imageUrl: IMGS.aero,
    content: `A modern Formula 1 car generates more aerodynamic downforce than its own weight at racing speeds. This extraordinary capability — allowing corners to be taken at forces that seemed physically impossible a generation ago — is the result of decades of aerodynamic development across three distinct technical philosophies.

The first philosophy is wing-generated downforce. Front and rear wings function as inverted aerofoils — identical in principle to aircraft wings, but oriented to generate downward rather than upward force. The angle of attack determines the downforce level; steeper angles produce more grip but dramatically increase drag. Every circuit demands a different balance.

The second is bodywork management. The bargeboards, sidepod inlets, and turning vanes that characterised F1 cars through 2021 were designed to control the chaotic airflow between front and rear. Their purpose was to guide clean, fast-moving air to the rear diffuser and keep turbulent air away from sensitive aerodynamic surfaces.

The third — and most powerful — is ground effect, rediscovered by the 2022 regulations after being banned in the early 1980s. Shaped underfloor channels accelerate air beneath the car, creating an area of low pressure that literally sucks the car downward. Ground-effect downforce is more efficient than wing-generated downforce because it creates less drag for equivalent grip levels.`,
  },
  {
    title: "The F1 Hybrid Power Unit Explained: How 1,000 Horsepower Is Generated",
    tags: ["Technical", "Power Unit", "Hybrid", "Engineering"],
    imageUrl: IMGS.tech,
    content: `The Formula 1 power unit is the most sophisticated internal combustion system ever put into production racing. Since 2014, F1 has used a 1.6-litre turbocharged V6 engine paired with two motor generator units — a system that produces approximately 1,000 horsepower while recovering more than 50% of the fuel's energy.

The MGU-K (Motor Generator Unit — Kinetic) is directly connected to the crankshaft. Under braking, it acts as a generator, converting kinetic energy into electrical energy stored in the battery. Under acceleration, it acts as a motor, deploying stored electrical energy to supplement the combustion engine. The 2026 regulations dramatically increased MGU-K deployment beyond the previous 120kW cap.

The turbocharger uses exhaust gases to spin a compressor, forcing more air into the engine than it could naturally aspirate. Managing the thermal load of the turbo — which operates at temperatures exceeding 1,000°C — is one of the power unit manufacturer's primary development challenges.

The battery manages electrical flow between the MGUs. Storing exactly the right amount of energy for deployment at the right moment requires software algorithms of extraordinary sophistication. Teams develop their own energy management strategies that are closely guarded intellectual property — as important to lap time as engine power itself.`,
  },
  {
    title: "Carbon Fibre in Formula 1: The Material That Revolutionised Motorsport",
    tags: ["Technical", "Materials", "Carbon Fibre", "Safety"],
    imageUrl: IMGS.carbon,
    content: `Carbon fibre composite — a material that combines extremely thin carbon fibres woven into sheets and bonded with epoxy resin — has been the defining structural material of Formula 1 cars since McLaren pioneered the first carbon fibre monocoque in 1981. No other material comes close to its combination of stiffness, strength, and lightness.

The key property of carbon fibre composite is its specific stiffness — stiffness relative to weight. Pound for pound, carbon fibre is approximately five times stiffer than steel. An F1 car's survival cell can weigh as little as 35 kilograms while withstanding impacts of over 100G. The same structure in steel would weigh several hundred kilograms.

F1 teams manufacture their own carbon fibre components in-house using autoclave curing: layers of pre-impregnated carbon fibre are laid up in precise orientations, bagged, and cured under heat and pressure to drive out air voids and set the resin.

Safety is where carbon fibre's performance has been most visibly demonstrated. Romain Grosjean's 2020 Bahrain crash, in which his car split in two at roughly 220 km/h and burst into flames, was survived because the survival cell remained intact around the driver. The halo and the carbon tub working together represented the full realisation of a safety philosophy decades in development.`,
  },
  {
    title: "F1 Suspension Setup: How Engineers Find the Perfect Balance",
    tags: ["Technical", "Suspension", "Engineering", "Setup"],
    imageUrl: IMGS.tech,
    content: `Formula 1 suspension setup is one of the most technically nuanced aspects of race weekend preparation. The suspension system connects the car's tyres to its chassis, and every adjustment made to it has cascading effects on aerodynamic performance, mechanical grip, tyre wear, and driver feel.

Modern F1 cars use pushrod or pullrod suspension at both ends of the car. In a pushrod system, a diagonal link running from the upright pushes upward into the chassis, compressing a spring/damper unit inside the bodywork. The choice between configurations affects packaging, centre of gravity, and the sensitivity of the suspension geometry to ride height changes.

Spring rates determine how much the car resists vertical movement. A stiffer spring keeps the ride height more consistent — important for aerodynamic stability — but reduces the ability of the tyres to absorb bumps. Softer springs allow better mechanical grip over kerbs and uneven surfaces but can cause the car's aerodynamic platform to shift.

Anti-roll bars connect the left and right suspension at each end of the car, resisting the body roll that occurs when the car corners. A stiffer front anti-roll bar transfers load to the outer front tyre in a corner, increasing understeer. The balance between front and rear anti-roll stiffness is one of the primary tools for adjusting the car's handling balance between circuits.`,
  },
  {
    title: "F1 Brakes Explained: How Cars Stop From 300 km/h in Under Two Seconds",
    tags: ["Technical", "Brakes", "Engineering", "Explainer"],
    imageUrl: IMGS.car,
    content: `The braking systems on a Formula 1 car are among the most extreme pieces of engineering on any racing machine. At maximum braking effort from 300 km/h, an F1 car can decelerate at over 5G — decelerating from motorway speeds to walking pace in roughly 65 metres.

F1 cars use carbon-carbon brake discs and pads. Unlike the cast iron discs on road cars, carbon-carbon composites operate most effectively at temperatures between 400°C and 1,000°C. Below this range — such as in the early laps of a race or after a safety car — the brakes are ineffective and drivers must manage their warming carefully.

Brake bias — the proportion of braking force applied to the front versus rear — is adjustable from the steering wheel during the race. Moving bias forward increases stability under braking but risks front locking; moving it rearward can cause oversteer under trail braking. Drivers adjust brake bias at every corner requiring a different setup.

The brake-by-wire system on the rear axle electronically blends mechanical braking and regenerative braking from the MGU-K. The challenge is that the regenerative load changes as the battery state of charge varies — the system must make these adjustments completely transparently to the driver.`,
  },
  {
    title: "The F1 Gearbox: Why a Gear Change Takes 15 Milliseconds",
    tags: ["Technical", "Gearbox", "Engineering", "Drivetrain"],
    imageUrl: IMGS.tech,
    content: `The Formula 1 gearbox is one of the most precisely engineered mechanical components in motorsport. Modern F1 transmissions shift gears in approximately 15 milliseconds — faster than the human eye can perceive — and must survive an entire season of grand prix racing while weighing less than a typical kitchen appliance.

All current F1 cars use a semi-automatic sequential gearbox. The driver operates paddle shifters mounted behind the steering wheel — typically the right paddle upshifts, the left downshifts — and electronics and hydraulics do the mechanical work. There is no clutch pedal during racing.

F1 gearboxes use eight forward gears (mandatory since 2014). The ratios are fixed for each car at the start of the season. This means engineers must find a ratio spread that works across every circuit on the calendar: the same ratios that serve the car at Monza must also function at Monaco.

Reliability regulations require the gearbox to last for six consecutive events. Teams managing grid penalties for gearbox changes must balance development updates against championship position — fitting a new component when a grid penalty has minimal championship impact.`,
  },
  {
    title: "The Halo: How F1's Most Controversial Safety Device Became Its Most Important",
    tags: ["Technical", "Safety", "Halo", "Engineering"],
    imageUrl: IMGS.cockpit,
    content: `No piece of safety equipment in Formula 1's recent history has saved more lives, and none was introduced to greater aesthetic objection. The halo — a titanium structure above the cockpit that protects the driver's head — was mandated by the FIA for the 2018 season following years of development and bitter controversy.

The halo is made from Grade 5 titanium — the same alloy used in aerospace applications for its exceptional strength-to-weight ratio. The structure weighs approximately 7 kilograms and can withstand a vertical static load of 125 kilonewtons — roughly equivalent to the weight of a London double-decker bus.

In practice, its life-saving capability was demonstrated dramatically within three years of introduction. At the 2020 Bahrain Grand Prix, Romain Grosjean's car split in two at over 200 km/h and burst into flames. The halo diverted the main chassis barrier around the cockpit. Grosjean escaped with burns to his hands.

Driver opinion, initially hostile — Sebastian Vettel famously described it as the "worst aesthetic change" in F1 — shifted entirely after these incidents. At the 2021 British Grand Prix, Max Verstappen's Red Bull was struck on top by Lewis Hamilton's Mercedes at high speed — the halo bore the direct impact on the driver's helmet area.`,
  },
  {
    title: "F1 Wind Tunnel Testing: How Aerodynamic Development Actually Works",
    tags: ["Technical", "Wind Tunnel", "Aerodynamics", "Development"],
    imageUrl: IMGS.tech,
    content: `Wind tunnel testing is the cornerstone of aerodynamic development for every Formula 1 team, despite the cost cap era introducing strict time limits on its use. Understanding how teams use this resource — and the constraints imposed on them — reveals much about how modern F1 cars are developed.

Formula 1 wind tunnels are custom-built facilities costing hundreds of millions of pounds. The tunnels operate at a specific scale — typically 50% or 60% of the full car size — using a scaled model mounted on a moving belt that simulates the ground moving under the car as it would in real life.

The FIA's Aerodynamic Testing Restrictions limit the amount of wind tunnel time each team can use per year. The allocation is inversely proportional to championship position — teams that finished higher in the previous year's Constructors' Championship receive less wind tunnel and CFD time. This is a deliberate convergence mechanism: struggling teams get more development resource.

Computational Fluid Dynamics runs in parallel with physical tunnel testing. CFD simulates airflow around virtual car models using supercomputer clusters, allowing teams to test thousands of geometrical changes per year that would be impossible to physically model. The FIA also limits CFD tokens — the computational resource each team can spend on virtual testing.`,
  },
  {
    title: "The F1 Steering Wheel: A Cockpit Control Centre With 25+ Buttons",
    tags: ["Technical", "Cockpit", "Technology", "Explainer"],
    imageUrl: IMGS.cockpit,
    content: `The steering wheel of a modern Formula 1 car is one of the most sophisticated pieces of driver interface technology ever created. Costing upwards of £50,000 to manufacture, it houses dozens of buttons, dials, and paddles that give the driver real-time control over hundreds of vehicle parameters while cornering at 5G.

Each team designs their own steering wheel from scratch, tailored to the specific preferences of each driver. A typical modern F1 steering wheel includes: gear shift paddles, clutch paddles for race starts, brake bias adjustment, DRS activation button, energy deployment mode selector, pit lane speed limiter, and radio button.

The rotary dials — sometimes 10 or more on a single wheel — control parameters like differential locking, fuel mixture, brake balance, and the engine's power unit deployment strategy. A driver must be able to locate and adjust any control at speed, in the dark, during heavy braking, without looking down.

The wheel is removed for the driver to enter or exit the cockpit and is personally fitted to each driver's hand size and grip preference. Carlos Sainz and Charles Leclerc ran different steering wheel designs even while driving the same Ferrari car, reflecting the highly personal nature of the driver-wheel interface.`,
  },
  {
    title: "How F1 Teams Use Data Analytics: 300 Sensors, 3GB Per Lap",
    tags: ["Technical", "Data", "Analytics", "Technology"],
    imageUrl: IMGS.data,
    content: `A modern Formula 1 car generates approximately 3 gigabytes of data per lap. With over 300 sensors monitoring everything from brake disc temperature and tyre pressure to suspension load and power unit efficiency, the challenge for teams is not collecting data — it is making sense of it fast enough to improve performance during a three-day race weekend.

Sensors are distributed across every critical system on the car. Tyre sensors monitor temperature and pressure at multiple points inside each tyre simultaneously. Suspension sensors measure the load, travel, and velocity of each corner's suspension in real time. Engine sensors track intake pressure, exhaust temperature, and the efficiency of every combustion cycle.

This data is transmitted wirelessly from the car to the pit wall in real time, where it is processed by the team's data engineers and compared against the predictive models built before the session. Deviations from predicted values trigger investigation: if a tyre is running hotter than expected, is it a setup choice, a driving style issue, or a product anomaly?

Historical data compounds in value over time. A team that has raced at a circuit for 20 years has millions of data points from previous visits — tyre wear curves, weather correlations, safety car probability models — that a new team simply cannot replicate. This data heritage is a genuine competitive advantage.`,
  },
  {
    title: "Active Suspension: The Technology That Made F1 Cars Almost Too Fast",
    tags: ["Technical", "Suspension", "F1 History", "Technology"],
    imageUrl: IMGS.car,
    content: `Between 1987 and 1993, a handful of Formula 1 teams developed and deployed active suspension systems that transformed the performance ceiling of the sport — and raised enough safety concerns about technological complexity that the FIA banned them entirely for 1994.

Conventional passive suspension uses springs and dampers to absorb road irregularities. Active suspension replaces these with hydraulic actuators controlled by a computer. The system continuously monitors the car's motion and adjusts the suspension position at each corner to maintain optimal aerodynamic platform regardless of what the car is doing.

The aerodynamic benefit was enormous. An F1 car's downforce is highly sensitive to its ride height. Passive suspension allows the car to pitch and roll as it brakes, corners, and accelerates. Active suspension eliminated this variation, keeping the car at its ideal aerodynamic height throughout the lap.

Williams were the dominant force in active suspension development. Their FW14B of 1992 — driven by Nigel Mansell to nine wins from 16 races — is widely regarded as one of the most technically superior cars ever built. The FIA's decision to ban active suspension for 1994 was part of a broader effort to reduce the performance gap between well-funded and less well-funded teams.`,
  },
  {
    title: "ERS Deployment Strategy: How F1 Drivers Use Electrical Power to Attack and Defend",
    tags: ["Technical", "ERS", "Hybrid", "Strategy"],
    imageUrl: IMGS.speed,
    content: `The Energy Recovery System in a modern Formula 1 car is not just a fuel-saving technology — it is an active performance weapon that skilled drivers deploy tactically throughout a lap and across a race. Understanding how ERS deployment works reveals a hidden layer of strategy invisible to television viewers.

The ERS consists of the Motor Generator Unit-Kinetic, which recovers energy under braking and deploys it during acceleration, and the battery that manages the electrical charge. The key tactical use of ERS is temporal deployment — choosing when within a lap to release stored electrical energy.

In a standard lap, ERS recharges under braking and deploys on exit from slow corners and on straights. But the amounts and timings can be varied: saving deployment through one section to have an advantage in another, or deploying extra charge where an overtake is possible.

Defending with ERS is equally important. A driver being chased by a faster car can deploy additional electrical energy on the approach to a DRS detection point, extending the gap beyond one second and preventing DRS activation. A driver running low on battery charge is vulnerable to attack in specific sections of the lap.`,
  },
  {
    title: "Safety Car and Virtual Safety Car: The Rules That Can Swing a Championship",
    tags: ["Regulations", "Safety Car", "Strategy", "Explainer"],
    imageUrl: IMGS.track,
    content: `The safety car and virtual safety car are among the most strategically significant interventions in a Formula 1 race. Understanding the precise regulations governing their deployment — and the strategic responses they trigger — is essential to reading a grand prix intelligently.

The safety car is deployed when an incident creates conditions the race director deems too dangerous for racing. All cars must reduce speed and form a queue behind the safety car within a specified time. Overtaking is prohibited. Critically: pit stops can be taken during a safety car period with minimal time loss because the gaps between cars close as the field bunches up.

The virtual safety car, introduced in 2015, neutralises the race without physically deploying the safety car. Drivers must maintain a minimum lap time rather than following a physical car. The VSC creates its own strategic opportunities: pit stops can be taken with less time loss than normal racing conditions, though more than under a full safety car.

The 2021 Abu Dhabi Grand Prix finale — where the decision to allow five lapped cars but not all to overtake before the final lap restart — set up the championship-deciding battle between Lewis Hamilton and Max Verstappen. The subsequent FIA investigation resulted in updated safety car procedures and a clarification of the race director's powers.`,
  },
  {
    title: "How F1 Qualifying Works: Q1, Q2, Q3 and the Tyre Rule Explained",
    tags: ["Explainer", "Qualifying", "Format", "Strategy"],
    imageUrl: IMGS.track,
    content: `Formula 1 qualifying is a knockout format that determines the starting grid for Sunday's race. Spread across three sessions with eliminations, it creates a genuine contest for pole position that is often as exciting as the race itself.

Q1 runs for 18 minutes with all 20 drivers. The five slowest — those in positions 16-20 — are eliminated and locked into those grid positions for Sunday. Q2 follows with 15 cars and lasts 15 minutes. The five slowest take positions 11-15. Q3 is the final 12-minute shootout among the top ten.

The critical strategic layer is the tyre rule: any driver who progresses from Q2 must start Sunday's race on the same compound they used to set their fastest Q2 lap time. This creates a genuine dilemma. A driver on the Medium tyre has a better race strategic position but risks not making Q3 if the Medium doesn't provide enough pace.

On wet qualifying days, all bets are off: rain interrupts tyre strategy and the grid can be scrambled entirely. Sprint weekends use a modified format: a Sprint Shootout on Friday determines the grid for Saturday's Sprint race, while standard qualifying runs on Saturday afternoon for Sunday's race.`,
  },
  {
    title: "The F1 Points System: How 25 Points in Australia Can Win a Championship in Abu Dhabi",
    tags: ["Explainer", "Points", "Championship", "Regulations"],
    imageUrl: IMGS.circuit,
    content: `The Formula 1 World Championship is decided by a points system that converts individual race results into a season-long hierarchy. The current system — 25 points for the winner, descending to 1 point for tenth — has been in use since 2010 and has profoundly shaped how teams and drivers approach strategic decisions across the season.

The full current allocation is: 1st-25, 2nd-18, 3rd-15, 4th-12, 5th-10, 6th-8, 7th-6, 8th-4, 9th-2, 10th-1. An additional 1 point is awarded for the fastest lap in the race, but only to a driver finishing in the points. This bonus point was introduced in 2019 and has occasionally been tactically significant.

On Sprint weekends, an additional smaller points allocation is awarded for the top eight Sprint race finishers: 8, 7, 6, 5, 4, 3, 2, 1. These points count toward both championships and have occasionally influenced the standings materially when margins were tight.

The gap between first and second place — 7 points — is large enough that consistent podium finishes will outscore a driver who wins half the races but retires from others. This built-in premium on reliability has historically made race-finishing consistency as important as outright pace in championship mathematics.`,
  },
  {
    title: "Monaco Grand Prix: Why the Slowest Race on the Calendar Is the Most Prestigious",
    tags: ["Circuits", "Monaco", "F1 History", "Street Circuit"],
    imageUrl: IMGS.circuit,
    content: `Monaco is a paradox. The slowest circuit on the Formula 1 calendar — its layout allows average speeds that would be unimpressive at most other venues — attracts the most intense desire to win of any race in the sport. To win at Monaco is to join a pantheon that includes Senna, Stewart, Prost, and Hill.

The circuit's character stems entirely from its geography. The streets of the Principality were never designed for motor racing. The barriers are so close to the car that drivers regularly touch armco on flying laps. There is effectively zero run-off. A mistake results in immediate terminal contact with a wall.

This unforgiving nature elevates qualifying to an almost mythological status at Monaco. Overtaking during the race is essentially impossible due to the circuit's narrow passages and lack of long straights. Grid position is therefore everything — the driver who qualifies on pole has an overwhelming statistical advantage to win.

Ayrton Senna won Monaco six times — a record that may never be broken. His 1984 drive through the field in a midfield Toleman before the race was red-flagged in controversial circumstances, and his 1992 wheel-to-wheel battle with Nigel Mansell in the closing laps, remain among the most replayed moments in the sport's history.`,
  },
  {
    title: "The F1 Cost Cap Explained: How $135 Million Reshaped the Competitive Order",
    tags: ["Regulations", "Budget Cap", "Business of F1"],
    imageUrl: IMGS.data,
    content: `Formula 1's financial cost cap, introduced for the 2021 season, is the most significant structural reform to the sport's competitive framework in its history. Before 2021, the teams with the deepest pockets could simply outspend rivals into submission.

The cap applies to what the FIA defines as "performance-related expenditure" — essentially everything directly connected to designing, building, and operating the racing car. For 2024, the cap stood at $135 million for a 23-race season. Driver salaries, the three highest-paid staff members, and marketing costs are excluded from the calculation.

Compliance is monitored through rigorous financial reporting. Teams submit detailed audited accounts to the FIA's Cost Cap Administration. The first major enforcement test came in late 2022 when the FIA found Red Bull Racing to have exceeded the 2021 cap by around $1.8 million. The resulting penalty — a $7 million fine and a 10% reduction in aerodynamic testing time — was considered by many to be insufficiently deterrent.

The cap's impact on the midfield has been transformative. Teams previously operating on budgets well below the cap found the cap represented an increase in their available resource — levelling the playing field in a way that had been structurally impossible before 2021.`,
  },
  {
    title: "Speed Records in F1: The Fastest Laps, Top Speeds and Records That Defined Eras",
    tags: ["Records", "Speed", "F1 History", "Technical"],
    imageUrl: IMGS.speed,
    content: `Speed is Formula 1's defining characteristic, and the lap records set at each circuit on the calendar represent the absolute limit of what human beings and machines can achieve together. Comparing these records across eras tells the story of the sport's extraordinary technical progression.

The fastest cars in Formula 1 history, in terms of single-lap speed, were the qualifying cars of the 1980s turbo era. Running on special fuels with turbocharger boost pressure far beyond their race settings, these cars — led by the BMW-powered Brabham — are estimated to have produced over 1,400 horsepower from 1.5-litre engines.

The current fastest Monza race lap was set in 2019 by Charles Leclerc's Ferrari, at an average of approximately 263 km/h. The top speed measured on the main straight approaches 375 km/h during qualifying at low-downforce specification.

In terms of outright top speed, Formula 1's fastest recorded speed on a public circuit is roughly 378 km/h at the 2016 Mexican Grand Prix, where the high altitude reduces air resistance significantly. The theoretical maximum speed achievable by a 2026-specification car in minimum-downforce trim is estimated to exceed 400 km/h.`,
  },
  {
    title: "F1 Team History: Why Only Ferrari Have Been There From the Beginning",
    tags: ["F1 History", "Teams", "Paddock", "Ferrari"],
    imageUrl: IMGS.track,
    content: `More than one hundred constructors have contested the Formula 1 World Championship since it began in 1950. Of those, ten remain today. The story of which teams survived — and which did not — reveals the sport's brutal economics and the small margins that separate legendary teams from forgotten ones.

Only Ferrari has competed in every season of the World Championship without exception. The Scuderia's presence is so fundamental to Formula 1's commercial identity that they receive a unique annual payment — the "historic payment" — simply for being part of the sport. Every other team's continued existence depends on competitiveness and commercial success.

McLaren entered F1 in 1966, founded by New Zealand driver Bruce McLaren who died testing a Can-Am car at Goodwood in 1970. The team he created survived, and went on to win 183 races. Their 1988 season remains the benchmark of dominance: 15 wins from 16 races with Ayrton Senna and Alain Prost.

Williams — founded by Frank Williams and Patrick Head in 1977 — built a record of 16 Constructors' Championships across the 1980s and 1990s before declining sharply as the budgets required for competitiveness outgrew their commercial base. The failures are equally instructive: Brabham, Tyrrell, Lotus, Jordan — all are gone.`,
  },
  {
    title: "Wet Weather Driving in F1: Why Rain Separates Champions from Contenders",
    tags: ["Technique", "Wet Weather", "Driver Skills", "Racing"],
    imageUrl: IMGS.track,
    content: `Wet weather driving in Formula 1 is widely regarded as the purest test of driving talent in the sport. When grip levels drop dramatically, aerodynamic downforce becomes less relevant, and raw feel for the car — the ability to sense the limit of adhesion through fingertips, seat, and pedals — becomes the overwhelming differentiator.

The primary tool in wet weather is the Intermediate tyre or the Full Wet tyre. Intermediates are designed for damp but not fully saturated conditions. Full Wets evacuate up to 65 litres of water per second from their contact patch. Choosing when to switch between them — and timing the switch correctly — is one of the most significant calls in a wet race.

The racing line in the wet is frequently different from the dry line. The rubber deposited by thousands of laps of dry running becomes a polished, slippery surface when wet. The cleanest and most effective grip is often found off the usual racing line, on the unprepared road surface that retains more texture.

Ayrton Senna was universally regarded as the finest wet weather driver of his era — his pole position at the 1984 Monaco Grand Prix in an uncompetitive Toleman, and his dominant 1993 European Grand Prix victory at Donington Park, are the canonical examples. Lewis Hamilton and Max Verstappen have both produced iconic wet weather performances that reinforced their status as generational talents.`,
  },
  {
    title: "Tyre Management in F1: How Drivers Look After Their Most Critical Asset",
    tags: ["Technical", "Tyres", "Strategy", "Driver Skills"],
    imageUrl: IMGS.tyre,
    content: `Tyre management — the art of extracting maximum performance from a set of Pirelli compounds while simultaneously ensuring they do not degrade before the planned pit stop — is one of the most complex skills in Formula 1. It is invisible to television viewers, but often the primary determinant of race results.

The core challenge is thermal: every tyre compound operates within a specific temperature window where its rubber is at peak performance. Above this window the rubber blisters, generates excessive wear, and eventually falls off the cliff — losing grip dramatically in the space of one or two laps.

Sliding is the primary enemy of tyre life. When a tyre slides — whether from understeer, oversteer, or wheelspin — the rubber scrubs against the track surface and generates excess heat. A driver who can minimise sliding by using perfectly smooth inputs will typically extend their tyre life dramatically compared to a driver with more aggressive technique.

The difference in tyre management capability between teammates on identical equipment is one of the clearest comparative metrics in F1. Teams use it to evaluate driver performance and to identify setup changes that help the more managing driver's technique — often revealing fundamental truths about how the car behaves at the limit of its tyre envelope.`,
  },
  {
    title: "The F1 Race Start: Why the First Corner Decides More Races Than Any Other",
    tags: ["Technique", "Race Start", "Strategy", "Driver Skills"],
    imageUrl: IMGS.car,
    content: `The Formula 1 race start is the most compressed moment of strategic and physical intensity in the sport. In the four to five seconds between lights out and the first braking point, positions are gained and lost that can determine the entire shape of a grand prix.

The modern F1 start procedure requires the driver to manage three simultaneous variables: clutch engagement, throttle position, and wheelspin. At the moment the lights go out, the driver must release the clutch from its pre-set launch position while progressively increasing throttle input, monitoring whether the tyres are spinning or gripping.

The launch control systems that many fans assume modern F1 cars use have been banned since 2008. All starts must be managed manually by the driver. However, the cars do have systems that can limit catastrophic wheelspin — the engine management software prevents spinning that would cause the driver to go nowhere.

The first corner is where a perfectly executed start can translate into positions that take the entire race to undo, or a poor start can be recovered. Hamilton's ability to gain positions at the start was a hallmark of his championship campaigns; Max Verstappen's aggression at Turn 1 — particularly at Bahrain and Saudi Arabia — became one of the defining narratives of the 2021 season.`,
  },
  {
    title: "Lando Norris: How F1's Nearly Man Became a Championship Contender",
    tags: ["Driver Profile", "Lando Norris", "McLaren", "2024 Season"],
    imageUrl: IMGS.helmet,
    content: `Lando Norris spent four years at McLaren being consistently impressive in an uncompetitive car before the stars aligned in 2024. The British driver's journey from the paddock's most-liked personality to genuine championship contender is one of the most compelling development stories in the sport's recent history.

Norris joined McLaren as a 19-year-old in 2019, partnering with Carlos Sainz. His qualifying pace was immediately evident, but the McLaren regularly sat at the back of the midfield. Norris used those years to develop his racecraft, wet weather skills, and the mental resilience required to maintain motivation through seasons with limited results.

The 2024 McLaren was a different proposition. The MCL38 evolved through the season into one of the fastest cars on the grid, and Norris capitalised. His first victory came at Miami — a long-overdue milestone for a driver who had finished on the podium six times without a win. That breakthrough changed the conversation around him permanently.

What distinguishes Norris is his technical feedback and his capacity to develop a car through a season. His relationship with his engineers — developed through the difficult years — produced one of the most effective driver-team partnerships in the paddock. For 2026, with McLaren leading the field, he enters the season as a genuine title favourite rather than a driver waiting for his chance.`,
  },
  {
    title: "Charles Leclerc: Ferrari's Untamed Talent and the Search for a Title",
    tags: ["Driver Profile", "Charles Leclerc", "Ferrari", "Championship"],
    imageUrl: IMGS.helmet,
    content: `Charles Leclerc arrived in Formula 1 in 2018 as one of the most highly rated prospects the junior categories had produced in a decade. His ability to extract performance from uncompetitive machinery, his qualifying speed, and his ability to manage a race in difficult circumstances marked him out as a generational talent from the moment he stepped into an F1 car.

His first full Ferrari season in 2019 produced two victories — Spa and Monza — and confirmed what his junior career had suggested. But the pattern that would define much of his Ferrari tenure also emerged: a car capable of winning races but not consistently competitive enough to mount a sustained championship challenge.

The 2022 season offered the most tantalising glimpse of what a competitive Leclerc-Ferrari combination could achieve. He led the championship through the opening rounds and drove with the controlled aggression that had always characterised his best performances. A series of strategic errors and reliability failures progressively handed the championship to Verstappen.

What defines Leclerc — beyond his raw speed — is his handling of adversity. His Monaco pole position with the car in parc fermé, his recovery drives, and his continued development as a complete racer suggest a driver who has not yet produced his defining championship season. Ferrari's 2026 competitiveness will determine whether that season arrives.`,
  },
  {
    title: "Fernando Alonso: Why F1's Greatest Competitor Never Gave Up",
    tags: ["Driver Profile", "Fernando Alonso", "Aston Martin", "F1 Legend"],
    imageUrl: IMGS.helmet,
    content: `Fernando Alonso turned 43 during the 2024 Formula 1 season and remained a regular points scorer and occasional podium finisher. The statistic alone is extraordinary. The context — that Alonso was competitive enough in his early forties to be considered among the better drivers on the grid — is remarkable.

Alonso's two World Championships came in 2005 and 2006 with Renault, when he became the youngest champion in the sport's history before Vettel broke that record. But it is his subsequent career — through seasons with McLaren, Ferrari, McLaren again, Alpine, and Aston Martin — that defines his legacy as the sport's most complete competitive animal.

The years from 2014 to 2021 with McLaren (twice) and then Alpine were characterised by machinery that could not match his talent. Alonso extracted results from midfield cars that his teammates could not approach, consistently demonstrating that a generational driver talent does not diminish simply because the car is slow.

His move to Aston Martin in 2023 reinvigorated his career for what felt like a final time. Third in Saudi Arabia in round two of the season, followed by a sequence of podiums and near-podiums, confirmed what his most devoted observers had always maintained: Alonso was still, at 41, among the five best drivers in the world. He simply hadn't had the equipment to prove it for a decade.`,
  },
  {
    title: "Oscar Piastri: The Australian Who Came From Nowhere to Challenge for the Title",
    tags: ["Driver Profile", "Oscar Piastri", "McLaren", "Rookie"],
    imageUrl: IMGS.helmet,
    content: `Oscar Piastri arrived in Formula 1 in 2023 without having driven a single lap in practice for a race weekend. His path from Alpine reserve driver — in the middle of one of the most confusing driver market controversies in recent years — to McLaren race driver to title challenger compressed more drama into 18 months than most careers manage across a decade.

The Australian won three successive junior championships — F3, F2, and then the FIA Formula 2 Championship — before the remarkable situation in which Alpine publicly announced him as their 2023 driver while he had already privately contracted to McLaren. The subsequent contract dispute was resolved in Piastri's favour, and he arrived at McLaren alongside Norris.

His 2023 debut was characterised by impressive pace and racecraft — a driver clearly ready for F1 — but constrained by the mid-season McLaren that had not yet unlocked its 2024 pace. His first victory came at the 2024 Azerbaijan Sprint race and was swiftly followed by race victories at Hungary and Azerbaijan.

What makes Piastri's trajectory unusual is his temperament. The Australian is one of the most calm and forensically precise drivers in the paddock — unshowy in his driving style, devastating in his race pace, and psychologically well-equipped for the pressure of championship competition. In 2026, McLaren faces the enviable and complex problem of managing two drivers who are both genuinely capable of winning the championship.`,
  },
  {
    title: "How the Undercut Works in F1: Formula One's Deadliest Strategic Weapon",
    tags: ["Strategy", "Undercut", "Pit Stop", "Explainer"],
    imageUrl: IMGS.pit,
    content: `The undercut is one of Formula 1's most powerful strategic tools — a sequence of events triggered by a pit stop that can transfer a race position in the space of two or three laps without the overtaking driver ever passing the car on track. Understanding how and why it works reveals the depth of strategic thinking that underpins every modern grand prix.

The undercut works as follows: Car A is running just ahead of Car B. Both cars are on worn tyres. Car B pits one lap before Car A and fits fresh tyres. On its out-lap, Car B can now lap significantly faster than Car A — which is still on degraded rubber. If Car B's out-lap gain is greater than the time spent in the pit lane, when Car A eventually pits, Car B will emerge ahead.

The key conditions required for a successful undercut are: a significant pace difference between fresh and worn tyres, a circuit where fresh tyres create a meaningful lap time advantage on the out-lap, and the team ahead not reacting with an immediate "cover" stop of their own.

Teams defend against the undercut by "covering" the stop — reacting immediately when they see a rival pit. This forces the undercut attacker to gain their time advantage purely from tyre pace difference, and if the ahead team reacts within one lap, the time in the pit lane often negates the advantage. The overcut — staying out and gaining track position as others pit onto cooler tyres — is the counter-strategy, and choosing between them correctly in real time separates the best strategists in the sport.`,
  },
  {
    title: "F1 Team Orders: Legal, Controversial, and Sometimes Necessary",
    tags: ["Strategy", "Team Orders", "Controversy", "Behind the Scenes"],
    imageUrl: IMGS.pit,
    content: `Team orders in Formula 1 — instructions from the team to a driver to modify their on-track behaviour for team benefit — are one of the sport's most persistently controversial topics. They were explicitly banned between 2002 and 2010, legalised again, and have since been the subject of some of the most heated debates in paddock history.

The most notorious example in the post-ban era is the 2013 Malaysian Grand Prix, where Sebastian Vettel ignored a team order from Red Bull to hold position behind Mark Webber and passed him to take the victory. Vettel's "Multi 21" incident — the code for him to hold position that he ignored — became one of the defining moments of that era.

Ferrari's "Fernando is faster than you" instruction to Felipe Massa at the 2010 German Grand Prix, directing Massa to move over for Alonso, cost Ferrari a fine and reinforced the view that team orders were effectively unenforceable if teams were creative with their language.

In 2024, McLaren's management of the Norris-Piastri relationship became a case study in modern team order philosophy. With both drivers competitive and the Constructors' Championship increasingly within reach, decisions about who to favour at specific rounds involved complex calculations around points gaps, form, and psychological impact on both drivers. There is no formula that makes these decisions easy — only the cold arithmetic of championship mathematics.`,
  },
  {
    title: "Spa-Francorchamps: F1's Greatest Lottery and Its Most Beautiful Challenge",
    tags: ["Circuits", "Spa", "Belgium", "F1 History"],
    imageUrl: IMGS.circuit,
    content: `Spa-Francorchamps in the Ardennes region of Belgium is simultaneously the most beloved and most unpredictable circuit on the Formula 1 calendar. Its combination of high-speed corners, dramatic elevation changes, and micro-weather that can produce monsoon conditions in one sector and dry racing in another make it a genuine test of everything Formula 1 demands.

The circuit's defining feature is Eau Rouge and Raidillon — the valley-and-climb sequence that leads from the bottom of the hill at La Source hairpin through a blind, high-speed left-right compression. At full qualifying speed with maximum downforce, a driver commits to the corners at over 280 km/h without being able to see where the road goes at the point of entry. It is the sport's ultimate act of trust in aerodynamic grip.

Weather at Spa is the circuit's greatest variable and drama generator. The circuit sits in a region where weather systems can produce dramatically different conditions between sectors separated by only a few kilometres. A full wet in Sector 1 can coincide with a dry racing surface in Sector 3, creating tyre choice decisions of extraordinary complexity.

Spa has hosted some of the sport's most significant moments. It was where Ayrton Senna was killed in testing in 1994 — no, that was Imola. Where Lewis Hamilton's 2008 race victory was stripped through controversial late penalty. Where Max Verstappen produced his 2021 overtake on Lewis Hamilton that was immediately flagged by the stewards. The circuit's history is inseparable from the sport's.`,
  },
  {
    title: "Suzuka Circuit: Why Japan's Figure-Eight Is Every Driver's Favourite",
    tags: ["Circuits", "Suzuka", "Japan", "Driver Favourite"],
    imageUrl: IMGS.circuit,
    content: `Suzuka International Racing Course in Mie Prefecture, Japan, is consistently cited by Formula 1 drivers as their favourite circuit on the calendar. Its combination of high-speed technical corners, the unique figure-eight layout where the track passes under itself, and the devotion of Japanese fans creates an experience unlike any other on the F1 calendar.

The circuit's defining section is the Esses — a sequence of seven high-speed direction changes immediately after the exit of Turn 1. At racing speeds, the Esses are taken in continuous flowing motion with barely a fraction of braking, demanding absolute commitment and a car that can change direction at the limit without unsettling. Getting a clean run through the Esses sets the tone for the rest of the lap.

Spoon Curve — the long, slow left-hander in the circuit's back section — and 130R — a 270-km/h right-hander that was once taken flat and now requires minimal lift — test different aspects of the car's aerodynamic platform and the driver's relationship with their car's underfloor loading.

Suzuka has decided championships multiple times. The 1989 and 1990 collisions between Ayrton Senna and Alain Prost on the first corner — each deciding the championship for the other in reverse years — are among the most replayed moments in F1 history. The circuit's layout, unchanged in its fundamental character since Honda built it in 1962, represents a connection to the sport's history that no modern purpose-built venue can replicate.`,
  },
  {
    title: "Silverstone: Britain's Home of Formula 1 Speed",
    tags: ["Circuits", "Silverstone", "British Grand Prix", "F1 History"],
    imageUrl: IMGS.circuit,
    content: `Silverstone Circuit in Northamptonshire hosted the very first round of the Formula 1 World Championship in 1950, and has remained one of the sport's most important venues ever since. Its combination of high-speed sweeping corners, the passionate British crowd, and its role as the home of the British motorsport industry make it a unique fixture on the calendar.

The circuit's character is defined by its fastest corners: Copse — a right-hander entered at over 270 km/h — Maggotts-Becketts, a sinuous sequence of direction changes taken at the absolute limit of aerodynamic grip where the car's body attitude reveals the balance of the car at a glance. These corners are where the genuinely fast drivers extend their lap time advantage over their competitors.

The British Grand Prix has produced some of the sport's most dramatic moments. Nigel Mansell's tyre failure in 1986 while leading. The Senna-Mansell battle of 1991. Lewis Hamilton's victory in 2008, before the complex race direction controversies of later years. Max Verstappen's dominant wins from the front. And the 2022 race where Carlos Sainz took his first Formula 1 victory.

Silverstone's position at the heart of Britain's motorsport valley — the corridor of aerospace and automotive engineering firms concentrated around the Northamptonshire-Oxfordshire border — means it exists in a broader context. The factory of virtually every team on the grid is within two hours of the circuit.`,
  },
  {
    title: "Singapore Grand Prix: Formula 1 at Night Under the City Lights",
    tags: ["Circuits", "Singapore", "Night Race", "Street Circuit"],
    imageUrl: IMGS.circuit,
    content: `The Singapore Grand Prix, held on the Marina Bay Street Circuit, was Formula 1's first night race when it debuted in 2008. The combination of racing on illuminated public streets — over 1,500 lights installed around the 5.06-kilometre circuit — with temperatures exceeding 30°C and humidity approaching 80% creates one of the sport's most visually spectacular and physically demanding events.

The circuit demands a maximum-downforce configuration due to its slow and technical nature. With an average race speed well below the fastest circuits on the calendar, Marina Bay is the anti-Monza — every point of aerodynamic grip is required to navigate the wall-lined corners with sufficient speed. Setup decisions made at Singapore cannot be compared to any other round.

Heat and humidity make Singapore one of the most physically gruelling events of the season. Drivers lose significant body weight through dehydration over the race distance, and managing physical performance across the two-hour event requires specific preparation. Some drivers have historically struggled with the physical demands in a way that doesn't affect them at cooler venues.

Red Bull's dominance of the Singapore Grand Prix in the Verstappen era became one of the defining sub-stories of the sport's recent history. The characteristics of the circuit — reward for mechanical grip, heavy reliance on tyre preparation — matched the Red Bull's strengths. McLaren's ability to break that pattern in 2024 was one of the season's most significant shifts.`,
  },
  {
    title: "The 2021 F1 Championship: The Most Controversial Title Fight in History",
    tags: ["F1 History", "2021 Season", "Verstappen", "Hamilton", "Championship"],
    imageUrl: IMGS.podium,
    content: `The 2021 Formula 1 World Championship between Lewis Hamilton and Max Verstappen produced the most dramatic, most controversial, and most watched finale in the sport's history. The season-long battle — featuring seven lead changes in the standings, multiple on-track collisions, and a final-lap restart that decided the championship — became the defining narrative of modern F1.

The season's flashpoints began early. Bahrain's opening round, where Verstappen ran Hamilton wide at Turn 4, set the tone for a campaign in which the two drivers pushed the limits of acceptable racing to a degree that required the stewards to be called multiple times. The collision at Copse Corner at Silverstone — which sent Verstappen into the barriers at high speed — was one of the season's defining incidents and generated the largest penalty Verstappen had received.

The Monza Sprint weekend produced the most dramatic contact when Verstappen's Red Bull landed on top of Hamilton's Mercedes after a pit stop collision. Both retired. The championship, paused by the halo-protected cockpit on both cars, continued.

Abu Dhabi's finale — with both drivers level on points — was decided by the safety car procedures that allowed the final-lap restart. Verstappen, on fresh soft tyres, passed Hamilton on the final lap. The FIA investigation acknowledged procedural errors and the Race Director departed the sport, but the championship result stood. F1 had never seen anything like it.`,
  },
  {
    title: "Senna vs Prost: Formula 1's Greatest Rivalry Explained",
    tags: ["F1 History", "Ayrton Senna", "Alain Prost", "Greatest Rivalry"],
    imageUrl: IMGS.podium,
    content: `The rivalry between Ayrton Senna and Alain Prost between 1988 and 1993 is the standard against which every subsequent Formula 1 rivalry has been measured. No two drivers so closely matched in ability, so fundamentally different in character, and so directly in competition for extended periods have produced a story quite like it.

They were teammates at McLaren-Honda for two seasons — 1988 and 1989 — in what remains the most statistically dominant team in Formula 1 history. The McLaren won 15 of 16 races in 1988. The battle for the 1989 championship — which concluded with deliberate contact at the Suzuka chicane, Senna disqualified, and Prost taking the title — ended their partnership in conditions of open hostility.

The 1990 finale at Suzuka was Senna's revenge: he aimed his car at Prost's Ferrari at the first corner and both retired. Senna had already calculated that it was his only guaranteed route to the championship. The act was shocking. The motivation was coldly rational. Both things were true simultaneously.

Their relationship — never warm even in their early McLaren seasons — generated the sport's greatest racing through pure competitive hatred. Prost was methodical, strategic, and precise. Senna was feverish, intuitive, and transcendent. Each brought out the maximum in the other. Formula 1 has never had a rivalry quite like it because it has never again had two drivers of comparable ability so directly opposed at the same moment.`,
  },
  {
    title: "McLaren's Renaissance: How a Fallen Giant Returned to the Front of F1",
    tags: ["Teams", "McLaren", "Team History", "Championship Contender"],
    imageUrl: IMGS.car,
    content: `McLaren's journey from Formula 1 also-ran back to championship contender is one of the sport's most instructive stories about how a historic team can rebuild after a sustained period of failure — and how the right technical and commercial decisions, compounded over several years, can restore a team to the front.

The fall was dramatic. After the Honda partnership ended disastrously in 2018 — a power unit so uncompetitive that Fernando Alonso famously called it a "GP2 engine" on team radio — McLaren went through a period of leadership change, commercial uncertainty, and on-track results that bore no relation to the team's historical standing.

The recovery began with structural decisions: a change in technical leadership, investment from a new shareholder group that included Michael Dell and the Bahrain sovereign wealth fund, and a factory upgrade that brought manufacturing capabilities closer to those of the top teams. The move from Renault to Mercedes power units in 2021 provided a competitive power unit baseline.

On track, the turnaround was visible through 2022 and 2023 as the car developed into a consistent top-five competitor. The 2024 MCL38 was, in the final months of the season, arguably the fastest car on the grid. Norris's championship challenge fell just short, but McLaren's Constructors' Championship was secured — the team's first since 1998. The rebuild was complete.`,
  },
  {
    title: "Red Bull Racing's Dominance Explained: How Adrian Newey Built the Fastest Car",
    tags: ["Teams", "Red Bull", "Adrian Newey", "Dominance"],
    imageUrl: IMGS.car,
    content: `Red Bull Racing's transformation from 2005 new entry to the sport's most successful team of the hybrid era is the story of one of the most effective partnerships between a visionary technical director and an elite racing driver in the sport's history. Understanding how that dominance was built reveals much about what it takes to win in Formula 1.

Adrian Newey joined Red Bull from McLaren in 2006 and immediately began applying his philosophy: cars that were aerodynamically purer, with mechanical packaging decisions driven by aerodynamic requirements rather than the other way around. The RB5 in 2009 introduced principles that would define Red Bull's approach for the following decade.

The four consecutive championships from 2010 to 2013 — Sebastian Vettel and Red Bull dominating despite the Brawn GP and McLaren challenges — were followed by the difficult Mercedes hybrid era years, during which Newey's genius was constrained by the power unit deficit. The 2021-2024 period with Verstappen brought a second era of dominance built on ground-effect aerodynamics that aligned perfectly with the regulations.

Newey's departure from Red Bull in 2024 — announced in advance with a lengthy transition period — posed the question of whether the team's performance advantage was structural or dependent on one man. The 2025 season began providing answers. Adrian Newey's decision to join Aston Martin immediately made them one of the sport's most-watched teams for 2026.`,
  },
  {
    title: "The F1 Pit Stop: How Teams Got From 60 Seconds to Under Two",
    tags: ["Technical", "Pit Stop", "History", "Behind the Scenes"],
    imageUrl: IMGS.pit,
    content: `The Formula 1 pit stop has been transformed from a routine service operation lasting over a minute into a ballet of choreographed precision taking under two seconds. Understanding how that transformation happened — and the engineering and human factors that enable the modern pit stop — reveals one of the sport's most impressive operational achievements.

In the 1950s and 1960s, pit stops were rarely planned events and were instead emergency interventions: tyres had to be changed by hand with rudimentary equipment, fuel was added from cans, and mechanics did whatever was needed to get the car back out. A stop lasting three or four minutes was not unusual. Drivers helped in the process.

The introduction of refuelling in the early 1980s and then its standardisation from 1994 to 2009 changed the dynamic. Teams invested in faster refuelling rigs, precision wheel gun development, and training regimes for pit crew members. The modern pit crew developed as a professional specialism.

Since refuelling was banned in 2010, the focus has been entirely on wheel change speed. The current record stands at under two seconds — set by teams who have invested in motorised wheel guns, pneumatic wheelnut systems, and training that treats a pit stop as a sporting performance in its own right. The 20-member coordinated team includes lollipop operators, front and rear jack operators, four wheel crews, and supervisors monitoring from multiple camera angles.`,
  },
  {
    title: "F1 Radio: What Drivers and Engineers Really Say to Each Other",
    tags: ["Behind the Scenes", "Radio", "Driver Communication", "Explainer"],
    imageUrl: IMGS.cockpit,
    content: `The radio transmissions broadcast during Formula 1 races give fans a partial window into the real-time conversation between driver and team — but only a partial one. The full picture of what is communicated, at what frequency, and with what emotional intensity would give a substantially more complete picture of what a grand prix actually involves.

During a typical lap, a driver may receive information about the following car's gap, tyre temperature readings, brake bias recommendations, ERS deployment targets, weather updates, and tactical information about rival pit stop timing. The volume of information is carefully managed: too much data creates cognitive overload in a driver already processing sensory information at the physical limit.

The language of F1 radio communication has its own vocabulary. "Box, box, box" signals a pit stop. "ERS mode 3" or similar instructions relate to power unit deployment. "The car ahead is struggling" provides context without explicit team order language. Teams have become expert at communicating tactical information while remaining technically within the regulations on permitted driver aids.

The emotional dimension of team radio is the most compelling. Drivers experiencing frustration, joy, or mechanical failure reveal something genuine in the transmissions. Hamilton's exchanges with his pit wall across championship seasons, Verstappen's crisp precision, and the occasional miscommunication between driver and engineer that costs positions — all of it makes radio one of Formula 1's most humanising elements.`,
  },
  {
    title: "Parc Fermé in F1: The Rule That Locks In Every Setup Decision",
    tags: ["Regulations", "Parc Fermé", "Rules", "Explainer"],
    imageUrl: IMGS.car,
    content: `Parc fermé is the period in a Formula 1 weekend during which teams are prohibited from making significant changes to their car's setup between qualifying and the race. The rule exists to prevent teams from running a qualifying-specific setup — optimised purely for a single fast lap — and then making extensive changes for the race. It is one of the regulations with the most direct strategic implications for how teams approach the qualifying-to-race transition.

Parc fermé conditions begin when the car leaves the garage for its qualifying lap attempt and end after the race. During this period, teams can make only minor permitted adjustments: tyre changes, brake pad replacement, gearbox and clutch adjustments under specific circumstances, and safety-related modifications. Fundamental aerodynamic or suspension changes are not permitted.

The practical consequence is that any setup decision made in qualifying must work across both sessions. A team that qualifies on a very aggressive setup — low ride height, maximum downforce — cannot raise the car for a race configuration that might be better for tyre preservation. The setup chosen is the setup raced.

Weather changes between qualifying and race day add another layer of complexity. A dry setup chosen in Saturday sunshine that faces a wet Sunday race creates specific challenges that teams must manage without the option of fundamental reconfiguration. The regulation has produced some of F1's most dramatic strategy variations as teams try to find setups that work across the full weekend window.`,
  },
  {
    title: "Flag Signals in Formula 1: What Every Colour Means at Racing Speed",
    tags: ["Regulations", "Flags", "Rules", "Explainer"],
    imageUrl: IMGS.track,
    content: `Flag signals have been part of motorsport communication since before Formula 1 existed. In the modern era, most flag information is also communicated to drivers via dashboard light panels and radio, but understanding the flag system remains fundamental to following a race and understanding the decisions drivers and officials are making in real time.

The yellow flag — one or two waved — signals danger ahead and prohibits overtaking in that sector. A double-waved yellow requires drivers to slow significantly and be prepared to stop. The sector-specific nature of yellow flags is critical: a yellow in Sector 2 does not affect racing in Sectors 1 or 3. Getting a yellow wrong — overtaking in a yellow zone — carries time penalties and potential disqualification.

The red flag stops the race. All cars must slow and return to the pit lane or grid in a controlled manner without racing. Races can be red flagged for safety reasons, severe accidents, or deteriorating conditions. Under the current regulations, the race is usually restarted, with the results at the point of the red flag determining the restart order.

The blue flag — shown to a driver being lapped by the race leader — signals that they must let the faster car through within three blue flags or face a time penalty. The administration of blue flags has occasionally been contentious, particularly when a driver fighting in their own battle must yield to preserve their position without losing significant time.`,
  },
  {
    title: "F1 2026 Power Unit Regulations: The Biggest Engine Change in a Decade",
    tags: ["2026 Regulations", "Power Unit", "Technical", "Future of F1"],
    imageUrl: IMGS.tech,
    content: `The 2026 Formula 1 regulations introduced the most significant power unit change since the hybrid era began in 2014. The new rules eliminate the MGU-H (Motor Generator Unit — Heat) — one of the most technically complex and expensive elements of the previous generation — and dramatically increase the proportion of electrical power in the overall power output.

Under the 2026 regulations, the MGU-K's deployment limit — previously 120kW — is effectively removed, with electrical deployment now representing approximately 50% of total power output, up from around 17% under the previous regulations. This means the electrical component of the power unit goes from being a supplement to being half the story of performance.

The elimination of the MGU-H makes the regulations more accessible to new manufacturers. The MGU-H was a primary reason why potential new power unit suppliers had been deterred from entering the sport — its development cost and complexity represented a near-impossible barrier. With it gone, Audi committed to entering as a power unit manufacturer for 2026, marking a significant expansion of the grid's technical suppliers.

The increased electrical deployment creates new strategic dimensions. Drivers can now deploy substantially more electrical power tactically — using it to attack, defend, or preserve the battery for critical moments. The thermal management of the larger battery pack becomes a primary engineering challenge, and power unit deployment software becomes even more central to lap time advantage than it was in the previous era.`,
  },
  {
    title: "How F1 Night Races Changed the Sport: From Singapore to Las Vegas",
    tags: ["Night Racing", "Singapore", "Las Vegas", "F1 Calendar"],
    imageUrl: IMGS.circuit,
    content: `Formula 1's first night race — Singapore in 2008 — created a template for a new category of spectacle that has since been replicated at venues across the globe. The combination of artificial illumination, dramatic visual spectacle, and the time zone advantage for European viewers created a new commercial and entertainment logic for F1 events.

The engineering requirement for a night race is substantial. Marina Bay's installation of over 1,500 floodlights was a pioneer project that required significant investment from Singapore's government and host organisation. The lighting standard must meet television broadcasting requirements — the cameras must be able to capture the action without the motion blur or colour distortion that inadequate lighting creates.

Las Vegas, which joined the calendar in 2023, took the concept to its logical extreme. Racing on the famous Strip — with the casinos, hotels, and neon of one of the world's most recognisable entertainment districts as the backdrop — created the most ambitious street circuit debut in F1 history. The logistics of closing Las Vegas's main street for a week, combined with the heat and the sheer scale of the event, produced an event unlike any other.

The business case for night racing is compelling: European audiences receive races in prime evening viewing hours rather than early morning, dramatically improving TV ratings for the sport's most commercially valuable market. The trade-off — extreme heat and humidity in Singapore, freezing November temperatures in Las Vegas — is managed through specific driver and team preparation that makes these events distinct in the calendar.`,
  },
  {
    title: "The Overcut in F1: When Staying Out Is the Winning Move",
    tags: ["Strategy", "Overcut", "Pit Stop", "Explainer"],
    imageUrl: IMGS.pit,
    content: `While the undercut — pitting early to gain fresh-tyre pace advantage — is the better-known strategic weapon, the overcut is equally powerful in specific circumstances and often catches teams off guard. Understanding when the overcut works, and why, reveals the depth of thinking that separates the best strategy departments in Formula 1.

The overcut occurs when a driver stays out while rivals pit, and the fresh-tyre cars' pace advantage is insufficient to overcome the time lost in the pit lane. On a circuit where tyres degrade slowly and the out-lap penalty for pitting is high, staying out and banking track position can be more effective than pitting for fresh rubber.

The classic overcut scenario involves tyre compounds that warm up slowly. If a driver on worn but still functional tyres stays out while a rival pits for fresh mediums that take three or four laps to reach optimal temperature, the car still on track may well maintain their position or even extend their gap during the slow-warm laps of the pursuing car.

Weather interruptions make overcut decisions particularly complex. A safety car period after a rival has pitted — allowing the overcut car to make their stop without giving up track time — can transform a marginal overcut into a decisive strategic win. Teams monitoring weather radar and incident probabilities factor this into their staying-out decisions constantly.`,
  },
  {
    title: "How F1 Manages Weather: From Radar Feeds to Tyre Decisions in Seconds",
    tags: ["Strategy", "Weather", "Technical", "Behind the Scenes"],
    imageUrl: IMGS.track,
    content: `Weather management in Formula 1 has evolved from a simple "it's raining, fit wets" decision into a sophisticated data operation involving dedicated meteorologists, real-time radar feeds, micro-climate modelling, and decision trees developed in the weeks before each race.

Every major team employs a dedicated weather expert or contracts a specialist meteorology service. This expert provides real-time radar interpretation during the race weekend, giving the strategy team probability percentages for precipitation onset, its likely duration, and the difference in conditions between different sectors of the circuit.

The tyre decision at the onset of rain is one of the most consequential calls in motorsport. Switching too early to intermediates on a track that isn't wet enough means the compound overheats and gives up performance. Staying on slicks too long risks aquaplaning, a driver going off, or losing time on every lap to cars that have already switched.

Teams use car-mounted sensors to track track surface temperature and water film depth in real time, transmitting the data to the pit wall where it is compared against the tyre manufacturer's compound activation threshold data. The margin between the right call and a catastrophically wrong one is often measured in one or two laps — and the teams who get it right consistently are the ones who win championships in variable-weather seasons.`,
  },
  {
    title: "Max Verstappen's 2023 Season: Is It the Greatest Individual Campaign in F1 History?",
    tags: ["Max Verstappen", "2023 Season", "Records", "Championship"],
    imageUrl: IMGS.podium,
    content: `Max Verstappen's 2023 Formula 1 season is, by every statistical measure, one of the most dominant individual championship campaigns in the sport's history. Nineteen victories from 22 races. A points total of 575. The first driver to win more than half the rounds in a single season since Michael Schumacher's similarly dominant years. The debate about where 2023 ranks in the historical pantheon is legitimate and unresolved.

Verstappen won ten consecutive races between the Dutch Grand Prix and the Qatar Grand Prix — a sequence that stretched from late August through November and covered multiple types of circuit and strategic challenge. The streak equalled Schumacher's 2013 record and underscored that his Red Bull was as mechanically reliable as it was fast.

The statistical comparison with previous dominant seasons is instructive. Schumacher won 13 from 18 in 2004. Vettel won 13 from 20 in 2011. Verstappen's 19 from 22 in 2023 surpasses both in absolute terms and in winning percentage. The quality of opposition — with McLaren, Ferrari, Mercedes, and Aston Martin all producing competitive race cars at various points — makes the margin more impressive, not less.

Whether 2023 represents Verstappen's greatest achievement or whether the Red Bull's mechanical and aerodynamic superiority makes it difficult to separate driver from car is the crux of the debate. What is not debatable is that Verstappen did not make a single error that cost him a race victory across the entire season — a standard of consistency that is, by itself, a definitive marker of excellence.`,
  },
  {
    title: "How F1 Drivers Train: The Physical Demands of Racing at 350 km/h",
    tags: ["Drivers", "Training", "Fitness", "Physical Preparation"],
    imageUrl: IMGS.driver,
    content: `Formula 1 drivers are among the most physically conditioned athletes in professional sport, and the demands that racing at the limit of a modern F1 car places on the human body require a level of physical preparation that belies the common perception of motorsport as a sedentary activity.

The primary physical challenge is the neck. Under braking and in high-speed cornering, an F1 driver experiences sustained forces of 4-5G. With a helmet weighing approximately 7 kilograms, the effective weight through the neck musculature during a 5G braking event is 35 kilograms. Sustaining this load repeatedly across a race distance of over 50 laps requires specific and extreme neck conditioning that forms a central part of every F1 driver's training programme.

Core strength and cardiovascular fitness are equally critical. The vibration and heat inside an F1 cockpit — temperatures can exceed 50°C around the driver's feet — creates constant physiological stress. Heart rates during races regularly reach 160-170 beats per minute and remain elevated for two hours. Body weight can drop by two to three kilograms through sweat loss across a race distance.

Mental conditioning — the ability to maintain total concentration across 90-120 minutes while processing sensory information at extreme speed — is the least visible but equally demanding component. Teams employ sports psychologists as permanent members of the driver support group. The ability to enter a near-meditative state of focused attention under physical stress is a genuine skill that separates elite drivers from merely fast ones.`,
  },
  {
    title: "The FIA: Who Actually Runs Formula 1 and How Do They Do It?",
    tags: ["Regulations", "FIA", "Governance", "Explainer"],
    imageUrl: IMGS.data,
    content: `The Fédération Internationale de l'Automobile — the FIA — is the governing body of Formula 1 and most major motorsport categories worldwide. Understanding the FIA's role, how it relates to Formula 1's commercial rights holder, and how the regulations it produces are enforced provides an essential context for following the sport's ongoing storylines.

The FIA writes and enforces the sporting and technical regulations that govern F1. The sporting regulations define race procedures, driver behaviour, points systems, and flag signals. The technical regulations define what cars are permitted to be — dimensions, weight, aerodynamic rules, power unit specifications. Teams employ dedicated regulations experts whose job is to find every permissible interpretation of these documents that might provide a competitive advantage.

The relationship between the FIA and Formula 1 Group — which holds the commercial rights to the championship — is a joint agreement. The FIA has sole authority over sporting decisions: safety car deployment, steward decisions, race results, and technical compliance. Formula One Group manages broadcasting, sponsorship, prize money distribution, and the commercial calendar.

The stewards — typically four per race, including one from the FIA's nominated pool and one with recent F1 driving experience — adjudicate on-track incidents reported to them by the race director. Their decisions can be appealed. The process of steward selection, the criteria applied to incident assessment, and the consistency of penalty application have been persistent sources of controversy across the sport's history.`,
  },
  {
    title: "Formula 1 Engines by the Numbers: Displacement, Revs and Power Across the Decades",
    tags: ["Technical", "Engines", "History", "Power Units"],
    imageUrl: IMGS.tech,
    content: `The Formula 1 engine has changed so dramatically across the sport's 75-year history that comparing a 1950 Grand Prix car's power unit to a 2026 hybrid system requires acknowledging they are fundamentally different technologies that happen to share the same purpose.

The 1950 Formula 1 cars used naturally aspirated engines producing 350-500 horsepower from displacements of 1.5 to 4.5 litres depending on whether the car was supercharged or aspirated. The power outputs were modest by modern standards but the cars were also a fraction of the weight. The physics of power-to-weight ratio meant that 1950s cars could still achieve impressive speeds on the shorter straights of period circuits.

The 1980s turbo era changed the equation entirely. With 1.5-litre turbocharged engines producing estimated 1,400-plus horsepower in qualifying trim on special fuel, the power outputs were not exceeded until the current hybrid era at full deployment. The fragility of these units, and the fuel they consumed, made them strategically complex in ways that pre-figured modern hybrid management.

The current 2026 power units represent the pinnacle of internal combustion efficiency combined with electrical deployment. Producing approximately 1,000 horsepower from a 1.6-litre V6 while recovering energy that would otherwise be lost as heat, and doing so with 50% thermal efficiency versus the 25-30% of a standard road car, these units are engineering achievements that go far beyond their racing application.`,
  },
  {
    title: "Bahrain Grand Prix: Where F1's Modern Calendar Was Born",
    tags: ["Circuits", "Bahrain", "Middle East", "Season Opener"],
    imageUrl: IMGS.circuit,
    content: `The Bahrain International Circuit, which hosted its first Formula 1 Grand Prix in 2004, was the race that opened the sport's expansion into the Middle East and North Africa — a strategic shift that reshaped the calendar and the commercial geography of the championship. Two decades later, Bahrain typically opens the season and has become one of F1's most significant venues.

The circuit itself offers something unusual on the F1 calendar: a floodlit desert environment where the track evolves dramatically across a race weekend. The Bahrain surface, initially dusty and low-grip at the start of each event, develops a rubber layer through practice and qualifying that transforms its character by race day. Teams plan for this evolution in their setup choices.

The circuit's alternative layout — an outer circuit used for testing — has played a significant role in the sport's calendar, particularly during the COVID-19 period when Bahrain hosted multiple rounds due to its infrastructure and the Bahraini government's willingness to host. The 2020 Bahrain Grand Prix — where Romain Grosjean's crash at Lap 1 produced the most dramatic fireball the sport had seen in decades — is the event most associated with the venue.

Bahrain's strategic importance to F1 goes beyond the race itself. The Bahrain International Circuit is the location for pre-season testing, typically the only opportunity all teams have to run their new cars together on the same surface before the season begins. The three days of testing at Bahrain set the narrative for the opening races.`,
  },
  {
    title: "George Russell: The Driver Mercedes Built From the Ground Up",
    tags: ["Driver Profile", "George Russell", "Mercedes", "Young Talent"],
    imageUrl: IMGS.helmet,
    content: `George Russell's career pathway represents the modern Formula 1 driver development programme taken to its logical conclusion. Identified by Mercedes at the junior level, supported through the junior categories by the Mercedes Driver Academy, and placed with Williams for three seasons of F1 experience before being promoted to the senior team, Russell's story is a case study in how elite teams develop their talent pipeline.

The Williams years — 2019 through 2021 — were a study in making the most of an uncompetitive situation. Russell finished every race he started in 2020 and 2021, a record of race completion that demonstrated his racecraft and his ability to extract maximum points from machinery that was regularly among the slowest on the grid.

His substitution for Lewis Hamilton at the 2020 Sakhir Grand Prix — where Hamilton had tested positive for COVID-19 — provided the defining proof of his readiness. Starting from pole position in Mercedes machinery, he led comfortably before a disastrous pit stop and a puncture denied him what would have been a comprehensive victory on debut. The performance was enough to accelerate his move to the senior team.

At Mercedes since 2022, Russell has been consistently fast and technically sophisticated — a driver who understands every aspect of the car and communicates it with extraordinary clarity. His relationship with the engineers is arguably his greatest asset. The question that has accompanied his Mercedes tenure — whether the car's occasional lack of pace prevents a full assessment of his championship-winning potential — remains live as the 2026 regulations bed in.`,
  },
  {
    title: "F1's Biggest Crashes and What They Taught Us About Safety",
    tags: ["Safety", "F1 History", "Crashes", "Engineering"],
    imageUrl: IMGS.car,
    content: `The history of Formula 1 safety is written, unavoidably, in the crashes that prompted the most significant improvements. Understanding how specific incidents — and the deaths and injuries they caused — directly led to regulatory and engineering changes is the most honest way to appreciate how the sport became as safe as it is.

The deaths of Roland Ratzenberger and Ayrton Senna at Imola in 1994 — occurring on consecutive days and witnessed by global television audiences — prompted the most comprehensive safety review in the sport's history. The FIA's response was immediate and far-reaching: gravel traps replaced by asphalt run-off, circuit barriers reviewed, cockpit protection standards raised, and the establishment of a Medical Car and circuit medical infrastructure requirements.

The introduction of the HANS device (Head and Neck Support) in 2003, following the deaths of Senna and several American racing drivers in similar incidents, addressed the specific mechanism of head-whip injury that had caused fatalities in frontal impact accidents. Its mandatory introduction significantly reduced the risk from one of the most common crash scenarios.

The 2020 Bahrain crash — Romain Grosjean's car splitting in two, the fuel catching fire, and the driver escaping through the flames in approximately 28 seconds — was the most dramatic real-world test of modern F1 safety in the hybrid era. Every safety feature worked: the survival cell absorbed the impact, the halo deflected the barrier, the fire extinguishing systems activated, and the medical response arrived within seconds. The sport's safety framework has earned its credibility.`,
  },
  {
    title: "Formula 2 and Formula 3: The Ladder That Feeds Formula 1",
    tags: ["Junior Formulas", "F2", "F3", "Driver Development"],
    imageUrl: IMGS.car,
    content: `The path to Formula 1 runs, in the current era, almost exclusively through the FIA-sanctioned junior series: Formula 4, Formula 3, and Formula 2. Understanding these categories — what they test, how they are structured, and why the championship results matter so much — provides context for how the F1 grid of the future is being assembled.

Formula 3 is where drivers first race in single-seater cars close to the specifications of junior F1 machinery. The championship runs as a support series at selected F1 weekends, giving promising drivers their first exposure to grand prix circuits at the highest level. Performance here — particularly the ability to learn new circuits quickly and manage strategy — is closely watched by F1 team manager departments.

Formula 2 is the final stepping stone. The cars are substantially more powerful, the series runs at all F1 weekends, and the level of competition is intense — nearly every driver in F2 has ambitions of reaching F1 and many are already contracted to a team's driver development programme. The FIA Formula 2 Champion receives an automatic FIA Superlicence, the licence required to race in F1.

The recent history of F2 champions shows the pipeline working: Charles Leclerc (2017), George Russell (2018), Nicholas Latifi (2019), Mick Schumacher (2020), Oscar Piastri (2021), Felipe Drugovich (2022), Théo Pourchaire (2023). Not all champions reach F1 immediately — Drugovich and Pourchaire had to wait — but the path is the most direct route the sport has. When a driver wins F2, the F1 paddock pays very close attention.`,
  },
  {
    title: "How F1 Cars Are Weighed: The Role of the Minimum Weight Limit",
    tags: ["Technical", "Regulations", "Weight", "Explainer"],
    imageUrl: IMGS.tech,
    content: `Formula 1 has operated with a minimum weight limit throughout its history — the principle being that cars cannot be lightened below a specified threshold in the pursuit of outright performance. Understanding how this limit works, how teams manage weight, and why ballast strategy is genuinely important reveals another hidden layer of technical sophistication.

The minimum weight is specified for the car without fuel but with the driver on board, including the driver's racing equipment. For 2026, the minimum is set at 800 kilograms. This figure incorporates both the car's own weight and the driver — meaning lighter drivers provide teams with more flexibility in how they distribute the remaining weight as ballast.

Ballast — deliberately added weight — serves two purposes. First, it allows teams to reach the minimum weight when their car is naturally under the limit (building a car lighter than the minimum creates ballast space that can be placed for aerodynamic benefit). Second, it allows teams to fine-tune the weight distribution between front and rear axles, which affects handling balance.

Teams that build particularly heavy cars — either through design choices or the inherent weight of new regulations-mandated components — spend considerable development resource on weight saving. Carbon fibre components, titanium fasteners, and the elimination of any non-essential material are constant engineering priorities. A single kilogram saved in the car is worth approximately 35-40 milliseconds per lap at a typical circuit.`,
  },
];

function buildRssArticles(headlines: string[], recentTitles: string[]): Array<{title: string; excerpt: string; content: string; tags: string[]; imageUrl: string | null; sortOrder: number}> {
  const f1Keywords: Record<string, { tags: string[]; imageUrl: string }> = {
    verstappen: { tags: ["Max Verstappen", "Red Bull", "Championship"], imageUrl: IMGS.helmet },
    norris: { tags: ["Lando Norris", "McLaren", "Championship"], imageUrl: IMGS.helmet },
    leclerc: { tags: ["Charles Leclerc", "Ferrari", "Championship"], imageUrl: IMGS.helmet },
    hamilton: { tags: ["Lewis Hamilton", "Mercedes", "F1 Legend"], imageUrl: IMGS.helmet },
    piastri: { tags: ["Oscar Piastri", "McLaren", "Championship"], imageUrl: IMGS.helmet },
    russell: { tags: ["George Russell", "Mercedes"], imageUrl: IMGS.helmet },
    alonso: { tags: ["Fernando Alonso", "F1 Legend"], imageUrl: IMGS.helmet },
    ferrari: { tags: ["Ferrari", "Teams", "2026 Season"], imageUrl: IMGS.car },
    mclaren: { tags: ["McLaren", "Teams", "2026 Season"], imageUrl: IMGS.car },
    "red bull": { tags: ["Red Bull", "Teams", "2026 Season"], imageUrl: IMGS.car },
    mercedes: { tags: ["Mercedes", "Teams", "2026 Season"], imageUrl: IMGS.car },
    aston: { tags: ["Aston Martin", "Adrian Newey", "2026 Season"], imageUrl: IMGS.car },
    tyre: { tags: ["Tyres", "Strategy", "Technical"], imageUrl: IMGS.tyre },
    tire: { tags: ["Tyres", "Strategy", "Technical"], imageUrl: IMGS.tyre },
    strategy: { tags: ["Strategy", "Race Analysis", "2026 Season"], imageUrl: IMGS.pit },
    crash: { tags: ["Safety", "Incident", "F1 News"], imageUrl: IMGS.car },
    penalty: { tags: ["Stewards", "Regulations", "F1 News"], imageUrl: IMGS.data },
    championship: { tags: ["Championship", "Standings", "2026 Season"], imageUrl: IMGS.podium },
    qualifying: { tags: ["Qualifying", "Grid", "2026 Season"], imageUrl: IMGS.track },
    race: { tags: ["Race Report", "2026 Season", "F1 News"], imageUrl: IMGS.track },
    "grand prix": { tags: ["Grand Prix", "Race Report", "2026 Season"], imageUrl: IMGS.circuit },
    contract: { tags: ["Driver Market", "Paddock", "F1 News"], imageUrl: IMGS.pit },
    regulation: { tags: ["Regulations", "Technical", "FIA"], imageUrl: IMGS.data },
    engine: { tags: ["Power Unit", "Technical", "Engineering"], imageUrl: IMGS.tech },
    power: { tags: ["Power Unit", "Technical", "Engineering"], imageUrl: IMGS.tech },
    aero: { tags: ["Aerodynamics", "Technical", "Development"], imageUrl: IMGS.aero },
    wing: { tags: ["Aerodynamics", "Technical", "Development"], imageUrl: IMGS.aero },
    sprint: { tags: ["Sprint Race", "Format", "2026 Season"], imageUrl: IMGS.speed },
    test: { tags: ["Testing", "Development", "Pre-Season"], imageUrl: IMGS.car },
  };

  const results: Array<{title: string; excerpt: string; content: string; tags: string[]; imageUrl: string | null; sortOrder: number}> = [];

  for (const headline of headlines) {
    if (!headline || headline.length < 10) continue;
    const headlineLow = headline.toLowerCase();

    if (alreadyCovered(recentTitles, `F1 Paddock Briefing: ${headline}`)) continue;
    if (alreadyCovered(recentTitles, headline)) continue;

    let tags = ["F1 News", "Paddock", "2026 Season"];
    let imageUrl: string = IMGS.track;

    for (const [kw, meta] of Object.entries(f1Keywords)) {
      if (headlineLow.includes(kw)) {
        tags = meta.tags;
        imageUrl = meta.imageUrl;
        break;
      }
    }

    const title = `F1 Paddock Briefing: ${headline.replace(/^Formula\s+1\s*/i, "").replace(/^F1\s*/i, "").trim()}`;
    const excerpt = `The latest from the Formula 1 paddock as teams and drivers react to the developing story: ${headline}. Here is what we know and what it means for the championship.`;

    const content = `## The Story\n\n${headline} — this is the latest development from the Formula 1 paddock that is generating significant discussion among teams, drivers, and analysts ahead of the next round of the 2026 World Championship.\n\n## Why It Matters\n\nEvery development in Formula 1 carries downstream consequences. Whether this involves technical regulations, team personnel, or on-track performance, the ripple effects through the paddock are felt in setup decisions, strategy choices, and the psychological dynamics between teams fighting for championship position.\n\nThe 2026 season has already produced an extraordinary level of competition at the front of the field, and any factor that shifts the balance between the leading teams — even marginally — demands attention. Teams running complex aerodynamic and power unit packages have minimal margin for disruption.\n\n## Championship Context\n\nWith the Drivers' and Constructors' Championships both genuinely contested between multiple teams in 2026, each piece of news must be assessed through the lens of its impact on title mathematics. The teams monitoring this story most closely are those whose championship ambitions depend on every point, every regulatory interpretation, and every paddock development that their rivals must respond to.\n\n## What Happens Next\n\nWe will continue to monitor this story across the race weekend and bring you the latest analysis, reaction, and implications as they develop. F1 Fan Hub covers every aspect of the 2026 championship as it unfolds.`;

    results.push({ title, excerpt, content, tags, imageUrl, sortOrder: 1 });
    if (results.length >= 3) break;
  }

  return results;
}

export async function generateAndPublishBatch(count: number = MAX_PER_DAY): Promise<{
  success: boolean;
  submitted: string[];
  publishedArticles: Array<{ title: string; slug: string }>;
  skipped: number;
  noContent: boolean;
  message?: string;
}> {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const [published, pending] = await Promise.all([
      storage.getArticles(),
      storage.getPendingArticles(),
    ]);
    const allArticles = [...published, ...pending];

    const todayAutoArticles = allArticles.filter((a: any) => {
      const dateField = a.publishedAt || a.createdAt;
      const date = dateField ? new Date(dateField).toISOString().split("T")[0] : "";
      return date === todayStr && a.authorId === ADMIN_ID;
    });

    const remaining = count - todayAutoArticles.length;
    if (remaining <= 0) {
      return {
        success: false,
        submitted: [],
        publishedArticles: [],
        skipped: 0,
        noContent: false,
        message: `Already auto-submitted ${todayAutoArticles.length} article(s) today. Come back tomorrow.`,
      };
    }

    const cutoff = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    const recentAutoTitles = allArticles
      .filter((a: any) => {
        if (a.authorId !== ADMIN_ID) return false;
        const dateField = a.publishedAt || a.createdAt;
        return dateField ? new Date(dateField) > cutoff : false;
      })
      .map((a: any) => a.title as string);

    const [races, drivers, constructors] = await Promise.all([
      storage.getAllRaces(2026),
      storage.getDriverStandings(2026),
      storage.getConstructorStandings(2026),
    ]);

    const nowMs = today.getTime();
    const upcoming = races
      .filter((r) => r.status === "upcoming" || r.status === "live")
      .sort((a, b) => new Date(a.raceDate).getTime() - new Date(b.raceDate).getTime());
    const completed = races
      .filter((r) => r.status === "completed")
      .sort((a, b) => new Date(b.raceDate).getTime() - new Date(a.raceDate).getTime());

    const nextRace = upcoming[0];
    const lastRace = completed[0];
    const top3Drivers = drivers.slice(0, 3);
    const top2Constructors = constructors.slice(0, 2);

    type Candidate = { title: string; excerpt: string; content: string; tags: string[]; imageUrl: string | null; sortOrder: number };
    const candidates: Candidate[] = [];

    if (nextRace) {
      const daysUntil = Math.ceil((new Date(nextRace.raceDate).getTime() - nowMs) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= 7 && !alreadyCovered(recentAutoTitles, `${nextRace.name} Preview: Everything to Know Ahead of Round ${nextRace.round}`)) {
        const leader = top3Drivers[0];
        const second = top3Drivers[1];
        const ptsDiff = leader && second ? leader.points - second.points : 0;
        const topConstructor = top2Constructors[0];
        candidates.push({
          title: `${nextRace.name} Preview: Everything to Know Ahead of Round ${nextRace.round}`,
          excerpt: `Formula 1 heads to ${nextRace.location}, ${nextRace.country} for the ${nextRace.name}. Here is everything you need to know heading into what promises to be a critical round.`,
          imageUrl: IMGS.circuit,
          tags: [nextRace.country, "Race Preview", "2026 Season", nextRace.name],
          sortOrder: 1,
          content: `Formula 1 returns to ${nextRace.circuit} in ${nextRace.location}, ${nextRace.country} for the ${nextRace.name} — Round ${ordinal(nextRace.round)} of the 2026 World Championship.${nextRace.hasSprint ? " This is a Sprint weekend, with additional championship points on offer from Saturday's Sprint race." : ""}\n\n## Championship Situation\n\n${leader && second ? `${leader.driverName} leads the Drivers' Championship with ${leader.points} points, ${ptsDiff} ahead of ${second.driverName}.` : ""} ${topConstructor ? `${topConstructor.teamName} lead the Constructors' standings.` : ""} With ${upcoming.length} rounds remaining, every point has championship significance.\n\n## Circuit Profile: ${nextRace.circuit}\n\n${nextRace.circuit} demands a precise setup balance between downforce for its technical corners and aerodynamic efficiency on the straights. Tyre management will be critical — the compound selection and thermal characteristics of this venue place a specific premium on smooth driving.\n\n## Key Questions\n\nWhich team has found the better setup direction? Can the championship leader hold their advantage under pressure from a charging rival? Will track characteristics favour any specific team concept and upset the established order?\n\n${nextRace.raceDate ? `The race starts on ${formatDate(nextRace.raceDate)}.` : ""} Full analysis, qualifying reaction, and race reports will be available here on F1 Fan Hub throughout the weekend.`,
        });
      }
    }

    if (lastRace) {
      const daysSince = Math.ceil((nowMs - new Date(lastRace.raceDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 0 && daysSince <= 4 && !alreadyCovered(recentAutoTitles, `${lastRace.name} Reaction: Championship Standings After Round ${lastRace.round}`)) {
        const leader = top3Drivers[0];
        const second = top3Drivers[1];
        const topTeam = top2Constructors[0];
        candidates.push({
          title: `${lastRace.name} Reaction: Championship Standings After Round ${lastRace.round}`,
          excerpt: `The ${lastRace.name} has concluded. Here is how the 2026 World Championship looks after ${ordinal(lastRace.round)} round of racing.`,
          imageUrl: IMGS.track,
          tags: [lastRace.country, "Standings", "2026 Season", lastRace.name],
          sortOrder: 1,
          content: `The ${lastRace.name} at ${lastRace.circuit} has written its chapter in the 2026 Formula 1 World Championship. As teams debrief and prepare for the next round, here is the complete picture of the championship standings.\n\n## Drivers' Championship\n\n${top3Drivers.map((d, i) => `**${ordinal(i + 1)}. ${d.driverName} (${d.teamName}) — ${d.points} pts**`).join("\n")}\n\n${leader && second ? `${leader.driverName} leads ${second.driverName} by ${leader.points - second.points} points. With ${upcoming.length} rounds remaining, the championship ${leader.points - second.points < 25 ? "remains wide open" : "is taking shape but is far from decided"}.` : ""}\n\n## Constructors' Championship\n\n${top2Constructors.map((c, i) => `**${ordinal(i + 1)}. ${c.teamName} — ${c.points} pts**`).join("\n")}\n\n${topTeam ? `${topTeam.teamName} lead the Constructors' standings.` : ""}\n\n${upcoming.length > 0 ? `Next up: **${upcoming[0].name}** at ${upcoming[0].circuit}${upcoming[0].raceDate ? `, ${formatDate(upcoming[0].raceDate)}` : ""}.` : ""}`,
        });
      }
    }

    if (today.getDay() === 2 || today.getDay() === 3) {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const standingsThisWeek = allArticles.some((a: any) => {
        const dateField = a.publishedAt || a.createdAt;
        return dateField && new Date(dateField) > weekAgo && a.authorId === ADMIN_ID && (a.title || "").toLowerCase().includes("standings");
      });
      if (!standingsThisWeek && top3Drivers.length > 0) {
        const leader = top3Drivers[0];
        const second = top3Drivers[1];
        const third = top3Drivers[2];
        candidates.push({
          title: `2026 F1 Standings: Full Championship Picture After Round ${completed.length}`,
          excerpt: `Where does every driver and team stand in the 2026 Formula 1 World Championship? Complete standings breakdown after ${completed.length} rounds.`,
          imageUrl: IMGS.data,
          tags: ["Standings", "2026 Season", "Championship"],
          sortOrder: 1,
          content: `With ${completed.length} rounds completed and ${upcoming.length} to go in the 2026 Formula 1 World Championship, here is the complete standings picture.\n\n## Drivers — Top 10\n\n${drivers.slice(0, 10).map((d, i) => `**${ordinal(i + 1)}. ${d.driverName} ${(d as any).flagEmoji || ""} (${d.teamName}) — ${d.points} pts${d.wins > 0 ? ` | ${d.wins} win${d.wins > 1 ? "s" : ""}` : ""}`).join("\n")}\n\n${leader && second ? `Gap: ${leader.points - second.points} points between ${leader.driverName} and ${second.driverName}. ${third ? `${third.driverName} is ${second.points - third.points} further back in third.` : ""}` : ""}\n\n## Constructors\n\n${constructors.map((c, i) => `**${ordinal(i + 1)}. ${c.teamName} — ${c.points} pts**`).join("\n")}\n\n${upcoming.length > 0 ? `Next race: **${upcoming[0].name}** at ${upcoming[0].circuit}${upcoming[0].raceDate ? ` on ${formatDate(upcoming[0].raceDate)}` : ""}.` : ""}`,
        });
      }
    }

    const rssHeadlines = await fetchF1Headlines();
    if (rssHeadlines.length > 0) {
      const rssArticles = buildRssArticles(rssHeadlines, recentAutoTitles);
      candidates.push(...rssArticles);
    }

    const shuffled = shuffle(TECHNICAL_TOPICS);
    for (const topic of shuffled) {
      if (!alreadyCovered(recentAutoTitles, topic.title)) {
        candidates.push({
          title: topic.title,
          excerpt: topic.content.split("\n\n")[0].substring(0, 280) + "...",
          imageUrl: topic.imageUrl,
          tags: topic.tags,
          sortOrder: 1,
          content: topic.content,
        });
      }
    }

    if (candidates.length === 0) {
      const nextRaceName = upcoming[0]?.name || "the next race";
      return {
        success: false,
        submitted: [],
        publishedArticles: [],
        skipped: 0,
        noContent: true,
        message: `All topics have been published recently. New race content will be available closer to ${nextRaceName}.`,
      };
    }

    const seen = new Set<string>();
    const batch: Candidate[] = [];
    for (const c of candidates) {
      if (!seen.has(c.title) && batch.length < remaining) {
        seen.add(c.title);
        batch.push(c);
      }
    }

    const submitted: string[] = [];
    const publishedArticles: Array<{ title: string; slug: string }> = [];

    for (const candidate of batch) {
      const article = await storage.createArticle({
        title: candidate.title,
        excerpt: candidate.excerpt,
        content: candidate.content,
        authorId: ADMIN_ID,
        section: "news",
        tags: candidate.tags,
        sortOrder: candidate.sortOrder,
        imageUrl: candidate.imageUrl,
      });
      submitted.push(article.title);
      publishedArticles.push({ title: article.title, slug: article.slug });
    }

    return {
      success: true,
      submitted,
      publishedArticles,
      skipped: Math.max(0, count - candidates.length),
      noContent: candidates.length < count,
      message: candidates.length < count
        ? `Generated ${submitted.length} article(s) — ${count - candidates.length} slot(s) had no fresh content available.`
        : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      submitted: [],
      publishedArticles: [],
      skipped: 0,
      noContent: false,
      message: err?.message || "Unknown error during auto-publish batch",
    };
  }
}

// ─── Weekly Trending Topics ───────────────────────────────────────────────────

const TRENDING_TOPICS: Topic[] = [
  {
    keyword: "Vettel Comeback",
    title: "Sebastian Vettel Comeback Rumours: What Would a Return to the Grid Actually Look Like?",
    tags: ["Paddock", "Vettel", "Drivers", "Rumours"],
    imageUrl: IMGS.helmet,
    content: `Sebastian Vettel retired from Formula 1 at the end of the 2022 season after 16 years and four World Championships, citing a desire to spend more time with his family and pursue environmental causes. Yet paddock rumours about a potential return resurface with remarkable persistence — and the question of what a Vettel comeback would actually look like in 2025 or 2026 is more complex than it might appear.\n\nVettel left the sport in his prime competitive years by historical standards. At 37, the age he retired, drivers like Alain Prost and Michael Schumacher were still competing at the highest level. His physical condition remained exceptional; the decision was entirely one of personal priorities rather than diminishing capability.\n\nThe grid landscape has changed significantly since his departure. The cars are fundamentally different — the 2022 ground-effect regulations that arrived in his final season continued evolving, and the 2026 regulations will represent another step change. A returning Vettel would face a learning curve measured in months, not laps, to find the new cars' limits.\n\nThe seat question is equally complex. The top teams — Red Bull, Ferrari, Mercedes, McLaren — are all contracted for at least the near future. Mid-grid seats exist, but returning to a team unlikely to compete for wins would risk undermining the legacy he carefully preserved by leaving at a high point. Vettel himself has repeatedly dismissed the rumours, and there is no credible indication that a return is being actively discussed.\n\nWhat keeps the conversation alive is simple: Vettel remains one of the most naturally gifted drivers of his generation, and the sport misses his particular combination of technical intelligence, wit, and competitive intensity. Whether that makes a comeback more or less likely is, ultimately, his decision alone.`,
  },
  {
    keyword: "McLaren Macarena Wing",
    title: "The McLaren 'Macarena Wing' Controversy: How a Flexible Rear Wing Shook the Paddock",
    tags: ["Paddock", "McLaren", "Technical Controversy", "Aerodynamics"],
    imageUrl: IMGS.aero,
    content: `The paddock controversy over McLaren's rear wing behaviour — nicknamed the "Macarena wing" by rivals who observed what they described as unusual flexing patterns under load — became one of the defining technical disputes of the 2024 and 2025 seasons. Understanding what the teams were arguing about, and why the FIA's response mattered, requires a look at how flexi-wing rules work and why they are so difficult to police.\n\nThe FIA's technical regulations prohibit aerodynamic components from deflecting beyond defined limits under load. The rules are tested through a series of static deflection tests — fixed loads applied to the wing structure at the technical delegate's request. If the wing passes the test, it is legal.\n\nThe challenge is that static tests cannot fully replicate dynamic loads at racing speeds. A wing structure that passes a static test can, in theory, behave differently under aerodynamic loads at 300 km/h — loads that change continuously with speed, turbulence, and yaw angle. Teams have historically designed structures that pass the prescribed tests while behaving more flexibly at speed than the regulations intend.\n\nMcLaren's response to the controversy was that their wing passed all FIA tests and was therefore compliant. Their rivals' response was that the tests were insufficient to capture real-world behaviour. The FIA responded by updating their deflection test protocols — a standard pattern in technical disputes where the regulations chase the development.\n\nWhat made this particular controversy significant was timing. McLaren's performance advantage through 2024 coincided with their wing debate, and rivals arguing that flexing aerodynamic components contributed to that advantage found a receptive audience in the paddock press corps. Whether the wing controversy genuinely affected lap times remains, as with most such disputes, ultimately unproven.`,
  },
  {
    keyword: "2026 Championship Standings",
    title: "2026 F1 Championship: The Midseason Power Struggle That Will Define the Title",
    tags: ["Paddock", "2026 Season", "Championship", "Analysis"],
    imageUrl: IMGS.data,
    content: `The 2026 Formula 1 World Championship was always going to be unlike any that preceded it. The arrival of entirely new power unit regulations — eliminating the MGU-H, boosting electrical deployment to levels that dwarf the previous era, and fundamentally redistributing performance between manufacturers — meant the season began with genuine uncertainty at the front of the field for the first time in years.\n\nThe midseason picture has clarified the competitive hierarchy, but not as cleanly as any single team would like. The power unit performance gaps that defined 2014-2021 have partially reasserted themselves, with the manufacturers who most successfully developed the new electrical architecture gaining a straight-line advantage that is translating into qualifying and race pace.\n\nThe human story remains paramount. Championship leads have changed multiple times — a rarity in recent seasons characterised by one team's dominance. Drivers who had been written off as title contenders after slow starts have resurfaced as genuine factors through reliability and strategic execution.\n\nThe constructor battle is equally close. Points are separated by margins that one race result — a safety car, a mechanical failure, a strategic call that swings the wrong way — can swing entirely. Teams that entered the season confident in their new machinery have found development surprises, both positive and negative, as the year has progressed.\n\nWhat emerges from the midseason view is a championship that will be decided not on a single memorable afternoon but through the accumulation of marginal gains and marginal mistakes across 24 rounds. The title will belong to the driver and team who make the fewest errors in the final six races — and that is the best possible advertisement for the sport.`,
  },
  {
    keyword: "Red Bull Driver Lineup",
    title: "Red Bull's Driver Future: The Selection Process That Defines a Champion Team",
    tags: ["Paddock", "Red Bull", "Drivers", "Team News"],
    imageUrl: IMGS.helmet,
    content: `Red Bull Racing's approach to driver management is one of the most studied — and most controversial — in Formula 1. Their junior programme has produced multiple World Champions and has also been the source of driver departures that became major storylines. Understanding how the team selects and manages its drivers reveals much about how they operate as an organisation.\n\nRed Bull's senior seat philosophy has historically prioritised proven performance over development potential. Once a driver demonstrates championship-level pace, they are protected. When performance declines relative to their teammate — as happened with Mark Webber in 2013, with Daniel Ricciardo's departure in 2018, and with various junior team transitions — the team's decision-making is ruthlessly data-driven.\n\nThe junior programme feeds the senior team but also creates surplus. Talented drivers from Red Bull's academy who find no senior seat available face a choice: stay and wait, or leave to pursue opportunities elsewhere. Several drivers who departed the Red Bull family have gone on to significant success at rival teams — a fact that the team's management has occasionally had to answer for.\n\nThe current lineup question centres on long-term succession planning. As the sport's competitive landscape shifts with 2026 regulations, getting the driver pairing right — balancing experience with development potential, and managing two strong personalities within the same garage — becomes a strategic decision with championship implications across multiple seasons, not just one.\n\nFor a team that has become accustomed to championship success, driver selection is not merely a human resources question. It is an engineering decision: which pairing generates the best combined data set for car development, produces the most constructors' points, and places the team in the best position to extend what has been an extraordinary period of dominance.`,
  },
  {
    keyword: "Ferrari Leadership",
    title: "Ferrari's New Era: How Structural Changes at Maranello Are Reshaping the Team",
    tags: ["Paddock", "Ferrari", "Team News", "Management"],
    imageUrl: IMGS.speed,
    content: `Ferrari's relationship with structural change is complicated by history. The Scuderia has, over its 75-year World Championship history, restructured its technical leadership so many times that the pattern has become a story in itself: a disappointing season triggers a personnel review, a personnel review triggers a restructure, a restructure triggers optimism, and the cycle begins again.\n\nWhat makes the current period at Ferrari different — or at least, what the team argues makes it different — is the depth of the structural transformation underway. Rather than simply changing the technical director while leaving the underlying processes intact, the team has invested in rebuilding their organisational methodology, integrating lessons from teams that have successfully transitioned from midfield contenders to championship-winning operations.\n\nThe results have been, by Ferrari's historical standards, encouraging in some respects and frustrating in others. Race pace has improved relative to benchmarks. Qualifying pace has been a consistent strength. Strategic errors — the category that has historically cost Ferrari more points than any technical shortcoming — have decreased in frequency if not entirely disappeared.\n\nThe question that follows Ferrari through every season is whether the change is structural or cyclical. Has Maranello genuinely solved the organisational problems that have prevented title challenges from converting into titles? Or will the pressure of a championship fight, applied to a system that has not been stress-tested in a genuine title decider, reveal the same fractures?\n\nThe honest answer is that this question cannot be answered until Ferrari are in that position. Building a car capable of challenging for the championship is necessary but not sufficient. Winning it requires execution under conditions that only a championship fight produces.`,
  },
  {
    keyword: "Mercedes Rebuild",
    title: "Mercedes' Championship Rebuild: Inside the W-Series Recovery Project",
    tags: ["Paddock", "Mercedes", "Team News", "Technical"],
    imageUrl: IMGS.tech,
    content: `The period from 2022 to the present represents the longest stretch of non-championship dominance in Mercedes' recent history, and the team's response to losing their position at the front of the grid has been one of the most closely watched technical and organisational stories in the sport.\n\nMercedes' competitive decline began with the ground-effect regulations of 2022, which exposed a design philosophy — the zero-pod concept — that failed to achieve its intended aerodynamic benefits. The team's willingness to persist with the concept through much of 2022 before pivoting represents, in retrospect, one of the costliest development decisions of the modern regulatory era.\n\nThe rebuilding process accelerated from 2023 onwards. Technical leadership evolved, design parameters shifted, and the team began publicly acknowledging problems that in their dominant years would have been managed internally. This transparency — or relative transparency — was a cultural shift, whether strategic or genuine.\n\nThe 2026 regulations represent an opportunity that Mercedes' power unit leadership has targeted specifically. The new electrical architecture aligns with manufacturing competencies they have developed internally, and their experience of transitioning to new regulatory frameworks in 2014 — when their engine concept gave them a multi-year advantage — informs their development approach.\n\nWhether 2026 delivers another Mercedes era of dominance is unknowable in advance. What is clear is that the team's response to adversity — measured, methodical, and focused on structural improvement rather than reactive personnel changes — has maintained their credibility as a championship-capable organisation even during the years when the results did not reflect it.`,
  },
  {
    keyword: "F1 2026 Rules",
    title: "F1's 2026 Revolution: What the New Rules Mean for Racing On Track",
    tags: ["Paddock", "2026 Regulations", "Technical", "Analysis"],
    imageUrl: IMGS.car,
    content: `The 2026 Formula 1 technical regulations represent the most comprehensive rewrite of the sport's rules since 2014 — and arguably since the ground-effect era of the early 1980s. Understanding what changed, why it changed, and what it means for racing on track requires separating the engineering reality from the political motivations that shaped the regulations.\n\nThe power unit changes are the most visible headline. The elimination of the MGU-H removes the most technically complex and expensive component of the previous architecture, reducing the barrier to entry for new manufacturers and simplifying reliability management. The increase in electrical deployment — the MGU-K is no longer power-limited in the same way — means electrical power now represents a larger proportion of total output than before.\n\nThe aerodynamic regulations attempt to balance two historically contradictory goals: generating sufficient downforce for fast, committed corner-taking, while producing cars that can follow closely enough for overtaking. The 2022 ground-effect regulations improved following ability; the 2026 regulations refine the approach, with active aerodynamic elements — a controlled form of movable aerodynamics — permitted for the first time in decades.\n\nThe active aerodynamics provision has been controversial in the paddock. The concept of a system that adjusts wing angles based on speed conditions shares conceptual DNA with DRS but operates differently in practice. Whether it achieves its intended effect of allowing closer racing at a wider range of circuit types will only be demonstrable after a full season of data.\n\nFor fans, the on-track effect of 2026 has been a recalibration of the competitive hierarchy — new regulations always shuffle the deck — combined with power unit sounds and performance characteristics that differ meaningfully from the previous era. Whether the racing itself improves, stays the same, or declines relative to the 2022-2025 period will be the ultimate verdict on whether the FIA and F1's regulatory ambitions were achieved.`,
  },
  {
    keyword: "Norris Title Challenge",
    title: "Lando Norris: Can McLaren's Lead Driver Convert Pace into a Championship?",
    tags: ["Paddock", "Norris", "McLaren", "Championship"],
    imageUrl: IMGS.helmet,
    content: `Lando Norris's development from the youngest British driver to score points on his F1 debut into a genuine World Championship contender represents one of the most compelling driver stories in the sport's recent history. The question now is not whether Norris has the pace — that has been demonstrated beyond reasonable doubt — but whether he has the complete package of skills required to win a championship in the specific conditions of a title fight.\n\nNorris's natural talent was evident from his first season in 2019. His speed in single-lap qualifying consistently matched or exceeded teammates and rivals with years more experience. His race craft developed quickly, and his relationship with his engineers — open, technically curious, analytically minded — made him a valuable development driver as well as a racing one.\n\nThe championship contention question reveals the areas where development is still ongoing. In the 2024 season, when Norris had the machinery to genuinely challenge Max Verstappen for the title in the second half of the year, the points did not convert at the rate the pace suggested they should. Mistakes in high-pressure moments, occasionally aggressive strategy calls, and the accumulated weight of racing against a four-time champion who had mastered exactly these situations — all contributed to a gap at season's end that the raw performance comparison did not fully explain.\n\nMcLaren's task is to build a championship-winning environment around Norris at the same time as Norris builds his championship-winning mentality. These two processes need to synchronise — having the right driver in the right car at the right moment is a necessary condition that is rarer than it looks from the outside.\n\nWhat makes Norris a compelling figure is his self-awareness about exactly this question. He does not deflect from the challenge; he discusses it directly and with the kind of analytical honesty that suggests the learning is genuine.`,
  },
  {
    keyword: "Verstappen Legacy",
    title: "Max Verstappen's Legacy: Redefining What Dominance Looks Like in F1",
    tags: ["Paddock", "Verstappen", "Red Bull", "F1 History"],
    imageUrl: IMGS.speed,
    content: `Four World Championships. Fifty-nine race victories. The highest single-season win rate in Formula 1 history. By any statistical measure, Max Verstappen has already secured a place in the conversation about the sport's greatest drivers — and he has done so while still in the early phase of what could be a fifteen-year career.\n\nVerstappen's rise was unconventional. He became the youngest driver to start a Formula 1 race at 17, and his early career was marked as much by spectacular errors as spectacular pace. Red Bull's decision to promote him mid-season to their senior team in 2016 — replacing Daniil Kvyat at just 18 — accelerated a learning process that might otherwise have taken years.\n\nThe transformation from raw, occasionally reckless talent to the controlled, devastatingly effective champion of the title-fight years happened between 2017 and 2020. In these seasons, largely driving equipment that could not challenge for championships, Verstappen refined his approach without the pressure of title mathematics. He learned how to manage tyres, how to manage championships, and how to take risks that were calculated rather than impulsive.\n\nThe 2021 title fight with Lewis Hamilton defined his championship career's first chapter. The year-long battle — intense, controversial, occasionally bitter — was resolved in the most dramatic possible circumstances on the final lap in Abu Dhabi. Verstappen's management of that season, which included retirements and penalties alongside extraordinary drives, demonstrated the full range of his capabilities.\n\nThe years that followed — 2022, 2023, 2024 — were dominated to degrees unprecedented in the modern era. The 2023 campaign, with 19 wins from 22 races, sits alone in the sport's statistical record. Whether this dominance reflects Verstappen's individual genius or Red Bull's engineering superiority is a question the sport will debate for decades — which is, in itself, a sign of how significant his era has been.`,
  },
  {
    keyword: "Paddock Social Media",
    title: "F1's Social Media Transformation: How the Paddock Went Global",
    tags: ["Paddock", "Social Media", "Business of F1", "Fan Engagement"],
    imageUrl: IMGS.data,
    content: `Formula 1's digital transformation over the past decade has been as significant to the sport's commercial position as any technical regulation change. The shift from a sport that was largely inaccessible to younger audiences and non-European markets to one of the most globally followed sporting properties on social media was not accidental — it was the result of deliberate strategy, changing ownership priorities, and the emergence of content formats that suited F1's visual drama.\n\nLiberty Media's acquisition of F1 in 2017 brought explicit focus on digital audience development. Under the previous commercial era, much of the sport's visual content was restricted or licensed in ways that limited organic sharing. The new approach opened the content ecosystem — allowing fan-created content, shorter highlight clips, behind-the-scenes access, and a social media presence that treated platforms as primary rather than secondary distribution channels.\n\nDrive to Survive on Netflix from 2019 onwards became the most significant single catalyst for audience growth in the sport's history. Its effects were measurable: viewership demographics in the United States shifted younger, audience size in markets where F1 had historically been a niche property grew significantly, and the paddock personalities who featured most prominently in the series became globally recognisable figures beyond their core sporting fanbase.\n\nThe transformation has created tensions as well as opportunities. Drivers who became social media personalities found their public identities increasingly separate from their on-track identities. Teams that invested in content operations found themselves managing media organisations as well as racing ones. The balance between authentic paddock access and controlled messaging — between the documentary that builds genuine connection and the promotional content that does not — is an ongoing negotiation.\n\nThe global F1 fanbase that now follows the sport on multiple platforms simultaneously — watching races on broadcast, following driver social accounts, engaging with team content — represents both the opportunity and the challenge of maintaining authentic sporting theatre in an era of total media saturation.`,
  },
];

const WEEKLY_TRENDING_PER_RUN = 3;

export async function generateAndPublishTrendingBatch(): Promise<{
  success: boolean;
  submitted: string[];
  skipped: number;
  noContent: boolean;
  message?: string;
}> {
  try {
    const today = new Date();

    const [published, pending] = await Promise.all([
      storage.getArticles(),
      storage.getPendingArticles(),
    ]);
    const allArticles = [...published, ...pending];

    // Check how many trending articles have already been published this week (Mon–Sun)
    const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7)); // rewind to Monday
    const thisWeekTrending = allArticles.filter((a: any) => {
      if (a.authorId !== ADMIN_ID || a.section !== "paddock") return false;
      if (!Array.isArray(a.tags) || !a.tags.includes("AutoTrending")) return false;
      const dateField = a.publishedAt || a.createdAt;
      return dateField && new Date(dateField) >= weekStart;
    });

    if (thisWeekTrending.length >= WEEKLY_TRENDING_PER_RUN) {
      return {
        success: false,
        submitted: [],
        skipped: 0,
        noContent: false,
        message: `Already published ${thisWeekTrending.length} trending paddock article(s) this week. Next batch on Monday.`,
      };
    }

    const remaining = WEEKLY_TRENDING_PER_RUN - thisWeekTrending.length;

    // Deduplication window: 60 days for trending topics
    const cutoff = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    const recentTitles = allArticles
      .filter((a: any) => {
        if (a.authorId !== ADMIN_ID) return false;
        const dateField = a.publishedAt || a.createdAt;
        return dateField ? new Date(dateField) > cutoff : false;
      })
      .map((a: any) => a.title as string);

    const available = TRENDING_TOPICS.filter(t => !alreadyCovered(recentTitles, t.keyword));

    if (available.length === 0) {
      return {
        success: false,
        submitted: [],
        skipped: 0,
        noContent: true,
        message: "All trending topics have been published recently. Topics rotate on a 60-day window.",
      };
    }

    // Rotate: use a deterministic week-based offset so the selection cycles through the list
    const weekNumber = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
    const offset = weekNumber % available.length;
    const rotated = [...available.slice(offset), ...available.slice(0, offset)];
    const batch = rotated.slice(0, remaining);

    const submitted: string[] = [];

    for (const topic of batch) {
      const article = await storage.createArticle({
        title: topic.title,
        excerpt: topic.content.split("\n")[0].substring(0, 200) + "...",
        content: topic.content,
        authorId: ADMIN_ID,
        section: "paddock",
        tags: [...topic.tags, "AutoTrending"],
        sortOrder: 0,
        imageUrl: topic.imageUrl,
      });
      submitted.push(article.title);
    }

    return {
      success: true,
      submitted,
      skipped: 0,
      noContent: false,
      message: `Published ${submitted.length} trending paddock article(s) for this week.`,
    };
  } catch (err: any) {
    return {
      success: false,
      submitted: [],
      skipped: 0,
      noContent: false,
      message: err?.message || "Unknown error during weekly trending publish",
    };
  }
}

// Legacy single-article wrapper used by scheduler if needed
export async function generateAndPublishArticle(): Promise<{
  success: boolean;
  title?: string;
  message?: string;
  noContent?: boolean;
}> {
  const result = await generateAndPublishBatch(1);
  if (result.success && result.submitted.length > 0) {
    return { success: true, title: result.submitted[0] };
  }
  return { success: false, noContent: result.noContent, message: result.message };
}
