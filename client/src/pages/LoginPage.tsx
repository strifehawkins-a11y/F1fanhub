import { useState } from "react";
import { Link } from "wouter";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <div className="h-1 bg-primary w-full flex-shrink-0" />

      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="font-racing text-white text-xs font-black tracking-tighter">F1</span>
          </div>
          <span className="font-racing text-foreground font-bold tracking-widest text-sm uppercase">Paddock</span>
        </div>

        <h1 className="font-racing text-3xl font-black text-foreground tracking-tight mb-1">Welcome Back</h1>
        <p className="text-muted-foreground text-sm mb-8">Sign in to your F1 Paddock account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
              Username or Email
            </label>
            <input
              data-testid="input-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Username or email address"
              className="w-full bg-card border border-card-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                placeholder="••••••••"
                className="w-full bg-card border border-card-border rounded-lg px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2.5">
              <p className="text-destructive text-xs font-racing">{error}</p>
            </div>
          )}

          <button
            data-testid="button-submit-login"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground font-racing tracking-widest">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <a href="/api/login">
          <button className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-lg font-racing text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
            <LogIn className="w-4 h-4" />
            Quick Sign In
          </button>
        </a>

        <p className="text-center text-xs text-muted-foreground mt-8">
          No account?{" "}
          <Link href="/register" className="text-primary font-racing font-bold hover:underline">
            Create one free
          </Link>
        </p>
      </div>

      <div className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 flex-shrink-0" />
    </div>
  );
}
