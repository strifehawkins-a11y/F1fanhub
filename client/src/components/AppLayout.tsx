import { useLocation, Link } from "wouter";
import { Home, Brain, MessageSquare, Trophy, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/quiz", label: "Quiz", icon: Brain },
  { path: "/forum", label: "Forum", icon: MessageSquare },
  { path: "/novel", label: "Bea", icon: Heart },
  { path: "/leaderboard", label: "Ranks", icon: Trophy },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const displayName = user?.firstName || "Pilot";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto relative">
      {/* Top red accent bar */}
      <div className="h-0.5 bg-primary w-full flex-shrink-0" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/98 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center flex-shrink-0">
                <span className="font-racing text-white text-[10px] font-black tracking-tighter">F1</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-racing text-foreground text-sm font-bold tracking-widest uppercase">Paddock</span>
              </div>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {profile && (
              <div className="flex items-center gap-1.5 bg-card border border-card-border rounded-md px-2.5 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-racing text-xs font-bold text-foreground tabular-nums">
                  {profile.totalPoints.toLocaleString()}
                </span>
                <span className="font-racing text-[9px] text-muted-foreground tracking-widest">PTS</span>
              </div>
            )}
            <Link href="/articles">
              <Avatar className="w-8 h-8 cursor-pointer ring-1 ring-border hover:ring-primary transition-all" data-testid="link-profile">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-card text-foreground text-xs font-racing font-bold border border-border">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/98 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === "/" ? location === "/" : location.startsWith(path);
            return (
              <Link key={path} href={path}>
                <button
                  data-testid={`nav-${label.toLowerCase()}`}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all min-w-[52px] ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-[18px] h-[18px] transition-all ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={`text-[9px] font-racing font-bold tracking-widest uppercase mt-0.5 ${isActive ? "text-primary" : ""}`}>
                    {label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
