import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Zap, Check, Lock, ArrowLeft, Shuffle, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { UserProfile } from "@shared/schema";
import { OUTFIT_CATEGORIES } from "@/data/novelStory";
import AuthGate from "@/components/AuthGate";

// ── Layer images ──────────────────────────────────────────────────────────────
import beaLayerBase          from "@assets/generated_images/bea-layer-base.png";
import beaLayerSuitDefault   from "@assets/generated_images/bea-layer-suit-default.png";
import beaLayerSuitFerrari   from "@assets/generated_images/bea-layer-suit-ferrari.png";
import beaLayerSuitMclaren   from "@assets/generated_images/bea-layer-suit-mclaren.png";
import beaLayerSuitMercedes  from "@assets/generated_images/bea-layer-suit-mercedes.png";
import beaLayerSuitRedbull   from "@assets/generated_images/bea-layer-suit-redbull.png";
import beaLayerSuitAlpine    from "@assets/generated_images/bea-layer-suit-alpine.png";
import beaLayerSuitChampion  from "@assets/generated_images/bea-layer-suit-champion.png";
import beaLayerHairDefault   from "@assets/generated_images/bea-layer-hair-default.png";
import beaLayerHairPonytail  from "@assets/generated_images/bea-layer-hair-ponytail.png";
import beaLayerHairBraided   from "@assets/generated_images/bea-layer-hair-braided.png";
import beaLayerHairDark      from "@assets/generated_images/bea-layer-hair-dark.png";
import beaLayerHairBlonde    from "@assets/generated_images/bea-layer-hair-blonde.png";
import beaLayerHairPostrace  from "@assets/generated_images/bea-layer-hair-postrace.png";
import beaLayerCasualDefault from "@assets/generated_images/bea-layer-casual-default.png";
import beaLayerCasualPolo    from "@assets/generated_images/bea-layer-casual-polo.png";
import beaLayerCasualStreet  from "@assets/generated_images/bea-layer-casual-street.png";
import beaLayerCasualDress   from "@assets/generated_images/bea-layer-casual-dress.png";
import beaLayerCasualMedia   from "@assets/generated_images/bea-layer-casual-media.png";
import beaLayerCasualGown    from "@assets/generated_images/bea-layer-casual-gown.png";
import beaLayerHelmetDefault from "@assets/generated_images/bea-layer-helmet-default.png";
import beaLayerHelmetVisor   from "@assets/generated_images/bea-layer-helmet-visor.png";
import beaLayerHelmetCarbon  from "@assets/generated_images/bea-layer-helmet-carbon.png";
import beaLayerHelmetSpecial from "@assets/generated_images/bea-layer-helmet-special.png";
import beaLayerHelmetVintage from "@assets/generated_images/bea-layer-helmet-vintage.png";
import beaLayerHelmetChampion from "@assets/generated_images/bea-layer-helmet-champion.png";

// ── Image maps ────────────────────────────────────────────────────────────────
const LAYER_IMAGES: Record<string, string> = {
  suit_default:    beaLayerSuitDefault,
  suit_ferrari:    beaLayerSuitFerrari,
  suit_mclaren:    beaLayerSuitMclaren,
  suit_mercedes:   beaLayerSuitMercedes,
  suit_redbull:    beaLayerSuitRedbull,
  suit_alpine:     beaLayerSuitAlpine,
  suit_champion:   beaLayerSuitChampion,
  hair_default:    beaLayerHairDefault,
  hair_ponytail:   beaLayerHairPonytail,
  hair_braided:    beaLayerHairBraided,
  hair_dark:       beaLayerHairDark,
  hair_blonde:     beaLayerHairBlonde,
  hair_postrace:   beaLayerHairPostrace,
  casual_default:  beaLayerCasualDefault,
  casual_polo:     beaLayerCasualPolo,
  casual_streetwear: beaLayerCasualStreet,
  casual_dress:    beaLayerCasualDress,
  casual_media:    beaLayerCasualMedia,
  casual_gown:     beaLayerCasualGown,
  helmet_default:  beaLayerHelmetDefault,
  helmet_visor:    beaLayerHelmetVisor,
  helmet_carbon:   beaLayerHelmetCarbon,
  helmet_special:  beaLayerHelmetSpecial,
  helmet_vintage:  beaLayerHelmetVintage,
  helmet_champion: beaLayerHelmetChampion,
};

const DEFAULT_OUTFIT = ["suit_default", "casual_default", "helmet_default", "hair_default", "acc_default"];

function getEquippedId(outfit: string[], catId: string): string {
  const cat = OUTFIT_CATEGORIES.find(c => c.id === catId);
  if (!cat) return "";
  return outfit.find(id => cat.items.some(i => i.id === id)) || cat.items[0].id;
}

