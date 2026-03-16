import { Link } from "wouter";
import { LogIn, Zap, Trophy, Heart, Brain } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AuthGateProps {
  children: React.ReactNode;
  feature?: string;
  description?: string;
}

export default function AuthGate({ children, feature = "this feature", description }: AuthGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5">
          <LogIn className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-racing text-xl font-bold text-gray-900 mb-2 tracking-wide">
          Sign In Required
        </h2>
        <p className="text-gray-500 text-sm mb-1 max-w-xs">
          {description || `Create a free account to access ${feature}.`}
        </p>
        <p className="text-gray-400 text-xs mb-8 max-w-xs">
          Earn points, climb the leaderboard, and unlock Gina's full story.
        </p>

        <div className="flex gap-3 mb-8">
          <Link href="/login">
            <button
              data-testid="button-authgate-signin"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-racing text-sm font-bold border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          </Link>
          <Link href="/login">
            <button
              data-testid="button-authgate-join"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-racing text-sm font-bold bg-primary text-white hover:bg-red-700 transition-all shadow-md shadow-primary/25"
            >
              Join Free →
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xs w-full">
          {[
            { icon: Zap, label: "Earn Points", desc: "Daily rewards & quizzes" },
            { icon: Heart, label: "Gina's Story", desc: "Visual novel + dress-up" },
            { icon: Trophy, label: "Leaderboard", desc: "Compete with fans" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Icon className="w-5 h-5 text-primary" />
              <p className="font-racing text-[10px] font-bold text-gray-900 tracking-wide">{label}</p>
              <p className="font-racing text-[9px] text-gray-400 text-center leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
