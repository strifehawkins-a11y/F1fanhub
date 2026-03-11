import { useQuery } from "@tanstack/react-query";
import { SiGoogle } from "react-icons/si";
import { Flag, Zap, Trophy, MessageSquare, BookOpen, Heart } from "lucide-react";

export default function Landing() {
  const { data: authConfig } = useQuery<{ googleAuthEnabled: boolean }>({
    queryKey: ["/api/auth/config"],
  });

  const googleEnabled = authConfig?.googleAuthEnabled === true;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Top red F1 bar */}
      <div className="h-1 bg-primary w-full flex-shrink-0" />

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="font-racing text-white text-xs font-black tracking-tighter">F1</span>
          </div>
          <span className="font-racing text-foreground font-bold tracking-widest text-sm uppercase">Paddock</span>
        </div>
        <span className="font-racing text-xs text-muted-foreground tracking-widest uppercase border border-border rounded px-2 py-1">
          2025 · 2026
        </span>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-4 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(350 90% 42% / 0.12) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-32 left-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(220 90% 55% / 0.06) 0%, transparent 70%)" }}
        />

        {/* Season badge */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-racing text-[10px] text-primary tracking-[0.3em] uppercase font-bold">Live Season 2026</span>
        </div>

        {/* Title */}
        <h1 className="font-racing text-[2.8rem] font-black text-foreground tracking-tighter leading-[0.92] mb-4">
          The Ultimate<br />
          <span className="text-primary">F1 Fan</span><br />
          Experience.
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
          Race stats, live forums, quizzes, leaderboards, and Bea's visual novel — all in one place.
        </p>

        {/* Sign-in buttons */}
        <div className="flex flex-col gap-3 mb-8">
          {googleEnabled && (
            <a href="/api/auth/google" className="block">
              <button
                data-testid="button-login-google"
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              >
                <SiGoogle className="w-4 h-4" />
                Continue with Google
              </button>
            </a>
          )}
          <a href="/api/login" className="block">
            <button
              data-testid="button-login"
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Flag className="w-4 h-4" />
              {googleEnabled ? "Sign in with Replit" : "Enter the Paddock"}
            </button>
          </a>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mb-8">
          Free to join · No subscription required
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: BrainIcon, label: "F1 Quiz", desc: "Test your knowledge, earn points" },
            { icon: MessageSquare, label: "Race Forum", desc: "Discuss every Grand Prix" },
            { icon: Trophy, label: "Leaderboard", desc: "Compete with the world" },
            { icon: BookOpen, label: "Articles", desc: "Latest F1 news & analysis" },
            { icon: Heart, label: "Bea's Story", desc: "Visual novel with rookie driver" },
            { icon: Zap, label: "Daily Points", desc: "Claim 5,000 pts every day" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-card border border-card-border rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="font-racing text-xs font-bold text-foreground tracking-wide leading-tight">{label}</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom red F1 bar */}
      <div className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 flex-shrink-0" />
    </div>
  );
}

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.18-1.32z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.96-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.18-1.32z" />
    </svg>
  );
}