// ── Paper-doll Character Display ──────────────────────────────────────────────
function PaperDollCharacter({
  outfit,
  previewItem,
  sparkleActive,
}: {
  outfit: string[];
  previewItem: string | null;
  sparkleActive: boolean;
}) {
  const activeOutfit = previewItem
    ? outfit.map(id => {
        const previewCat = OUTFIT_CATEGORIES.find(c => c.items.some(i => i.id === previewItem));
        const idCat = OUTFIT_CATEGORIES.find(c => c.items.some(i => i.id === id));
        return idCat?.id === previewCat?.id ? previewItem : id;
      })
    : outfit;

  const suitId   = getEquippedId(activeOutfit, "suit");
  const hairId   = getEquippedId(activeOutfit, "hair");
  const casualId = getEquippedId(activeOutfit, "casual");
  const helmetId = getEquippedId(activeOutfit, "helmet");
  const accId    = getEquippedId(activeOutfit, "accessory");

  const isSuitActive   = activeOutfit.some(id => id.startsWith("suit_") && id !== "suit_default");
  const isCasualActive = activeOutfit.some(id => id.startsWith("casual_") && id !== "casual_default");

  const suitItem = OUTFIT_CATEGORIES[0].items.find(i => i.id === suitId) || OUTFIT_CATEGORIES[0].items[0];
  const accItem  = OUTFIT_CATEGORIES.find(c => c.id === "accessory")?.items.find(i => i.id === accId);

  // Layer opacity — clothing and hair are primary; helmet overlays head
  const clothingLayer = isCasualActive ? LAYER_IMAGES[casualId] : LAYER_IMAGES[suitId];
  const hairLayer     = LAYER_IMAGES[hairId];
  const helmetLayer   = helmetId !== "helmet_default" ? LAYER_IMAGES[helmetId] : null;

  return (
    <div className="relative flex items-end justify-center select-none" style={{ width: 260, height: 440 }}>
      {/* Glow platform */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-xl opacity-60 transition-all duration-700"
        style={{ width: 180, height: 40, background: (suitItem as any).glow || "#CC000055" }}
      />

      {/* ── Layered character ── */}
      <div className="relative" style={{ width: 240, height: 420 }}>

        {/* BASE BODY — always shown */}
        <img
          src={beaLayerBase}
          alt="Bea base"
          className="absolute inset-0 w-full h-full object-contain object-bottom"
          style={{ zIndex: 1 }}
        />

        {/* CLOTHING LAYER — suit or casual (body region, bottom 75%) */}
        <img
          key={clothingLayer}
          src={clothingLayer}
          alt="outfit"
          className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-300"
          style={{
            zIndex: 2,
            clipPath: "polygon(0% 22%, 100% 22%, 100% 100%, 0% 100%)",
            animation: "layerFadeIn 0.35s ease",
          }}
        />

        {/* HAIR LAYER — head region (top 50%) */}
        <img
          key={hairLayer}
          src={hairLayer}
          alt="hair"
          className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-300"
          style={{
            zIndex: 3,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 45%, 0% 45%)",
            animation: "layerFadeIn 0.35s ease",
          }}
        />

        {/* HELMET LAYER — overlays head completely if equipped */}
        {helmetLayer && (
          <img
            key={helmetLayer}
            src={helmetLayer}
            alt="helmet"
            className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-400"
            style={{
              zIndex: 4,
              clipPath: "polygon(0% 0%, 100% 0%, 100% 42%, 0% 42%)",
              animation: "layerFadeIn 0.3s ease",
            }}
          />
        )}

        {/* ACCESSORY emoji badge */}
        {accItem && (accItem as any).emoji && (
          <div
            className="absolute top-[12%] right-[8%] z-10 text-3xl drop-shadow-lg animate-bounce"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
          >
            {(accItem as any).emoji}
          </div>
        )}

        {/* SPARKLE animation on equip */}
        {sparkleActive && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: suitItem.color,
                  transform: `rotate(${i * 45}deg) translateY(-60px)`,
                  animation: "sparkleOut 0.6s ease-out forwards",
                  animationDelay: `${i * 0.04}s`,
                }}
              />
            ))}
            <Sparkles className="w-12 h-12 text-yellow-300 animate-ping" />
          </div>
        )}
      </div>

      {/* Suit label chip */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full font-racing text-[10px] font-bold tracking-widest whitespace-nowrap"
        style={{ background: suitItem.color, color: suitItem.accent, border: `1px solid ${suitItem.accent}55` }}
      >
        {suitItem.label}
      </div>
    </div>
  );
}

