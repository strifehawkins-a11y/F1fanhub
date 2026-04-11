import { useMemo } from "react";

interface AdBannerProps {
  variant?: "horizontal" | "square";
  className?: string;
}

const DIRECT_LINK = "https://omg10.com/4/10861693";

/* ── Creative definitions ────────────────────────────────────────────── */

function CreativeSpeedLines() {
  return (
    <div className="relative w-full h-full flex items-center gap-4 p-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d0005 0%, #1a0008 50%, #3d0015 100%)" }}>
      {/* Animated speed lines */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="ad-speed-line absolute h-0.5 rounded-full"
          style={{
            width: `${30 + i * 12}%`,
            top: `${14 + i * 13}%`,
            background: "rgba(255,50,50,0.35)",
            animationDelay: `${i * 0.28}s`,
          }} />
      ))}
      {/* F1 car icon */}
      <div className="relative flex-shrink-0 z-10">
        <div className="ad-pulse-ring absolute inset-0 rounded-full border-2 border-red-500 opacity-70" />
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/60">
          <svg width="28" height="20" viewBox="0 0 56 24" fill="none">
            <path d="M4 16 Q8 8 16 8 L38 6 Q46 5 50 10 L54 14 Q52 18 46 18 L38 19 Q30 20 22 19 L10 18 Q5 18 4 16Z" fill="white"/>
            <circle cx="14" cy="20" r="4" fill="#222"/>
            <circle cx="42" cy="20" r="4" fill="#222"/>
            <path d="M30 6 L36 2 L44 4 L38 8Z" fill="#ff3333"/>
          </svg>
        </div>
      </div>
      <div className="flex-1 z-10 ad-slide-up min-w-0">
        <p className="ad-shimmer-text font-black text-base sm:text-lg leading-tight tracking-tight">
          FULL THROTTLE REWARDS
        </p>
        <p className="text-white/60 text-xs mt-1 leading-snug">Exclusive offers for F1 fans — don't miss the lap</p>
      </div>
      <div className="flex-shrink-0 z-10 ad-bounce-cta">
        <span className="block bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-lg px-3 py-2 shadow-lg shadow-red-900/50 border border-red-400/30 whitespace-nowrap">
          GO NOW →
        </span>
      </div>
    </div>
  );
}

function CreativeNeonPodium() {
  return (
    <div className="relative w-full h-full flex items-center gap-4 p-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050014 0%, #0a001f 60%, #12002e 100%)" }}>
      {/* Glow orb */}
      <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(220,30,80,0.25) 0%, transparent 70%)" }} />
      {/* Trophy */}
      <div className="relative flex-shrink-0 z-10">
        <div className="ad-pulse-ring absolute inset-0 m-1 rounded-full border border-yellow-400/50" />
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #b8860b, #ffd700, #b8860b)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="ad-neon">
            <path d="M6 2h12v6a6 6 0 01-12 0V2z" fill="white" opacity="0.9"/>
            <path d="M4 2h2M18 2h2M4 5c-1.5 0-2 1-2 2s.5 2 2 2M20 5c1.5 0 2 1 2 2s-.5 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 13v2M15 13v2M7 18h10l1 3H6l1-3z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="flex-1 z-10 ad-slide-up min-w-0">
        <p className="text-yellow-300 font-black text-base sm:text-lg leading-tight ad-neon">
          CHAMPION'S CLUB
        </p>
        <p className="text-white/50 text-xs mt-1 leading-snug">Join thousands of F1 fans winning every race weekend</p>
      </div>
      <div className="flex-shrink-0 z-10 ad-bounce-cta">
        <span className="block font-black text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-yellow-400/60 text-yellow-300"
          style={{ background: "rgba(255,215,0,0.12)", boxShadow: "0 0 12px rgba(255,215,0,0.2)" }}>
          CLAIM IT →
        </span>
      </div>
    </div>
  );
}

