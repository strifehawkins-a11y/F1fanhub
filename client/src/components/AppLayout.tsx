import { useLocation, Link } from "wouter";
import { Home, Brain, MessageSquare, Newspaper, Trophy, Heart, Settings } from "lucide-react";
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
  { path: "/leaderboard", label: "Board", icon: Trophy },
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
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
              <span className="font-racing text-primary-foreground text-xs font-bold tracking-tighter">F1</span>
            </div>
            <span className="font-racing text-foreground text-sm font-bold tracking-wide uppercase">Paddock</span>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <div className="flex items-center gap-1.5 bg-card border border-card-border rounded-full px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                <span className="font-racing text-xs font-bold text-foreground">{profile.totalPoints.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">PTS</span>
              </div>
            )}
            <Link href="/articles">
              <Avatar className="w-8 h-8 cursor-pointer" data-testid="link-profile">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-racing font-bold">
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
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/95 backdrop-blur border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === "/" ? location === "/" : location.startsWith(path);
            return (
              <Link key={path} href={path}>
                <button
                  data-testid={`nav-${label.toLowerCase()}`}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-150 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className={`relative ${isActive ? "animate-float" : ""}`}>
                    <Icon
                      className={`w-5 h-5 transition-all ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`}
                    />
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={`text-[10px] font-racing font-medium tracking-wide ${isActive ? "text-primary" : ""}`}>
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