// ── Item Grid for a category ──────────────────────────────────────────────────
function ItemGrid({
  catId,
  outfit,
  points,
  previewItemId,
  onPreview,
  onEquip,
  onBuy,
}: {
  catId: string;
  outfit: string[];
  points: number;
  previewItemId: string | null;
  onPreview: (id: string | null) => void;
  onEquip: (id: string) => void;
  onBuy: (id: string, cost: number) => void;
}) {
  const cat = OUTFIT_CATEGORIES.find(c => c.id === catId);
  if (!cat) return null;
  const equippedId = getEquippedId(outfit, catId);

  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {cat.items.map(item => {
        const isEquipped  = item.id === equippedId;
        const isPreviewed = item.id === previewItemId;
        const owned       = item.cost === 0 || isEquipped;
        const canAfford   = points >= item.cost;
        const thumb       = LAYER_IMAGES[item.id];
        const itemAny     = item as any;

        return (
          <button
            key={item.id}
            data-testid={`creator-item-${item.id}`}
            className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 flex flex-col ${
              isEquipped  ? "border-yellow-400 shadow-lg shadow-yellow-400/30 scale-105" :
              isPreviewed ? "border-primary/80 shadow-md shadow-primary/30 scale-102" :
              owned       ? "border-white/20 hover:border-primary/50" :
              canAfford   ? "border-white/10 hover:border-white/30" :
                            "border-white/5 opacity-50 cursor-not-allowed"
            }`}
            style={{ aspectRatio: "2/3", background: item.color + "22" }}
            onMouseEnter={() => onPreview(item.id)}
            onMouseLeave={() => onPreview(null)}
            onClick={() => {
              if (isEquipped) return;
              if (item.cost === 0 || owned) { onEquip(item.id); }
              else if (canAfford)            { onBuy(item.id, item.cost); }
            }}
          >
            {/* Portrait or colour swatch */}
            {thumb ? (
              <img
                src={thumb}
                alt={item.label}
                className="w-full h-full object-cover object-top"
                style={{ filter: itemAny.filter && itemAny.filter !== "none" ? itemAny.filter : "none" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl"
                   style={{ background: item.color }}>
                {itemAny.emoji || "✨"}
              </div>
            )}

            {/* Overlay info strip */}
            <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/70 backdrop-blur-sm">
              <p className="font-racing text-[8px] text-white font-bold leading-tight truncate">
                {item.label}
              </p>
              {item.cost > 0 && !isEquipped ? (
                <span className={`font-racing text-[7px] font-bold ${canAfford ? "text-yellow-400" : "text-red-400"}`}>
                  ⚡ {item.cost.toLocaleString()}
                </span>
              ) : (
                <span className="font-racing text-[7px] text-green-400">{isEquipped ? "Equipped" : "Free"}</span>
              )}
            </div>

            {/* Equipped badge */}
            {isEquipped && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                <Check className="w-3 h-3 text-black" />
              </div>
            )}
            {/* Lock */}
            {item.cost > 0 && !owned && !canAfford && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                <Lock className="w-3 h-3 text-white/50" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main CharacterCreatorPage ─────────────────────────────────────────────────
export default function CharacterCreatorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery<UserProfile>({ queryKey: ["/api/profile"] });
  const { data: progressData } = useQuery<any>({ queryKey: ["/api/novel/progress"] });

  const [outfit, setOutfit] = useState<string[]>(DEFAULT_OUTFIT);
  const [activeCat, setActiveCat] = useState("suit");
  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [sparkleActive, setSparkleActive] = useState(false);

  useEffect(() => {
    if (progressData?.outfit) setOutfit(progressData.outfit);
  }, [progressData]);

  const saveOutfit = async (newOutfit: string[]) => {
    await apiRequest("POST", "/api/novel/progress", { outfit: newOutfit });
    queryClient.invalidateQueries({ queryKey: ["/api/novel/progress"] });
  };

  const equipItem = (itemId: string) => {
    const cat = OUTFIT_CATEGORIES.find(c => c.items.some(i => i.id === itemId));
    if (!cat) return;
    const newOutfit = [...outfit.filter(id => !cat.items.some(i => i.id === id)), itemId];
    setOutfit(newOutfit);
    saveOutfit(newOutfit);
    triggerSparkle();
  };

  const buyMutation = useMutation({
    mutationFn: ({ itemId, cost }: { itemId: string; cost: number }) => {
      const cat = OUTFIT_CATEGORIES.find(c => c.items.some(i => i.id === itemId));
      const newOutfit = cat
        ? [...outfit.filter(id => !cat.items.some(i => i.id === id)), itemId]
        : outfit;
      return apiRequest("POST", "/api/novel/progress", { outfit: newOutfit, pointCost: cost });
    },
    onSuccess: (_, { itemId }) => {
      const cat = OUTFIT_CATEGORIES.find(c => c.items.some(i => i.id === itemId));
      if (!cat) return;
      const newOutfit = [...outfit.filter(id => !cat.items.some(i => i.id === id)), itemId];
      setOutfit(newOutfit);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/novel/progress"] });
      triggerSparkle();
      toast({ title: "✨ Item unlocked!", description: `${OUTFIT_CATEGORIES.flatMap(c => c.items).find(i => i.id === itemId)?.label} equipped.` });
    },
    onError: () => toast({ title: "Not enough points", variant: "destructive" }),
  });

  const triggerSparkle = () => {
    setSparkleActive(true);
    setTimeout(() => setSparkleActive(false), 700);
  };

  const randomiseOutfit = () => {
    const owned: string[] = [];
    for (const cat of OUTFIT_CATEGORIES) {
      const free = cat.items.filter(i => i.cost === 0);
      owned.push(free[Math.floor(Math.random() * free.length)].id);
    }
    setOutfit(owned);
    saveOutfit(owned);
    triggerSparkle();
  };

  const catTabs = [
    { id: "suit",      label: "🏎️", name: "Racing Suit" },
    { id: "casual",    label: "👗", name: "Casual Wear" },
    { id: "helmet",    label: "⛑️", name: "Helmet" },
    { id: "hair",      label: "💇", name: "Hairstyle" },
    { id: "accessory", label: "✨", name: "Accessories" },
  ];

  const activeCatData = OUTFIT_CATEGORIES.find(c => c.id === activeCat);
  const equippedInCat = getEquippedId(outfit, activeCat);
  const equippedItem  = activeCatData?.items.find(i => i.id === equippedInCat);

  const points = profile?.totalPoints ?? 0;

  return (
    <AuthGate feature="Gina Voss Studio" description="Sign in to access the character creator and customise Gina's look.">
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col" style={{ fontFamily: "'Oxanium', sans-serif" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <button
          data-testid="button-creator-back"
          onClick={() => setLocation("/novel")}
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Story
        </button>
        <h1 className="font-racing font-bold tracking-widest text-sm text-primary uppercase">
          Gina Voss Studio
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-racing text-xs font-bold text-yellow-300">{points.toLocaleString()}</span>
          </div>
          <button
            data-testid="button-creator-random"
            onClick={randomiseOutfit}
            className="p-1.5 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Randomise (free items only)"
          >
            <Shuffle className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — character display */}
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-4 border-r border-white/10"
             style={{ minWidth: 300, background: "radial-gradient(ellipse at center, #1a0a1a 0%, #0a0a0f 70%)" }}>

          {/* Subtitle */}
          <p className="font-racing text-[10px] tracking-widest text-white/30 uppercase">Character Preview</p>

          <PaperDollCharacter
            outfit={outfit}
            previewItem={previewItem}
            sparkleActive={sparkleActive}
          />

          {/* Active category equipped item info */}
          <div className="text-center space-y-1">
            <p className="font-racing text-[10px] tracking-widest text-white/40 uppercase">{activeCatData?.label}</p>
            <p className="font-racing text-sm font-bold text-white">{equippedItem?.label || "—"}</p>
          </div>
        </div>

        {/* RIGHT — category tabs + item grid */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Category selector tabs */}
          <div className="flex gap-1 p-3 border-b border-white/10 bg-black/20">
            {catTabs.map(tab => {
              const isActive = activeCat === tab.id;
              const catData  = OUTFIT_CATEGORIES.find(c => c.id === tab.id);
              const eqId     = getEquippedId(outfit, tab.id);
              const eqItem   = catData?.items.find(i => i.id === eqId);
              return (
                <button
                  key={tab.id}
                  data-testid={`button-creator-cat-${tab.id}`}
                  onClick={() => setActiveCat(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? "border-primary bg-primary/20 text-white"
                      : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
                  }`}
                >
                  <span className="text-lg">{tab.label}</span>
                  <span className="font-racing text-[8px] tracking-wider uppercase leading-tight text-center">
                    {tab.name}
                  </span>
                  {eqItem && (
                    <span
                      className="w-3 h-3 rounded-full mt-0.5"
                      style={{ background: (eqItem as any).color || "#CC0000" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Item grid — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <p className="font-racing text-[9px] tracking-widest text-white/30 uppercase px-1 mb-1">
                {activeCatData?.label} — hover to preview · click to equip
              </p>
            </div>
            <ItemGrid
              catId={activeCat}
              outfit={outfit}
              points={points}
              previewItemId={previewItem}
              onPreview={setPreviewItem}
              onEquip={equipItem}
              onBuy={(id, cost) => buyMutation.mutate({ itemId: id, cost })}
            />
          </div>

          {/* Bottom hint */}
          <div className="px-4 py-2 border-t border-white/5 bg-black/30 text-center">
            <p className="font-racing text-[9px] text-white/25 tracking-widest uppercase">
              Changes are saved automatically
            </p>
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