function CreativeCheckeredFlag() {
  return (
    <div className="relative w-full h-full flex items-center gap-4 p-4 overflow-hidden bg-white">
      {/* Checkered pattern strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 ad-flag"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #111 0px, #111 12px, #fff 12px, #fff 24px)",
        }} />
      <div className="absolute bottom-0 left-0 right-0 h-1.5 ad-flag"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #111 0px, #111 12px, #fff 12px, #fff 24px)",
          animationDelay: "1s",
        }} />
      {/* Flag icon */}
      <div className="relative flex-shrink-0 z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="ad-flag grid grid-cols-4 grid-rows-4 w-10 h-10">
          {[...Array(16)].map((_, i) => (
            <div key={i} className={((Math.floor(i / 4) + (i % 4)) % 2 === 0) ? "bg-black" : "bg-white"} />
          ))}
        </div>
      </div>
      <div className="flex-1 z-10 ad-slide-up min-w-0">
        <p className="font-black text-gray-900 text-base sm:text-lg leading-tight">
          RACE DAY READY?
        </p>
        <p className="text-gray-500 text-xs mt-1 leading-snug">Gear up with exclusive F1 fan deals this season</p>
      </div>
      <div className="flex-shrink-0 z-10 ad-bounce-cta">
        <span className="block bg-black text-white font-black text-xs rounded-lg px-3 py-2 whitespace-nowrap">
          EXPLORE →
        </span>
      </div>
    </div>
  );
}

function CreativeFireStart() {
  return (
    <div className="relative w-full h-full flex items-center gap-4 p-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a0500 0%, #2d0a00 50%, #3d1500 100%)" }}>
      {/* Animated glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(255,80,0,0.18) 0%, transparent 60%)" }} />
      {/* Flame icon */}
      <div className="relative flex-shrink-0 z-10">
        <div className="ad-pulse-ring absolute inset-1 rounded-full border border-orange-500/60" />
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #c84b00, #ff6a00)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="ad-neon">
            <path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0c0-3-2-6-2-6s-1 3-3 4c0 0 1-4-1-9z" fill="white" opacity="0.9"/>
            <path d="M9 17c0-2 1.5-3.5 3-4 0 0-.5 2 1 3a2 2 0 01-4 1z" fill="#ffcc00" opacity="0.85"/>
          </svg>
        </div>
      </div>
      <div className="flex-1 z-10 ad-slide-up min-w-0">
        <p className="font-black text-orange-300 text-base sm:text-lg leading-tight ad-neon tracking-tight">
          HOT DEALS THIS WEEKEND
        </p>
        <p className="text-white/50 text-xs mt-1 leading-snug">Limited-time F1 fan offers — burning fast</p>
      </div>
      <div className="flex-shrink-0 z-10 ad-bounce-cta">
        <span className="block font-black text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-orange-500/50 text-orange-300"
          style={{ background: "rgba(255,106,0,0.15)", boxShadow: "0 0 10px rgba(255,106,0,0.25)" }}>
          GRAB IT →
        </span>
      </div>
    </div>
  );
}

function CreativeHelmetSpin() {
  return (
    <div className="relative w-full h-full flex items-center gap-4 p-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #001a3d 0%, #002b5c 60%, #003d7a 100%)" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(0,120,255,0.15) 0%, transparent 65%)" }} />
      {/* Helmet */}
      <div className="relative flex-shrink-0 z-10">
        <div className="ad-spin absolute inset-0 rounded-full border border-dashed border-blue-400/30" />
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0050b3, #0070f3)" }}>
          <svg width="30" height="28" viewBox="0 0 30 28" fill="none">
            <ellipse cx="15" cy="14" rx="12" ry="11" fill="white" opacity="0.92"/>
            <path d="M5 16 Q8 24 15 24 Q22 24 25 16" fill="#0050b3" opacity="0.5"/>
            <path d="M4 13 Q3 8 8 5 Q12 2 15 2 Q22 2 26 8 Q28 11 27 14" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <rect x="9" y="13" width="12" height="5" rx="2.5" fill="#0050b3" opacity="0.6"/>
            <rect x="10" y="14" width="10" height="3" rx="1.5" fill="white" opacity="0.4"/>
          </svg>
        </div>
      </div>
      <div className="flex-1 z-10 ad-slide-up min-w-0">
        <p className="text-blue-200 font-black text-base sm:text-lg leading-tight tracking-tight">
          FAN ZONE UNLOCKED
        </p>
        <p className="text-white/50 text-xs mt-1 leading-snug">Exclusive content and rewards for the true F1 faithful</p>
      </div>
      <div className="flex-shrink-0 z-10 ad-bounce-cta">
        <span className="block font-black text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-blue-400/50 text-blue-200"
          style={{ background: "rgba(0,112,243,0.2)", boxShadow: "0 0 12px rgba(0,112,243,0.25)" }}>
          ENTER →
        </span>
      </div>
    </div>
  );
}

