import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
      } else {
        await queryClient.invalidateQueries();
        setLocation("/");
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

        <h1 className="font-racing text-3xl font-black text-foreground tracking-tight mb-1">Join the Paddock</h1>
        <p className="text-muted-foreground text-sm mb-8">Create your free F1 Paddock account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-card border border-card-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

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
                minLength={6}
                placeholder="At least 6 characters"
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
            <p className="text-[10px] text-muted-foreground mt-1">Minimum 6 characters</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-2.5">
              <p className="text-destructive text-xs font-racing">{error}</p>
            </div>
          )}

          <button
            data-testid="button-submit-register"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-racing text-sm font-bold tracking-wide rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-racing font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 flex-shrink-0" />
    </div>
  );
}
