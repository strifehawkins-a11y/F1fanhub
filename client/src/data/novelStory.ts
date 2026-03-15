export interface Choice {
  id: string;
  text: string;
  pointCost: number;
  affectionGain: number;
  response: string;
  locked?: boolean;
}

export interface Scene {
  id: number;
  character: "aria" | "narrator";
  text: string;
  emotion: "happy" | "nervous" | "determined" | "sad" | "excited" | "loving" | "angry" | "default";
  choices?: Choice[];
  autoAdvance?: boolean;
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  scenes: Scene[];
  unlockCost: number;
}

export const NOVEL_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "The Starting Grid",
    subtitle: "A dream becomes real",
    unlockCost: 0,
    scenes: [
      {
        id: 0,
        character: "narrator",
        text: "Melbourne, Australia. The Albert Park Circuit buzzes with the energy of a new Formula 1 season. In the paddock, among the supercars and mechanics, a young rookie takes her first steps into the big leagues...",
        emotion: "default",
        autoAdvance: true,
      },
      {
        id: 1,
        character: "aria",
        text: "I can't believe it... I'm actually here. The Albert Park paddock. Formula 1. Me, Bea Voss, in Formula 1!",
        emotion: "excited",
        autoAdvance: true,
      },
      {
        id: 2,
        character: "aria",
        text: "But the team principal, Mr. Harlow, doesn't seem convinced. He said I'm 'an experiment.' Like I'm some kind of trial run... It stings.",
        emotion: "sad",
        choices: [
          {
            id: "ch1_s2_a",
            text: "Tell her: 'You belong here just as much as anyone.'",
            pointCost: 0,
            affectionGain: 10,
            response: "Bea smiles warmly. 'Thank you. I needed to hear that more than you know.'",
          },
          {
            id: "ch1_s2_b",
            text: "Buy her a lucky racing charm from the gift shop.",
            pointCost: 500,
            affectionGain: 25,
            response: "Bea laughs in surprise. 'A little helmet charm! I'm going to keep this on my visor. Thank you so much!'",
          },
          {
            id: "ch1_s2_c",
            text: "Offer to run data analysis with her all night to prove herself.",
            pointCost: 1000,
            affectionGain: 50,
            response: "Bea's eyes light up. 'You'd do that? Stay up all night going through lap data with me? You're incredible. Let's go!'",
          },
        ],
      },
      {
        id: 3,
        character: "aria",
        text: "Whatever happens on Sunday... I'm going to show them all. Watch me.",
        emotion: "determined",
        autoAdvance: true,
      },
    ],
  },
  {
    id: 2,
    title: "Qualifying Jitters",
    subtitle: "One lap to change everything",
    unlockCost: 0,
    scenes: [
      {
        id: 0,
        character: "narrator",
        text: "Saturday afternoon. Q1 is about to begin. The temperature on track is 42 degrees and Bea's car sits in the pit lane, ready to fire.",
        emotion: "default",
        autoAdvance: true,
      },
      {
        id: 1,
        character: "aria",
        text: "Okay. Breathe. You've done this ten thousand times in practice. This is just... another lap. With forty thousand people watching. And the whole world on TV. No pressure.",
        emotion: "nervous",
        autoAdvance: true,
      },
      {
        id: 2,
        character: "aria",
        text: "My race engineer says my car setup is borderline. Too much understeer in the slow corners. I only have time to fix one thing before I need to box. What should I focus on?",
        emotion: "nervous",
        choices: [
          {
            id: "ch2_s2_a",
            text: "Suggest she adjusts the front wing angle.",
            pointCost: 0,
            affectionGain: 10,
            response: "Bea nods. 'Makes sense. A click of front wing should give me more front-end bite. Good thinking!'",
          },
          {
            id: "ch2_s2_b",
            text: "Pay for a specialist tyre consultant to advise her.",
            pointCost: 800,
            affectionGain: 30,
            response: "The consultant's advice is gold. Bea switches to a different tyre compound option and suddenly the car feels alive. 'This is it! This is the setup!'",
          },
          {
            id: "ch2_s2_c",
            text: "Hire a data engineer to crunch overnight sim data for the perfect setup.",
            pointCost: 2000,
            affectionGain: 60,
            response: "'Three tenths faster in sector two alone!' Bea screams over the radio. 'I'm on for a shock Q3 appearance!' She goes on to qualify eighth — a sensation.",
          },
        ],
      },
      {
        id: 3,
        character: "aria",
        text: "Flying lap complete. P12. Not perfect, but enough to make it through to Q2. I'm shaking. But in a good way!",
        emotion: "happy",
        autoAdvance: true,
      },
    ],
  },
  {
    id: 3,
    title: "Lights Out",
    subtitle: "The race begins",
    unlockCost: 500,
    scenes: [
      {
        id: 0,
        character: "narrator",
        text: "Race day. The grid is formed, engines warming, the crowd a sea of colour. Bea sits in her car, P12, helmet on, visor down. This is what she was born for.",
        emotion: "default",
        autoAdvance: true,
      },
      {
        id: 1,
        character: "aria",
        text: "Five red lights. Four. Three. Two. One. They go out. GO GO GO!\n\n...I made it through Turn 1! Already up to P10! The car is flying!",
        emotion: "excited",
        autoAdvance: true,
      },
      {
        id: 2,
        character: "aria",
        text: "Lap 18. I've got P8 in my sights. But my tyres are starting to grain. Do I push and risk a blowout, or do I hold position and wait for strategy?",
        emotion: "determined",
        choices: [
          {
            id: "ch3_s2_a",
            text: "Tell her to trust her instincts and push.",
            pointCost: 0,
            affectionGain: 10,
            response: "'Pushing!' She sets a personal best lap time, closes on P8, but loses the front tyres. Finishes P10. Points! Her first points in F1!",
          },
          {
            id: "ch3_s2_b",
            text: "Get a racing strategist on the radio to model the best call.",
            pointCost: 1000,
            affectionGain: 35,
            response: "The strategist calls it perfectly. She pits at the ideal window, comes out in P8 on fresh tyres, and holds to the flag. P8. Eight points. Tears on the podium steps.",
          },
          {
            id: "ch3_s2_c",
            text: "Send urgent data to her team via satellite analysis.",
            pointCost: 2500,
            affectionGain: 70,
            response: "The real-time analysis is incredible. The team predicts a safety car in five laps — they're right. Bea pits under it, leapfrogs two cars, and finishes P6. SIX POINTS on debut!",
          },
        ],
      },
      {
        id: 3,
        character: "aria",
        text: "I did it. Points on my debut. I actually did it. I'm... I'm crying in my helmet. Don't tell anyone.",
        emotion: "loving",
        autoAdvance: true,
      },
    ],
  },
  {
    id: 4,
    title: "Under Pressure",
    subtitle: "The media turns its eyes",
    unlockCost: 1000,
    scenes: [
      {
        id: 0,
        character: "narrator",
        text: "The Melbourne result sent shockwaves through the paddock. Now everyone wants a piece of Bea Voss. The press conference room is packed.",
        emotion: "default",
        autoAdvance: true,
      },
      {
        id: 1,
        character: "aria",
        text: "Reporter after reporter. Same questions. 'Did you expect to score points?' 'Are you just lucky?' 'Is the team carrying you?'\n\nI keep my smile on, but inside... it's wearing me down.",
        emotion: "sad",
        autoAdvance: true,
      },
      {
        id: 2,
        character: "aria",
        text: "One journalist just asked if I only got my seat because of 'diversity quotas.' I froze. I didn't know what to say. What would you do?",
        emotion: "angry",
        choices: [
          {
            id: "ch4_s2_a",
            text: "Tell her: 'Let your results speak for themselves.'",
            pointCost: 0,
            affectionGain: 15,
            response: "Bea squares her shoulders. 'You're right. Numbers don't lie. And my numbers say I belong here.' A ripple of applause from the room.",
          },
          {
            id: "ch4_s2_b",
            text: "Hire a PR consultant to prepare her for the media storm.",
            pointCost: 1200,
            affectionGain: 40,
            response: "Armed with perfect talking points, Bea handles every question with grace and confidence. 'I earned my seat on merit. Every lap tells that story.' The room is won over.",
          },
          {
            id: "ch4_s2_c",
            text: "Arrange an exclusive interview to tell her full story.",
            pointCost: 3000,
            affectionGain: 80,
            response: "The interview becomes the most-watched F1 content of the year. Bea's story — from karting at age 8 to Melbourne — moves millions. The narrative shifts completely in her favour.",
          },
        ],
      },
      {
        id: 3,
        character: "aria",
        text: "I don't need validation from strangers. I need to focus on the next race. But... knowing someone has my back? That means the world.",
        emotion: "loving",
        autoAdvance: true,
      },
    ],
  },
  {
    id: 5,
    title: "The Breakthrough",
    subtitle: "Destiny on the streets of Monaco",
    unlockCost: 2000,
    scenes: [
      {
        id: 0,
        character: "narrator",
        text: "Round 8. The Monaco Grand Prix. The most prestigious race on the calendar. The narrow streets of Monte Carlo forgive nothing — and reward everything.",
        emotion: "default",
        autoAdvance: true,
      },
      {
        id: 1,
        character: "aria",
        text: "I qualified fourth. FOURTH! In Monaco! Even the team principal is speechless. Mr. Harlow actually shook my hand this morning. First time.",
        emotion: "excited",
        autoAdvance: true,
      },
      {
        id: 2,
        character: "aria",
        text: "Last lap. I'm running third. A podium. My first podium. But I can see Hamilton in my mirrors. He's closing. The gap is 0.8 seconds. Eight corners to go. What should I tell myself?",
        emotion: "determined",
        choices: [
          {
            id: "ch5_s2_a",
            text: "'You have worked for this your entire life. Hold the line.'",
            pointCost: 0,
            affectionGain: 20,
            response: "Bea holds Hamilton at bay by 0.3 seconds at the line. The barriers scrape her sidepod — she doesn't care. PODIUM. The crowd erupts.",
          },
          {
            id: "ch5_s2_b",
            text: "Send her telemetry showing she can push harder in sectors 2 and 3.",
            pointCost: 1500,
            affectionGain: 50,
            response: "Using the data, Bea finds time in Portier and the chicane. She actually gaps Hamilton by 1.2 seconds at the flag. Third place. Podium. She weeps openly on the top step.",
          },
          {
            id: "ch5_s2_c",
            text: "Hire a legendary Monaco expert to talk her through every corner on comms.",
            pointCost: 4000,
            affectionGain: 100,
            response: "With the expert guiding her, she pulls something extraordinary — she attacks Hamilton and takes second! SECOND AT MONACO on her debut appearance. The grandstands go berserk. Bea stands on the podium, trophy raised, tears streaming, looking straight at you.",
          },
        ],
      },
      {
        id: 3,
        character: "aria",
        text: "I'm standing on a Monaco podium. The anthem is playing. I look up at the crowd... and then I look for you. Because none of this would have felt real without you here to share it.",
        emotion: "loving",
        autoAdvance: true,
      },
    ],
  },
];

