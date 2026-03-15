import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { SiFacebook } from "react-icons/si";
import { Flag, Eye, EyeOff, Zap, Trophy, MessageSquare, BookOpen, Heart, BarChart2, Menu, X } from "lucide-react";

type Mode = "hero" | "signin" | "signup";

export default function Landing() {
  const { data: authConfig } = useQuery<{ facebookAuthEnabled: boolean }>({
    queryKey: ["/api/auth/config"],
  });
  const facebookEnabled = authConfig?.facebookAuthEnabled === true;
  const [mode, setMode] = useState<Mode>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* F1 Red top stripe */}
      <div className="h-1 bg-primary w-full flex-shrink-0" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            {/* Logo */}
            <button onClick={() => { setMode("hero"); setMobileMenuOpen(false); }} className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                <span className="font-racing text-white text-[10px] font-black tracking-tighter">F1</span>
              </div>
              <span className="font-racing text-foreground font-bold tracking-widest text-sm uppercase hidden sm:block">Paddock</span>
            </button>

            {/* Preview nav links (greyed out, for aesthetics) */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {[
                { label: "News", icon: Flag },
                { label: "Standings", icon: BarChart2 },
                { label: "Forum", icon: MessageSquare },
                { label: "Quiz", icon: Zap },
                { label: "Rankings", icon: Trophy },
              ].map(({ label }) => (
                <button
                  key={label}
                  onClick={() => setMode("signin")}
                  className="px-3 py-1.5 rounded font-racing text-xs font-bold tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                data-testid="button-signin-nav"
                onClick={() => { setMode("signin"); setMobileMenuOpen(false); }}
                className={`px-4 py-1.5 rounded font-racing text-xs font-bold tracking-wide border transition-all ${
                  mode === "signin"
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                Sign In
              </button>
              <button
                data-testid="button-signup-nav"
                onClick={() => { setMode("signup"); setMobileMenuOpen(false); }}
                className={`px-4 py-1.5 rounded font-racing text-xs font-bold tracking-wide transition-all ${
                  mode === "signup"
                    ? "bg-primary text-white"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                Sign Up
              </button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-1.5 rounded text-muted-foreground hover:text-foreground ml-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {["News", "Standings", "Forum", "Quiz", "Rankings"].map((label) => (
                <button
                  key={label}
                  onClick={() => { setMode("signin"); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 rounded font-racing text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {label}
                </button>
              ))}
              <div className="border-t border-border my-1" />
              <button onClick={() => { setMode("signin"); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded font-racing text-sm font-bold text-foreground hover:bg-muted transition-all">
                Sign In
              </button>
              <button onClick={() => { setMode("signup"); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded font-racing text-sm font-bold text-primary hover:bg-primary/10 transition-all">
                Sign Up Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content area */}
      {mode === "hero" ? (
        <HeroContent onSignUp={() => setMode("signup")} onSignIn={() => setMode("signin")} facebookEnabled={facebookEnabled} />
      ) : (
        <AuthPanel mode={mode} onSwitch={setMode} facebookEnabled={facebookEnabled} />
      )}

      {/* Footer red stripe */}
      <div className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 flex-shrink-0 mt-auto" />
    </div>
  );
}

function HeroContent({
  onSignUp,
  onSignIn,
  facebookEnabled,
}: {
  onSignUp: () => void;
  onSignIn: () => void;
  facebookEnabled: boolean;
}) {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col md:flex-row md:items-center gap-10">
          {/* Text */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-racing text-[11px] text-primary tracking-[0.3em] uppercase font-bold">Live Season · 2026</span>
            </div>
            <h1 className="font-racing text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-5">
              The Ultimate<br />
              <span className="text-primary">F1 Fan</span><br />
              Experience.
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md">
              Race stats, live forums, quizzes, leaderboards, and Bea's visual novel — all in one place for the real F1 fan.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                data-testid="button-hero-signup"
                onClick={onSignUp}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
              >
                Join Free — Takes 30 Seconds
              </button>
              <button
                onClick={onSignIn}
                className="flex items-center gap-2 px-6 py-3 border border-border text-foreground font-racing text-sm font-bold tracking-wide rounded-lg hover:border-primary hover:text-primary transition-all"
              >
                Sign In
              </button>
            </div>
            {facebookEnabled && (
              <a href="/api/auth/facebook" className="inline-block mt-3">
                <button
                  data-testid="button-login-facebook"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-racing text-sm font-bold tracking-wide bg-[#1877F2] text-white hover:bg-[#1565D8] transition-all"
                >
                  <SiFacebook className="w-4 h-4" />
                  Continue with Facebook
                </button>
              </a>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex md:flex-col gap-4 flex-shrink-0">
            {[
              { label: "Active Fans", value: "12K+" },
              { label: "Race Threads", value: "340+" },
              { label: "Quiz Questions", value: "500+" },
            ].map(({ label, value }) => (
              <div key={label} className="border border-border rounded-xl p-5 text-center min-w-[100px]">
                <div className="font-racing text-3xl font-black text-primary">{value}</div>
                <div className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red banner */}
      <section className="bg-primary py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-6">
          {["Live Standings", "Race Forum", "F1 Quiz", "Bea's Story", "Daily 5K Points"].map((item) => (
            <span key={item} className="font-racing text-white/90 text-xs tracking-[0.2em] uppercase font-bold">{item}</span>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-racing text-2xl font-black text-foreground tracking-tight mb-8">
            Everything an F1 fan needs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: BarChart2, label: "Championship Standings", desc: "Live 2026 driver & constructor tables after every race." },
              { icon: MessageSquare, label: "Race Forum", desc: "Dedicated threads for every Grand Prix on the 2026 calendar." },
              { icon: BrainIcon, label: "F1 Quiz", desc: "Test your F1 knowledge and earn points on the leaderboard." },
              { icon: Trophy, label: "Leaderboard", desc: "Compete with fans worldwide for the top spot." },
              { icon: BookOpen, label: "News & Analysis", desc: "Editorial articles: race reports, previews, driver interviews." },
              { icon: Heart, label: "Bea's Visual Novel", desc: "A unique story following rookie driver Bea Voss through her first F1 season." },
            ].map(({ icon: Icon, label, desc }) => (
              <button
                key={label}
                onClick={onSignUp}
                className="bg-white border border-border rounded-xl p-5 text-left hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-racing text-sm font-bold text-foreground tracking-wide mb-1">{label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-racing text-3xl font-black text-foreground tracking-tight mb-3">
            Ready to join the Paddock?
          </h2>
          <p className="text-muted-foreground mb-6">Free forever. No credit card required.</p>
          <button
            onClick={onSignUp}
            className="px-8 py-3.5 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
          >
            Create Your Free Account
          </button>
        </div>
      </section>
    </div>
  );
}

function AuthPanel({
  mode,
  onSwitch,
  facebookEnabled,
}: {
  mode: "signin" | "signup";
  onSwitch: (m: Mode) => void;
  facebookEnabled: boolean;
}) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "signup"
        ? { email, password, displayName }
        : { email, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || (mode === "signup" ? "Registration failed" : "Login failed"));
      } else {
        await queryClient.invalidateQueries();
        window.location.href = "/";
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {/* Tab switcher */}
        <div className="flex bg-muted rounded-xl p-1 mb-8">
          <button
            onClick={() => { onSwitch("signin"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all ${
              mode === "signin" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            data-testid="button-tab-signup"
            onClick={() => { onSwitch("signup"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all ${
              mode === "signup" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Heading */}
        <h1 className="font-racing text-3xl font-black text-foreground tracking-tight mb-1">
          {mode === "signup" ? "Join the Paddock" : "Welcome Back"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {mode === "signup"
            ? "Create your free F1 Paddock account"
            : "Sign in to your F1 Paddock account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
                Your Name
              </label>
              <input
                data-testid="input-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                placeholder="Max Verstappen"
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
              Email
            </label>
            <input
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                data-testid="input-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 6 : undefined}
                placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === "signup" && (
              <p className="text-[10px] text-muted-foreground mt-1">Minimum 6 characters</p>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2.5">
              <p className="text-destructive text-xs font-racing">{error}</p>
            </div>
          )}

          <button
            data-testid={mode === "signup" ? "button-submit-register" : "button-submit-login"}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/20"
          >
            {loading
              ? (mode === "signup" ? "Creating Account..." : "Signing In...")
              : (mode === "signup" ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground font-racing tracking-widest">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          {facebookEnabled && (
            <a href="/api/auth/facebook">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-racing text-sm font-bold tracking-wide bg-[#1877F2] text-white hover:bg-[#1565D8] transition-all">
                <SiFacebook className="w-4 h-4" />
                Continue with Facebook
              </button>
            </a>
          )}
          <a href="/api/login">
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-lg font-racing text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
              <Flag className="w-4 h-4" />
              Continue with Replit
            </button>
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {mode === "signup" ? (
            <>Already have an account?{" "}
              <button onClick={() => onSwitch("signin")} className="text-primary font-racing font-bold hover:underline">
                Sign in
              </button>
            </>
          ) : (
            <>No account?{" "}
              <button onClick={() => onSwitch("signup")} className="text-primary font-racing font-bold hover:underline">
                Create one free
              </button>
            </>
          )}
        </p>
      </div>
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
