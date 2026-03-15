import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Home, Brain, MessageSquare, Trophy, Heart, BookOpen, BarChart2, Shield, Menu, X, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "News", icon: Home },
  { path: "/standings", label: "Standings", icon: BarChart2 },
  { path: "/articles", label: "Articles", icon: BookOpen },
  { path: "/forum", label: "Forum", icon: MessageSquare },
  { path: "/quiz", label: "Quiz", icon: Brain },
  { path: "/novel", label: "Bea", icon: Heart },
  { path: "/leaderboard", label: "Rankings", icon: Trophy },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const displayName = (user as any)?.firstName || (user as any)?.displayName || "Pilot";
  const initials = displayName.charAt(0).toUpperCase();

  const isActive = (path: string) => path === "/" ? location === "/" : location.startsWith(path);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-0.5 bg-primary w-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/98 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                  <span className="font-racing text-white text-[10px] font-black tracking-tighter">F1</span>
                </div>
                <span className="font-racing text-foreground font-bold tracking-widest text-sm uppercase hidden sm:block">Paddock</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {navItems.map(({ path, label }) => (
                <Link key={path} href={path}>
                  <button
                    data-testid={`nav-${label.toLowerCase()}`}
                    className={`px-3 py-1.5 rounded font-racing text-xs font-bold tracking-wide transition-all ${
                      isActive(path)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    {label}
                  </button>
                </Link>
              ))}
              {profile?.isAdmin && (
                <Link href="/admin">
                  <button className={`px-3 py-1.5 rounded font-racing text-xs font-bold tracking-wide transition-all ${
                    isActive("/admin") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}>
                    Admin
                  </button>
                </Link>
              )}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 ml-auto">
              {profile && (
                <div className="hidden sm:flex items-center gap-1.5 bg-card border border-border rounded-md px-2.5 py-1.5">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="font-racing text-xs font-bold text-foreground tabular-nums">
                    {profile.totalPoints.toLocaleString()}
                  </span>
                  <span className="font-racing text-[9px] text-muted-foreground tracking-widest">PTS</span>
                </div>
              )}
              <Link href="/leaderboard">
                <Avatar className="w-8 h-8 cursor-pointer ring-1 ring-border hover:ring-primary transition-all" data-testid="link-profile">
                  <AvatarImage src={(user as any)?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-card text-foreground text-xs font-racing font-bold border border-border">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-1.5 rounded text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/98">
            <div className="max-w-7xl mx-auto px-4 py-2 grid grid-cols-4 gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} href={path}>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex flex-col items-center gap-1 px-2 py-2 rounded font-racing text-[10px] font-bold tracking-wide transition-all ${
                      isActive(path) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                </Link>
              ))}
              {profile?.isAdmin && (
                <Link href="/admin">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex flex-col items-center gap-1 px-2 py-2 rounded font-racing text-[10px] font-bold tracking-wide transition-all ${
                      isActive("/admin") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
