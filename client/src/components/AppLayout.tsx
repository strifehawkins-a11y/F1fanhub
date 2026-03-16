import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Home, Brain, MessageSquare, Trophy, Heart, BookOpen, BarChart2, Shield, Menu, X, Zap, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const displayName = (user as any)?.firstName || (user as any)?.displayName || "Pilot";
  const initials = displayName.charAt(0).toUpperCase();

  const isActive = (path: string) => path === "/" ? location === "/" : location.startsWith(path);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* F1 red top stripe */}
      <div className="h-1 bg-primary w-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-3">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0">
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
                  <span className="font-racing text-white text-[10px] font-black tracking-tighter">F1</span>
                </div>
                <span className="font-racing text-gray-900 font-bold tracking-[0.2em] text-sm uppercase hidden sm:block">Paddock</span>
              </div>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-gray-200 mx-1" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {navItems.map(({ path, label }) => (
                <Link key={path} href={path}>
                  <button
                    data-testid={`nav-${label.toLowerCase()}`}
                    className={`px-3 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide transition-all ${
                      isActive(path)
                        ? "text-primary bg-primary/8 border border-primary/15"
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                </Link>
              ))}
              {profile?.isAdmin && (
                <Link href="/admin">
                  <button className={`px-3 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide transition-all ${
                    isActive("/admin")
                      ? "text-primary bg-primary/8 border border-primary/15"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                  }`}>
                    Admin
                  </button>
                </Link>
              )}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 ml-auto">
              {user ? (
                <>
                  {profile && (
                    <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-racing text-xs font-black text-gray-900 tabular-nums">
                        {profile.totalPoints.toLocaleString()}
                      </span>
                      <span className="font-racing text-[9px] text-gray-400 tracking-widest">PTS</span>
                    </div>
                  )}
                  {/* Avatar with dropdown */}
                  <div ref={userMenuRef} className="relative">
                    <button
                      data-testid="button-user-menu"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="focus:outline-none"
                    >
                      <Avatar
                        className="w-8 h-8 cursor-pointer ring-2 ring-gray-100 hover:ring-primary/40 transition-all"
                        data-testid="link-profile"
                      >
                        <AvatarImage src={(user as any)?.profileImageUrl || ""} />
                        <AvatarFallback className="bg-primary text-white text-xs font-racing font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="font-racing text-xs font-black text-gray-900 truncate">{displayName}</p>
                          {profile && (
                            <p className="font-racing text-[10px] text-primary mt-0.5">{profile.totalPoints.toLocaleString()} pts</p>
                          )}
                        </div>
                        <Link href="/leaderboard">
                          <button
                            data-testid="menu-item-profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left font-racing text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            Profile & Rankings
                          </button>
                        </Link>
                        <button
                          data-testid="button-logout"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left font-racing text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <button
                      data-testid="button-guest-signin"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </button>
                  </Link>
                  <Link href="/login">
                    <button
                      data-testid="button-guest-signup"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide bg-primary text-white hover:bg-red-700 transition-all shadow-sm shadow-primary/20"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Join Free
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-4 gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} href={path}>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg font-racing text-[10px] font-bold tracking-wide transition-all ${
                      isActive(path)
                        ? "text-primary bg-primary/8"
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
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
                    className={`w-full flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg font-racing text-[10px] font-bold tracking-wide transition-all ${
                      isActive("/admin")
                        ? "text-primary bg-primary/8"
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </Link>
              )}
              {user ? (
                <button
                  data-testid="button-logout-mobile"
                  onClick={handleLogout}
                  className="w-full flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg font-racing text-[10px] font-bold tracking-wide text-red-500 hover:bg-red-50 transition-all col-span-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link href="/login">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg font-racing text-[10px] font-bold tracking-wide text-primary bg-primary/8 transition-all col-span-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In / Join
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Guest sign-in banner */}
      {!user && (
        <div className="bg-primary text-white px-4 py-2 flex items-center justify-between gap-3 text-center">
          <p className="font-racing text-xs tracking-wide flex-1">
            🏎️ Join F1 Paddock — earn points, unlock Bea's story, compete in quizzes &amp; climb the leaderboard
          </p>
          <Link href="/login">
            <button
              data-testid="button-guest-banner-join"
              className="flex-shrink-0 px-3 py-1 rounded-md font-racing text-xs font-bold bg-white text-primary hover:bg-gray-100 transition-all"
            >
              Join Free →
            </button>
          </Link>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
