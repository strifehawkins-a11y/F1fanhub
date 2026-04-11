import { useEffect, useRef } from "react";

interface AdBannerProps {
  variant?: "horizontal" | "square";
  className?: string;
}

const DIRECT_LINK = "https://omg10.com/4/10861693";

export default function AdBanner({ variant = "horizontal", className = "" }: AdBannerProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = () => {
      window.open(DIRECT_LINK, "_blank", "noopener,noreferrer");
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  if (variant === "square") {
    return (
      <div className={`w-full my-4 ${className}`} aria-label="Advertisement">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 text-right pr-1">
          Advertisement
        </p>
        <a
          ref={ref}
          href={DIRECT_LINK}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 hover:shadow-md transition-shadow duration-200"
          style={{ aspectRatio: "1/1", maxHeight: 300 }}
          aria-label="Sponsored content"
        >
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-snug">
              Sponsored Content
            </p>
            <span className="text-xs text-primary font-medium border border-primary/30 rounded-full px-3 py-1">
              Learn More →
            </span>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full my-6 ${className}`} aria-label="Advertisement">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 text-right pr-1">
        Advertisement
      </p>
      <a
        ref={ref}
        href={DIRECT_LINK}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center gap-4 w-full rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700 p-4"
        aria-label="Sponsored content"
      >
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug mb-0.5">
            Exclusive F1 Fan Offers
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-snug line-clamp-2">
            Discover deals and content curated for Formula 1 fans. Click to explore.
          </p>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-block bg-primary text-white text-xs font-semibold rounded-lg px-3 py-2 whitespace-nowrap">
            Open →
          </span>
        </div>
      </a>
    </div>
  );
}
