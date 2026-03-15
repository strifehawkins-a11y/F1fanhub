import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiFacebook } from "react-icons/si";
import { Flag, Eye, EyeOff, Zap, Trophy, MessageSquare, BookOpen, Heart, BarChart2, Menu, X, ChevronRight } from "lucide-react";
import videoSrc from "@assets/generated_videos/bea-grid-flag.mp4";

type Mode = "hero" | "signin" | "signup";

export default function Landing() {
  const { data: authConfig } = useQuery<{ facebookAuthEnabled: boolean }>({
    queryKey: ["/api/auth/config"],
  });
  const facebookEnabled = authConfig?.facebookAuthEnabled === true;
  const [mode, setMode] = useState<Mode>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* F1 red top bar */}
      <div className="h-1 bg-primary w-full flex-shrink-0 z-50 relative" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <button
              onClick={() => { setMode("hero"); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
                <span className="font-racing text-white text-[11px] font-black tracking-tighter">F1</span>
              </div>
              <span className="font-racing text-gray-900 font-bold tracking-[0.2em] text-sm uppercase hidden sm:block">Paddock</span>
            </button>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-2">
              {["News", "Standings", "Forum", "Quiz", "Rankings"].map((label) => (
                <button
                  key={label}
                  onClick={() => setMode("signin")}
                  className="px-3 py-1.5 rounded-md font-racing text-xs font-bold tracking-wide text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                data-testid="button-signin-nav"
                onClick={() => { setMode("signin"); setMobileMenuOpen(false); }}
                className={`px-4 py-2 rounded-md font-racing text-xs font-bold tracking-wide border transition-all ${
                  mode === "signin"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-700 hover:border-primary hover:text-primary bg-white"
                }`}
              >
                Sign In
              </button>
              <button
                data-testid="button-signup-nav"
                onClick={() => { setMode("signup"); setMobileMenuOpen(false); }}
                className={`px-4 py-2 rounded-md font-racing text-xs font-bold tracking-wide transition-all shadow-sm ${
                  mode === "signup"
                    ? "bg-primary text-white shadow-primary/30"
                    : "bg-primary text-white hover:bg-red-700 shadow-primary/20"
                }`}
              >
                Sign Up Free
              </button>
              <button
                className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col gap-0.5">
              {["News", "Standings", "Forum", "Quiz", "Rankings"].map((label) => (
                <button
                  key={label}
                  onClick={() => { setMode("signin"); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2.5 rounded-md font-racing text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  {label}
                </button>
              ))}
              <div className="border-t border-gray-100 my-2" />
              <button onClick={() => { setMode("signin"); setMobileMenuOpen(false); }} className="text-left px-3 py-2.5 rounded-md font-racing text-sm font-bold text-gray-900 hover:bg-gray-50">Sign In</button>
              <button onClick={() => { setMode("signup"); setMobileMenuOpen(false); }} className="text-left px-3 py-2.5 rounded-md font-racing text-sm font-bold text-primary hover:bg-red-50">Sign Up Free</button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      {mode === "hero" ? (
        <HeroContent
          videoEnded={videoEnded}
          onVideoEnded={() => setVideoEnded(true)}
          onSignUp={() => setMode("signup")}
          onSignIn={() => setMode("signin")}
          facebookEnabled={facebookEnabled}
        />
      ) : (
        <AuthPanel mode={mode} onSwitch={setMode} facebookEnabled={facebookEnabled} />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="font-racing text-white text-[9px] font-black tracking-tighter">F1</span>
            </div>
            <span className="font-racing text-white/80 font-bold tracking-widest text-xs uppercase">Paddock</span>
          </div>
          <p className="font-racing text-xs text-gray-500 tracking-widest">© 2026 F1 Paddock · Fan site · Not affiliated with Formula 1</p>
          <div className="h-0.5 w-8 bg-primary rounded" />
        </div>
      </footer>
    </div>
  );
}

function HeroContent({
  videoEnded,
  onVideoEnded,
  onSignUp,
  onSignIn,
  facebookEnabled,
}: {
  videoEnded: boolean;
  onVideoEnded: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  facebookEnabled: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="flex-1">
      {/* ── Hero with video background ── */}
      <section className="relative overflow-hidden bg-white min-h-[560px] md:min-h-[640px] flex items-center">
        {/* Video layer */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          onEnded={onVideoEnded}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{
            opacity: videoEnded ? 0 : 0.18,
            transition: "opacity 1.4s ease-out",
          }}
        />

        {/* Gradient overlays — maintain readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-16 w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-12">
            {/* Left: copy */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-3.5 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-racing text-[10px] text-primary tracking-[0.3em] uppercase font-bold">2026 Season · Live Now</span>
              </div>

              <h1 className="font-racing text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.88] mb-6">
                The Ultimate<br />
                <span className="text-primary">F1 Fan</span><br />
                Experience.
              </h1>

              <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
                Race stats, live forums, quizzes, leaderboards, and Bea's visual novel — all in one place for the real F1 fan.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  data-testid="button-hero-signup"
                  onClick={onSignUp}
                  className="flex items-center gap-2.5 px-6 py-3.5 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-red-700 shadow-lg shadow-primary/25 transition-all group"
                >
                  Join Free
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-2.5 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-racing text-sm font-bold tracking-wide rounded-lg hover:border-primary hover:text-primary transition-all"
                >
                  Sign In
                </button>
              </div>

              {facebookEnabled && (
                <a href="/api/auth/facebook" className="inline-block mt-4">
                  <button
                    data-testid="button-login-facebook"
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-racing text-sm font-bold bg-[#1877F2] text-white hover:bg-[#1565D8] transition-all"
                  >
                    <SiFacebook className="w-4 h-4" />
                    Continue with Facebook
                  </button>
                </a>
              )}

              <p className="text-xs text-gray-400 mt-4 font-racing tracking-wide">Free forever · No credit card needed</p>
            </div>

            {/* Right: stat cards */}
            <div className="flex gap-4 md:flex-col flex-shrink-0">
              {[
                { label: "Active Fans", value: "12K+" },
                { label: "Race Threads", value: "340+" },
                { label: "Quiz Questions", value: "500+" },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 md:flex-none bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-5 text-center min-w-[90px]">
                  <div className="font-racing text-3xl font-black text-primary">{value}</div>
                  <div className="font-racing text-[10px] text-gray-400 tracking-[0.2em] uppercase mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Red ticker band ── */}
      <div className="bg-primary py-3.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-wrap items-center gap-x-8 gap-y-1">
          {["Live Standings", "Race Forum", "F1 Quiz", "Bea's Story", "Daily 5,000 Points Reward", "2026 Calendar"].map((item) => (
            <span key={item} className="font-racing text-white text-[11px] tracking-[0.22em] uppercase font-bold whitespace-nowrap">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Feature grid ── */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="mb-10">
            <span className="font-racing text-[11px] text-primary tracking-[0.3em] uppercase font-bold">What's inside</span>
            <h2 className="font-racing text-3xl font-black text-gray-900 tracking-tight mt-1">
              Everything an F1 fan needs
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: BarChart2, label: "Championship Standings", desc: "Live 2026 driver & constructor tables, updated after every race." },
              { icon: MessageSquare, label: "Race Forum", desc: "Dedicated discussion threads for every Grand Prix on the calendar." },
              { icon: BrainIcon, label: "F1 Quiz", desc: "Test your knowledge across 500+ questions and climb the leaderboard." },
              { icon: Trophy, label: "Leaderboard", desc: "Earn points, compete with global fans, and claim the top spot." },
              { icon: BookOpen, label: "News & Analysis", desc: "Race reports, driver interviews, technical analysis — all editorial." },
              { icon: Heart, label: "Bea's Visual Novel", desc: "Follow Bea Voss — rookie driver, big dreams — through her first F1 season." },
            ].map(({ icon: Icon, label, desc }) => (
              <button
                key={label}
                onClick={onSignUp}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-racing text-sm font-bold text-gray-900 tracking-wide mb-1.5">{label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="font-racing text-[11px] text-primary tracking-[0.2em] uppercase font-bold">5,000 daily points waiting for you</span>
          </div>
          <h2 className="font-racing text-4xl font-black text-gray-900 tracking-tight mb-3">
            Start your season
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Join thousands of F1 fans already earning points, debating races, and following Bea's story.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSignUp}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-red-700 shadow-lg shadow-primary/25 transition-all group"
            >
              Create Free Account
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a href="/api/login">
              <button className="flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-600 font-racing text-sm font-bold tracking-wide rounded-lg hover:border-gray-300 transition-all">
                <Flag className="w-4 h-4" />
                Continue with Replit
              </button>
            </a>
          </div>
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
    <div className="flex-1 flex items-start justify-center py-12 px-5 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 p-8">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => { onSwitch("signin"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all ${
                mode === "signin"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              data-testid="button-tab-signup"
              onClick={() => { onSwitch("signup"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg font-racing text-sm font-bold tracking-wide transition-all ${
                mode === "signup"
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <h1 className="font-racing text-2xl font-black text-gray-900 tracking-tight mb-1">
            {mode === "signup" ? "Join the Paddock" : "Welcome Back"}
          </h1>
          <p className="text-gray-400 text-sm mb-7">
            {mode === "signup"
              ? "Create your free account — takes 30 seconds"
              : "Sign in to your F1 Paddock account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="font-racing text-[11px] text-gray-400 tracking-widest uppercase block mb-1.5">Your Name</label>
                <input
                  data-testid="input-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder="Max Verstappen"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}

            <div>
              <label className="font-racing text-[11px] text-gray-400 tracking-widest uppercase block mb-1.5">Email</label>
              <input
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="font-racing text-[11px] text-gray-400 tracking-widest uppercase block mb-1.5">Password</label>
              <div className="relative">
                <input
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <p className="text-red-600 text-xs font-racing">{error}</p>
              </div>
            )}

            <button
              data-testid={mode === "signup" ? "button-submit-register" : "button-submit-login"}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading
                ? (mode === "signup" ? "Creating Account..." : "Signing In...")
                : (mode === "signup" ? "Create Account" : "Sign In")}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-300 font-racing tracking-widest">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="flex flex-col gap-2">
            {facebookEnabled && (
              <a href="/api/auth/facebook">
                <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg font-racing text-sm font-bold bg-[#1877F2] text-white hover:bg-[#1565D8] transition-all">
                  <SiFacebook className="w-4 h-4" />
                  Continue with Facebook
                </button>
              </a>
            )}
            <a href="/api/login">
              <button className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-lg font-racing text-sm text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all bg-white">
                <Flag className="w-4 h-4" />
                Continue with Replit
              </button>
            </a>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => { onSwitch("signin"); setError(""); }} className="text-primary font-racing font-bold hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>No account?{" "}
                <button onClick={() => { onSwitch("signup"); setError(""); }} className="text-primary font-racing font-bold hover:underline">
                  Create one free
                </button>
              </>
            )}
          </p>
        </div>
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
