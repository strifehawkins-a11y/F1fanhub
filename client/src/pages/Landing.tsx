import { useQuery } from "@tanstack/react-query";
import { SiFacebook } from "react-icons/si";
import { Link } from "wouter";
import { Flag, Zap, Trophy, MessageSquare, BookOpen, Heart, UserPlus, LogIn } from "lucide-react";

export default function Landing() {
  const { data: authConfig } = useQuery<{ facebookAuthEnabled: boolean }>({
    queryKey: ["/api/auth/config"],
  });

  const facebookEnabled = authConfig?.facebookAuthEnabled === true;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
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
          2026 Season
        </span>
      </header>

      <div className="flex-1 flex flex-col px-5 pt-4 pb-4 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(350 90% 42% / 0.12) 0%, transparent 70%)" }}
        />

        {/* Season badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-racing text-[10px] text-primary tracking-[0.3em] uppercase font-bold">Live Season 2026</span>
        </div>

        {/* Title */}
        <h1 className="font-racing text-[2.6rem] font-black text-foreground tracking-tighter leading-[0.92] mb-3">
          The Ultimate<br />
          <span className="text-primary">F1 Fan</span><br />
          Experience.
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
          Race stats, live forums, quizzes, leaderboards, and Bea's visual novel — all in one place.
        </p>

        {/* Primary sign-in options */}
        <div className="flex flex-col gap-2.5 mb-4">
          {facebookEnabled && (
            <a href="/api/auth/facebook" className="block">
              <button
                data-testid="button-login-facebook"
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all bg-[#1877F2] text-white hover:bg-[#1565D8] shadow-lg"
              >
                <SiFacebook className="w-4 h-4" />
                Continue with Facebook
              </button>
            </a>
          )}

          {/* Internal auth buttons */}
          <div className="flex gap-2.5">
            <Link href="/register" className="flex-1">
              <button
                data-testid="button-register"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </Link>
            <Link href="/login" className="flex-1">
              <button
                data-testid="button-login"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all bg-card border border-card-border text-foreground hover:border-primary/50 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            </Link>
          </div>

          <a href="/api/login" className="block">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-racing text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all">
              <Flag className="w-3.5 h-3.5" />
              Continue with Replit
            </button>
          </a>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mb-6">
          Free to join · No subscription required
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: BrainIcon, label: "F1 Quiz", desc: "Test your knowledge, earn points" },
            { icon: MessageSquare, label: "Race Forum", desc: "Discuss every Grand Prix" },
            { icon: Trophy, label: "Leaderboard", desc: "Compete with the world" },
            { icon: BookOpen, label: "Articles", desc: "Latest F1 news & analysis" },
            { icon: Heart, label: "Bea's Story", desc: "Visual novel with rookie driver" },
            { icon: Zap, label: "Daily Points", desc: "Claim 5,000 pts every day" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border border-card-border rounded-lg p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 text-primary" />
                </div>
                <p className="font-racing text-xs font-bold text-foreground tracking-wide leading-tight">{label}</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

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
