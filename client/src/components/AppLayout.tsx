import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Home, Brain, MessageSquare, Trophy, Heart, BookOpen, BarChart2, Shield, Menu, X, Zap, LogIn, UserPlus, LogOut, BarChart3, PenLine, Briefcase, Search, Mail, CheckCircle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ViewerCounter() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const es = new EventSource("/api/viewers");
    es.onmessage = (e) => setCount(Number(e.data));
    es.onerror = () => es.close();
    return () => es.close();
  }, []);
  if (count === null) return null;
  return (
    <div className="flex items-center gap-1.5" data-testid="viewer-counter">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="font-racing text-[10px] text-gray-400 tracking-wide uppercase">
        {count.toLocaleString()} {count === 1 ? "person" : "people"} online
      </span>
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setResults(data.articles || []);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex flex-col items-center pt-16 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-2xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search articles, race reports, analysis..."
            data-testid="input-search"
            className="flex-1 font-racing text-sm bg-transparent border-none outline-none placeholder:text-gray-400 text-gray-900"
          />
          {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {results.length > 0 ? (
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {results.map((a: any) => (
              <Link key={a.id} href={`/articles/${a.slug || a.id}`}>
                <div
                  onClick={onClose}
                  data-testid={`search-result-${a.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {a.imageUrl && (
                    <img
                      src={a.imageUrl} alt=""
                      className="w-12 h-10 object-cover rounded-md flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-racing text-sm font-bold text-gray-900 line-clamp-1">{a.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{a.excerpt}</p>
                  </div>
                  {a.section && (
                    <span className="font-racing text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full tracking-wide uppercase flex-shrink-0">
                      {a.section}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : query.length >= 2 && !loading ? (
          <div className="px-4 py-10 text-center">
            <p className="font-racing text-sm text-gray-500">No results for "<span className="text-gray-900">{query}</span>"</p>
            <p className="font-racing text-xs text-gray-400 mt-1 tracking-wide">Try different keywords</p>
          </div>
        ) : query.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400 font-racing tracking-widest uppercase">
            Start typing to search F1 Paddock
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BreakingTicker() {
  const { data: articles } = useQuery<any[]>({ queryKey: ["/api/articles"] });
  const items = (articles || []).slice(0, 10);
  if (items.length === 0) return null;
  const text = items.map((a: any) => a.title).join("   ·   ");

  return (
    <div className="bg-primary h-[26px] flex items-center overflow-hidden">
      <style>{`
        @keyframes f1-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="flex-shrink-0 font-racing text-[9px] font-black tracking-[0.2em] uppercase bg-black/20 text-white px-3 h-full flex items-center mr-0 whitespace-nowrap border-r border-white/20 z-10">
        LATEST
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div
          className="whitespace-nowrap text-white font-racing text-[11px] tracking-wide inline-block"
          style={{ animation: "f1-ticker 55s linear infinite" }}
        >
          &nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;
        </div>
      </div>
    </div>
  );
}

function NewsletterFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg(data.message || "");
      setStatus(data.success ? "success" : "error");
    } catch {
      setStatus("error");
      setMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/60 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-racing text-sm font-black text-gray-900 tracking-wide">Weekly Paddock Newsletter</p>
              <p className="font-racing text-[10px] text-gray-500 tracking-wide">Race previews, standings & exclusive F1 analysis</p>
            </div>
          </div>

          {status === "success" ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-racing text-xs font-bold">{msg || "You're subscribed!"}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                data-testid="input-newsletter-email"
                className="font-racing text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary/40 transition-colors w-52 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                data-testid="button-newsletter-subscribe"
                className="font-racing text-[10px] font-black tracking-wide bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="font-racing text-[10px] text-red-500">{msg}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "News", icon: Home },
  { path: "/standings", label: "Standings", icon: BarChart2 },
  { path: "/articles", label: "Articles", icon: BookOpen },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/forum", label: "Forum", icon: MessageSquare },
  { path: "/polls", label: "Polls", icon: BarChart3 },
  { path: "/quiz", label: "Quiz", icon: Brain },
  { path: "/novel", label: "Gina", icon: Heart },
  { path: "/leaderboard", label: "Rankings", icon: Trophy },
  { path: "/jobs", label: "Jobs", icon: Briefcase },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const displayName = (user as any)?.firstName || (user as any)?.displayName || "Pilot";
  const initials = displayName.charAt(0).toUpperCase();
  const isActive = (path: string) => path === "/" ? location === "/" : location.startsWith(path);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    queryClient.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-[9999] bg-white border-b border-gray-100 shadow-sm">
        {/* F1 red top stripe */}
        <div className="h-[5px] bg-primary w-full" />
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

            <div className="hidden md:block h-5 w-px bg-gray-200 mx-1" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
              {navItems.map(({ path, label }) => (
                <Link key={path} href={path}>
                  <button
                    data-testid={`nav-${label.toLowerCase()}`}
                    className={`px-2.5 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                      isActive(path)
                        ? "text-primary bg-primary/8 border border-primary/15"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                </Link>
              ))}
              {profile?.isAdmin && (
                <Link href="/admin">
                  <button className={`px-2.5 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide transition-all ${
                    isActive("/admin")
                      ? "text-primary bg-primary/8 border border-primary/15"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}>
                    Admin
                  </button>
                </Link>
              )}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                data-testid="button-search"
                title="Search (⌘K)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden lg:block font-racing text-[10px] tracking-wide text-gray-400">⌘K</span>
              </button>

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
                  <Link href="/submit-story">
                    <button
                      data-testid="button-submit-story"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide bg-primary text-white hover:bg-red-700 transition-all shadow-sm shadow-primary/20"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Submit Story
                    </button>
                  </Link>
                  <Link href="/leaderboard">
                    <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-gray-100 hover:ring-primary/40 transition-all" data-testid="link-profile">
                      <AvatarImage src={(user as any)?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-primary text-white text-xs font-racing font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <button
                    data-testid="button-logout"
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
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
                className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
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
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                      isActive("/admin") ? "text-primary bg-primary/8" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
                className="w-full flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg font-racing text-[10px] font-bold tracking-wide text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              {user ? (
                <>
                  <Link href="/submit-story">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="button-submit-story-mobile"
                      className="w-full flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg font-racing text-[10px] font-bold tracking-wide text-primary bg-primary/8 hover:bg-primary/15 transition-all"
                    >
                      <PenLine className="w-4 h-4" />
                      Submit
                    </button>
                  </Link>
                  <button
                    data-testid="button-logout-mobile"
                    onClick={handleLogout}
                    className="w-full flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg font-racing text-[10px] font-bold tracking-wide text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
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

        {/* Breaking news ticker */}
        <BreakingTicker />
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Newsletter + Footer */}
      <NewsletterFooter />

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="font-racing text-white text-[9px] font-black tracking-tighter">F1</span>
              </div>
              <span className="font-racing text-gray-500 text-xs tracking-widest uppercase">Paddock</span>
              <span className="text-gray-200 text-xs">·</span>
              <span className="font-racing text-[10px] text-gray-400">© {new Date().getFullYear()} F1 Paddock</span>
            </div>

            <ViewerCounter />

            <nav className="flex items-center gap-4 flex-wrap">
              {[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/rss.xml", label: "RSS Feed", external: true },
              ].map(({ href, label, external }, i, arr) => (
                <span key={href} className="flex items-center gap-4">
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      <span className="font-racing text-[10px] text-gray-400 hover:text-primary transition-colors tracking-wide uppercase cursor-pointer">{label}</span>
                    </a>
                  ) : (
                    <Link href={href}>
                      <span className="font-racing text-[10px] text-gray-400 hover:text-primary transition-colors tracking-wide uppercase cursor-pointer">{label}</span>
                    </Link>
                  )}
                  {i < arr.length - 1 && <span className="text-gray-200 text-xs">·</span>}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