/* ── Square variants (sidebar) ───────────────────────────────────────── */

function SquareSpeedLines() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 p-5 text-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0d0005 0%, #1a0008 50%, #3d0015 100%)" }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="ad-speed-line absolute h-px"
          style={{ width: `${50 + i * 10}%`, top: `${15 + i * 17}%`, background: "rgba(255,50,50,0.3)", animationDelay: `${i * 0.32}s` }} />
      ))}
      <div className="ad-pulse-ring absolute w-20 h-20 rounded-full border border-red-500/50" />
      <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/60 z-10">
        <svg width="26" height="18" viewBox="0 0 56 24" fill="none">
          <path d="M4 16 Q8 8 16 8 L38 6 Q46 5 50 10 L54 14 Q52 18 46 18 L38 19 Q30 20 22 19 L10 18 Q5 18 4 16Z" fill="white"/>
          <circle cx="14" cy="20" r="4" fill="#222"/>
          <circle cx="42" cy="20" r="4" fill="#222"/>
        </svg>
      </div>
      <p className="ad-shimmer-text font-black text-sm leading-tight z-10">FULL THROTTLE<br/>REWARDS</p>
      <span className="ad-bounce-cta block bg-red-600 text-white font-black text-xs rounded-lg px-4 py-2 z-10">GO NOW →</span>
    </div>
  );
}

function SquareTrophy() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 p-5 text-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #050014 0%, #0a001f 60%, #12002e 100%)" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(220,30,80,0.2) 0%, transparent 70%)" }} />
      <div className="ad-pulse-ring absolute w-20 h-20 rounded-full border border-yellow-400/40" />
      <div className="w-14 h-14 rounded-xl flex items-center justify-center z-10"
        style={{ background: "linear-gradient(135deg, #b8860b, #ffd700, #b8860b)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="ad-neon">
          <path d="M6 2h12v6a6 6 0 01-12 0V2z" fill="white" opacity="0.9"/>
          <path d="M4 2h2M18 2h2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 13v2M15 13v2M7 18h10l1 3H6l1-3z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-yellow-300 font-black text-sm leading-tight z-10 ad-neon">CHAMPION'S<br/>CLUB</p>
      <span className="ad-bounce-cta block font-black text-xs rounded-lg px-4 py-2 z-10 border border-yellow-400/60 text-yellow-300"
        style={{ background: "rgba(255,215,0,0.12)" }}>CLAIM IT →</span>
    </div>
  );
}

/* ── Pool & random pick ──────────────────────────────────────────────── */
const HORIZONTAL_CREATIVES = [
  CreativeSpeedLines,
  CreativeNeonPodium,
  CreativeCheckeredFlag,
  CreativeFireStart,
  CreativeHelmetSpin,
];

const SQUARE_CREATIVES = [
  SquareSpeedLines,
  SquareTrophy,
];

export default function AdBanner({ variant = "horizontal", className = "" }: AdBannerProps) {
  const Creative = useMemo(() => {
    const pool = variant === "square" ? SQUARE_CREATIVES : HORIZONTAL_CREATIVES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [variant]);

  return (
    <div className={`w-full ${variant === "square" ? "my-4" : "my-6"} ${className}`} aria-label="Advertisement">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 text-right pr-1">
        Advertisement
      </p>
      <a
        href={DIRECT_LINK}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block w-full rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 ${
          variant === "square" ? "aspect-square max-h-[280px]" : "h-[80px] sm:h-[88px]"
        }`}
        aria-label="Sponsored content"
      >
        <Creative />
      </a>
    </div>
  );
}