export const OUTFIT_CATEGORIES = [
  {
    id: "suit",
    label: "🏎️ Racing Suit",
    items: [
      { id: "suit_default",   label: "Team Livery",        cost: 0,    color: "#CC0000", accent: "#FFFFFF", filter: "none",                                          overlay: "transparent",    glow: "#CC000055" },
      { id: "suit_ferrari",   label: "Ferrari Red",         cost: 1000, color: "#E8002D", accent: "#FFD700", filter: "saturate(1.4) hue-rotate(-5deg) brightness(1.05)", overlay: "#e8002d18",   glow: "#E8002D77" },
      { id: "suit_mclaren",   label: "McLaren Papaya",      cost: 1000, color: "#FF8000", accent: "#000000", filter: "sepia(0.25) saturate(2) hue-rotate(15deg)",      overlay: "#FF800020",    glow: "#FF800077" },
      { id: "suit_mercedes",  label: "Silver Arrow",        cost: 1000, color: "#27F4D2", accent: "#000000", filter: "saturate(1.3) hue-rotate(155deg) brightness(0.92)", overlay: "#27F4D218", glow: "#27F4D277" },
      { id: "suit_redbull",   label: "Red Bull Dark",       cost: 1200, color: "#3671C6", accent: "#CC1E4A", filter: "saturate(1.4) hue-rotate(210deg) brightness(0.85)", overlay: "#3671C620", glow: "#3671C677" },
      { id: "suit_alpine",    label: "Alpine Rose",         cost: 1200, color: "#FF87BC", accent: "#0093CC", filter: "saturate(1.3) hue-rotate(290deg) brightness(0.95)", overlay: "#FF87BC1A", glow: "#FF87BC77" },
      { id: "suit_champion",  label: "Champion's Gold",     cost: 4000, color: "#FFD700", accent: "#CC0000", filter: "sepia(0.35) saturate(2.2) brightness(1.15) contrast(1.1)", overlay: "#FFD70022", glow: "#FFD70088" },
    ],
  },
  {
    id: "casual",
    label: "👗 Casual Wear",
    items: [
      { id: "casual_default",    label: "Paddock Jacket",      cost: 0,    color: "#1a1a2e", accent: "#CC0000", filter: "none",                                           overlay: "transparent",    glow: "#CC000044" },
      { id: "casual_polo",       label: "Team Polo",            cost: 0,    color: "#1C3A6E", accent: "#FFFFFF", filter: "brightness(0.9) saturate(0.9)",                  overlay: "#1C3A6E18",     glow: "#1C3A6E66" },
      { id: "casual_streetwear", label: "Paddock Streetwear",   cost: 800,  color: "#2d2d2d", accent: "#E8002D", filter: "contrast(1.1) brightness(0.88) saturate(0.8)",   overlay: "#00000025",     glow: "#E8002D55" },
      { id: "casual_dress",      label: "Race Weekend Dress",   cost: 1200, color: "#CC0000", accent: "#FFFFFF", filter: "saturate(1.5) hue-rotate(-8deg) brightness(1.05)", overlay: "#CC000018",   glow: "#CC000077" },
      { id: "casual_media",      label: "Media Day Look",       cost: 1400, color: "#F5F5F5", accent: "#CC0000", filter: "brightness(1.12) contrast(0.95) saturate(0.85)", overlay: "#FFFFFF15",    glow: "#FFFFFF55" },
      { id: "casual_gown",       label: "Victory Gala Gown",    cost: 3000, color: "#1a1a2e", accent: "#FFD700", filter: "brightness(0.8) contrast(1.2) saturate(1.5)",    overlay: "#FFD70015",    glow: "#FFD70077" },
    ],
  },
  {
    id: "helmet",
    label: "⛑️ Racing Helmet",
    items: [
      { id: "helmet_default",   label: "Standard Helmet",         cost: 0,    color: "#CC0000", accent: "#FFFFFF", filter: "none",                                              overlay: "transparent",   glow: "#CC000044" },
      { id: "helmet_visor",     label: "Tinted Visor",            cost: 600,  color: "#111111", accent: "#FF6600", filter: "brightness(0.85) contrast(1.15) saturate(0.7)",     overlay: "#11111125",    glow: "#FF660066" },
      { id: "helmet_carbon",    label: "Carbon Fibre",            cost: 1400, color: "#2a2a2a", accent: "#888888", filter: "brightness(0.82) contrast(1.2) saturate(0.5)",      overlay: "#33333322",    glow: "#88888855" },
      { id: "helmet_special",   label: "Special Livery",          cost: 2000, color: "#FFD700", accent: "#CC0000", filter: "sepia(0.2) saturate(1.8) brightness(1.1)",          overlay: "#FFD70018",    glow: "#FFD70077" },
      { id: "helmet_vintage",   label: "Vintage Bell",            cost: 2400, color: "#ECBB6A", accent: "#8B4513", filter: "sepia(0.45) saturate(1.3) brightness(1.05)",        overlay: "#ECBB6A18",    glow: "#ECBB6A66" },
      { id: "helmet_champion",  label: "Champion's Laurel",       cost: 5000, color: "#FFFFFF", accent: "#FFD700", filter: "brightness(1.18) contrast(0.95) saturate(0.6)",     overlay: "#FFFFFF20",    glow: "#FFD700AA" },
    ],
  },
  {
    id: "hair",
    label: "💇 Hairstyle",
    items: [
      { id: "hair_default",   label: "Natural Auburn",     cost: 0,    color: "#8B4513", accent: "#CC0000", filter: "none",                                          overlay: "transparent",   glow: "#8B451344" },
      { id: "hair_ponytail",  label: "High Ponytail",      cost: 600,  color: "#6B2F0E", accent: "#FFD700", filter: "saturate(1.1) contrast(1.05)",                  overlay: "transparent",   glow: "#6B2F0E55" },
      { id: "hair_braided",   label: "Race Day Braid",     cost: 800,  color: "#5C2300", accent: "#FF8000", filter: "saturate(1.15) brightness(0.97) contrast(1.08)", overlay: "#5C230010",   glow: "#FF800055" },
      { id: "hair_dark",      label: "Midnight Dark",      cost: 1000, color: "#1a1a1a", accent: "#8888FF", filter: "brightness(0.88) contrast(1.1) saturate(0.75)", overlay: "#1a1a1a20",   glow: "#8888FF66" },
      { id: "hair_blonde",    label: "Champagne Blonde",   cost: 1200, color: "#F5DEB3", accent: "#FFD700", filter: "sepia(0.2) saturate(0.9) brightness(1.1)",      overlay: "#F5DEB315",   glow: "#FFD70066" },
      { id: "hair_postrace",  label: "Post-Race Messy",    cost: 800,  color: "#7B3F00", accent: "#FF6600", filter: "saturate(1.2) brightness(0.93) contrast(1.1)",  overlay: "#7B3F0015",   glow: "#FF660055" },
    ],
  },
  {
    id: "accessory",
    label: "✨ Accessories",
    items: [
      { id: "acc_default",    label: "No Accessories",     cost: 0,    color: "#333333", accent: "#888888", filter: "none",                                          overlay: "transparent",   glow: "transparent",  emoji: "" },
      { id: "acc_lanyard",    label: "VIP Paddock Pass",   cost: 400,  color: "#E8002D", accent: "#FFFFFF", filter: "none",                                          overlay: "transparent",   glow: "#E8002D44",    emoji: "🎫" },
      { id: "acc_sunglasses", label: "Pit Lane Shades",    cost: 600,  color: "#111111", accent: "#888888", filter: "brightness(0.95) contrast(1.1)",                overlay: "#00000012",    glow: "#88888855",    emoji: "🕶️" },
      { id: "acc_headset",    label: "Engineer Headset",   cost: 800,  color: "#CC8800", accent: "#FFD700", filter: "none",                                          overlay: "transparent",   glow: "#CC880055",    emoji: "🎧" },
      { id: "acc_trophy",     label: "Winner's Trophy",    cost: 2000, color: "#FFD700", accent: "#CC0000", filter: "brightness(1.05) saturate(1.1)",                overlay: "#FFD70010",    glow: "#FFD700AA",    emoji: "🏆" },
      { id: "acc_flag",       label: "F1 Flag",            cost: 1000, color: "#000000", accent: "#FFFFFF", filter: "none",                                          overlay: "transparent",   glow: "#FFFFFF44",    emoji: "🏁" },
    ],
  },
];
