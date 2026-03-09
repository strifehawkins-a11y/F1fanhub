import { Button } from "@/components/ui/button";
import { Flag, Zap, Trophy, MessageSquare, BookOpen, Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Decorative speed lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        <div className="absolute top-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{ top: `${15 + i * 14}%`, width: "200%", left: "-50%" }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative">
        {/* Logo area */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
              <Flag className="w-10 h-10 text-primary-foreground stroke-[2.5]" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-racing font-black text-black">1</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-racing text-5xl font-black text-foreground tracking-tighter leading-none">
              F1 PADDOCK
            </h1>
            <div className="flex items-center gap-2 justify-center mt-1">
              <div className="h-px flex-1 bg-primary/40" />
              <p className="font-racing text-xs text-primary tracking-[0.3em] uppercase">2025 Season</p>
              <div className="h-px flex-1 bg-primary/40" />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-muted-foreground text-sm leading-relaxed max-w-xs mb-8">
          Your ultimate Formula 1 companion. Stats, quizzes, forums, and a racing story unlike any other.
        </p>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-10">
          {[
            { icon: Brain, label: "F1 Quiz", desc: "Test your knowledge" },
            { icon: MessageSquare, label: "Race Forum", desc: "Discuss every GP" },
            { icon: BookOpen, label: "Articles", desc: "Latest F1 news" },
            { icon: Trophy, label: "Leaderboard", desc: "Climb the ranks" },
            { icon: Heart, label: "Aria's Story", desc: "Visual novel sim" },
            { icon: Zap, label: "Daily Points", desc: "5000 pts per day" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-card border border-card-border rounded-lg p-3 flex gap-2.5 items-start"
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-racing text-xs font-bold text-foreground tracking-wide">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a href="/api/login">
            <Button
              className="w-full font-racing tracking-widest text-sm uppercase"
              size="lg"
              data-testid="button-login"
            >
              <Flag className="w-4 h-4 mr-2" />
              Enter the Paddock
            </Button>
          </a>
          <p className="text-center text-xs text-muted-foreground">
            Sign in with your Replit account — free forever
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
    </div>
  );
}

function Brain(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.18-1.32z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.96-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.18-1.32z" />
    </svg>
  );
}
