import { useEffect } from "react";
import { Link } from "wouter";
import { Flag, Newspaper, Users, Trophy, Zap, MessageSquare, BookOpen, HelpCircle, ChevronRight } from "lucide-react";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-racing text-3xl font-black text-primary">{value}</div>
      <div className="font-racing text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, href }: { icon: any; title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-racing text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
              <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AboutPage() {
  useEffect(() => {
    document.title = "About F1 Paddock | The Ultimate F1 Fan Community";
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, selector.match(/\[(?:name|property)="([^"]+)"\]/)?.[1] || "");
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };
    setMeta('meta[name="description"]', "name", "F1 Paddock is a Formula 1 fan community offering breaking F1 news, race standings, driver standings, forums, polls, quizzes, and an interactive F1 visual novel. Join thousands of F1 fans.");
    setMeta('meta[property="og:title"]', "property", "About F1 Paddock | The Ultimate F1 Fan Community");
    setMeta('meta[property="og:description"]', "property", "F1 Paddock is a Formula 1 fan community offering breaking F1 news, race standings, forums, polls, and more.");
    setMeta('meta[property="og:type"]', "property", "website");
    const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement) ||
      (() => { const l = document.createElement("link"); l.rel = "canonical"; document.head.appendChild(l); return l; })();
    canonical.href = `${window.location.origin}/about`;
    return () => { document.title = "F1 Paddock – The Ultimate F1 Fan Experience"; };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d0005 0%, #1a0008 40%, #3d0015 70%, #2d0010 100%)" }}>
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative px-8 py-10">
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 text-primary" />
            <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Est. 2026</span>
          </div>
          <h1 className="font-racing text-4xl font-black text-white tracking-tight leading-none mb-3">
            About F1 Paddock
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xl">
            The home of Formula 1 fans. We cover everything from race reports and technical analysis to driver standings, community polls, and an interactive F1 universe — built by fans, for fans.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 py-6">
          <StatCard value="24" label="Races in 2026" />
          <StatCard value="20" label="Drivers" />
          <StatCard value="10" label="Constructors" />
          <StatCard value="∞" label="Fan passion" />
        </div>
      </div>

      {/* Our Mission */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="font-racing text-lg font-black text-gray-900 uppercase tracking-tight">Our Mission</h2>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            <strong className="text-gray-900">F1 Paddock</strong> was built because Formula 1 deserves a fan community as passionate and detailed as the sport itself. Whether you've been watching since Senna's era or discovered F1 through a Netflix documentary, there's a place for you here.
          </p>
          <p>
            We publish race reports, season previews, technical breakdowns, and paddock news — all written with the depth and accuracy that serious F1 fans demand. Beyond news, we've built a full community platform: vote in polls that reward your knowledge, prove yourself in our F1 quiz, debate in race forums, and even follow the story of Gina Voss in our original F1 visual novel.
          </p>
          <p>
            F1 Paddock is operated by <strong className="text-gray-900">Lansanah Junior Marah</strong>, an F1 enthusiast dedicated to growing the global fan community around the greatest motorsport on earth. Questions or partnerships — reach us at{" "}
            <a href="mailto:strifehawkins@gmail.com" className="text-primary hover:underline font-medium">strifehawkins@gmail.com</a>.
          </p>
        </div>
      </div>

      {/* What we offer */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="font-racing text-lg font-black text-gray-900 uppercase tracking-tight">What's on F1 Paddock</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FeatureCard
            icon={Newspaper}
            title="F1 News & Articles"
            description="Race reports, driver news, technical analysis, and season previews — updated throughout the season."
            href="/articles"
          />
          <FeatureCard
            icon={Trophy}
            title="Live Standings"
            description="Up-to-date driver and constructor championship standings for the 2026 Formula 1 season."
            href="/standings"
          />
          <FeatureCard
            icon={MessageSquare}
            title="Race Forum"
            description="Discuss every race weekend, share your takes, and debate with thousands of other F1 fans."
            href="/forum"
          />
          <FeatureCard
            icon={Zap}
            title="Polls & Rewards"
            description="Vote in community polls and earn points for correct predictions. Climb the leaderboard."
            href="/polls"
          />
          <FeatureCard
            icon={HelpCircle}
            title="F1 Quiz"
            description="Test your Formula 1 knowledge across history, drivers, circuits, and regulations."
            href="/quiz"
          />
          <FeatureCard
            icon={BookOpen}
            title="F1 Visual Novel"
            description="Follow the story of Gina Voss, an F1 driver navigating the politics and pressure of the paddock."
            href="/novel"
          />
          <FeatureCard
            icon={Users}
            title="Leaderboard"
            description="See where you rank among the F1 Paddock community based on your points and activity."
            href="/leaderboard"
          />
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-racing text-sm font-black text-gray-900 mb-1">Get in touch</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              For editorial enquiries, partnerships, advertising, or feedback — we'd love to hear from you.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/contact">
              <button className="font-racing text-xs font-bold px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-all">
                Contact Us
              </button>
            </Link>
            <Link href="/privacy">
              <button className="font-racing text-xs font-bold px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:border-gray-300 hover:text-gray-700 transition-all">
                Privacy Policy
              </button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
