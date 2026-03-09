import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Zap, ChevronRight, Lock, Star, Sparkles, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import ariaVossImage from "@assets/aria-voss.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserProfile } from "@shared/schema";
import { NOVEL_CHAPTERS, OUTFIT_CATEGORIES } from "@/data/novelStory";

// Bea character component - AI portrait
function AriaCharacter({ outfit, emotion }: { outfit: string[]; emotion: string }) {
  const suitItem = OUTFIT_CATEGORIES[0].items.find((i) => outfit.includes(i.id)) || OUTFIT_CATEGORIES[0].items[0];

  const emotionGlow: Record<string, string> = {
    happy: "0 0 40px 12px #FFD70066",
    nervous: "0 0 40px 12px #FFA50066",
    determined: "0 0 40px 12px #CC000066",
    sad: "0 0 40px 12px #6B9BD266",
    excited: "0 0 40px 12px #FFD70066",
    loving: "0 0 40px 12px #FF69B466",
    angry: "0 0 40px 12px #FF450066",
    default: "0 0 30px 8px #ffffff22",
  };

  const suitTint: Record<string, string> = {
    happy: "#FFD70015",
    nervous: "#FFA50015",
    determined: "#CC000015",
    sad: "#6B9BD215",
    excited: "#FFD70015",
    loving: "#FF69B415",
    default: "transparent",
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: 160, height: 280 }}>
      {/* Outfit-colored rim glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
        style={{ boxShadow: `0 0 32px 8px ${suitItem.accent}44` }}
      />

      {/* Character image */}
      <img
        src={ariaVossImage}
        alt="Bea Voss"
        className="relative z-10 h-full w-full object-cover object-top rounded-2xl"
        style={{
          boxShadow: emotionGlow[emotion] || emotionGlow.default,
          filter: `drop-shadow(0 0 8px ${suitItem.accent}88)`,
        }}
      />

      {/* Suit-color tint overlay */}
      <div
        className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
        style={{ background: suitTint[emotion] || "transparent", mixBlendMode: "color" }}
      />

      {/* Emotion badge */}
      {(emotion === "happy" || emotion === "excited" || emotion === "loving") && (
        <div className="absolute -top-2 -right-2 z-30">
          <Heart className="w-6 h-6 text-pink-400 drop-shadow animate-pulse" />
        </div>
      )}
      {emotion === "determined" && (
        <div className="absolute -top-2 -right-2 z-30">
          <Star className="w-6 h-6 text-yellow-400 drop-shadow animate-bounce" />
        </div>
      )}
      {emotion === "angry" && (
        <div className="absolute -top-2 -right-2 z-30">
          <Zap className="w-6 h-6 text-orange-400 drop-shadow animate-pulse" />
        </div>
      )}

      {/* Outfit label chip */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full font-racing text-[9px] font-bold tracking-wider"
        style={{ background: suitItem.color, color: suitItem.accent, border: `1px solid ${suitItem.accent}66` }}
      >
        {suitItem.label}
      </div>
    </div>
  );
}

// Outfit Selector
function OutfitSelector({ currentOutfit, onSave, profile }: {
  currentOutfit: string[];
  onSave: (outfit: string[]) => void;
  profile: UserProfile | undefined;
}) {
  const [selected, setSelected] = useState<string[]>(currentOutfit);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const buyAndEquipMutation = useMutation({
    mutationFn: async ({ itemId, cost }: { itemId: string; cost: number }) => {
      const newOutfit = [
        ...selected.filter((id) => {
          const cat = OUTFIT_CATEGORIES.find((c) => c.items.some((i) => i.id === id));
          const targetCat = OUTFIT_CATEGORIES.find((c) => c.items.some((i) => i.id === itemId));
          return cat?.id !== targetCat?.id;
        }),
        itemId,
      ];
      return apiRequest("POST", "/api/novel/progress", { outfit: newOutfit, pointCost: cost });
    },
    onSuccess: (data: any, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/novel/progress"] });
      const newOutfit = [
        ...selected.filter((id) => {
          const cat = OUTFIT_CATEGORIES.find((c) => c.items.some((i) => i.id === id));
          const targetCat = OUTFIT_CATEGORIES.find((c) => c.items.some((i) => i.id === itemId));
          return cat?.id !== targetCat?.id;
        }),
        itemId,
      ];
      setSelected(newOutfit);
      onSave(newOutfit);
    },
    onError: (err: any) => {
      toast({ title: "Not enough points", description: "Earn more points to unlock this outfit!", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      {OUTFIT_CATEGORIES.map((cat) => (
        <div key={cat.id}>
          <h4 className="font-racing text-xs text-muted-foreground tracking-widest uppercase mb-2">{cat.label}</h4>
          <div className="space-y-2">
            {cat.items.map((item) => {
              const isEquipped = selected.includes(item.id);
              const canAfford = !item.cost || (profile?.totalPoints || 0) >= item.cost;
              const isFree = item.cost === 0;

              return (
                <button
                  key={item.id}
                  data-testid={`button-outfit-${item.id}`}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isEquipped ? "border-primary bg-primary/10" :
                    "border-card-border bg-card hover-elevate"
                  }`}
                  onClick={() => {
                    if (isFree || isEquipped) {
                      const newOutfit = [
                        ...selected.filter((id) => {
                          const ownCat = OUTFIT_CATEGORIES.find((c) => c.items.some((i) => i.id === id));
                          return ownCat?.id !== cat.id;
                        }),
                        item.id,
                      ];
                      setSelected(newOutfit);
                      onSave(newOutfit);
                      apiRequest("POST", "/api/novel/progress", { outfit: newOutfit });
                      queryClient.invalidateQueries({ queryKey: ["/api/novel/progress"] });
                    } else if (canAfford) {
                      buyAndEquipMutation.mutate({ itemId: item.id, cost: item.cost });
                    } else {
                      toast({ title: "Not enough points", variant: "destructive" });
                    }
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-md flex-shrink-0"
                    style={{ background: item.color, border: `2px solid ${item.accent}` }}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-racing text-xs font-bold text-foreground">{item.label}</p>
                    {item.cost > 0 ? (
                      <p className={`text-[10px] ${canAfford ? "text-yellow-500" : "text-destructive"}`}>
                        {item.cost.toLocaleString()} pts
                      </p>
                    ) : (
                      <p className="text-[10px] text-green-500">Free</p>
                    )}
                  </div>
                  {isEquipped && <Check className="w-4 h-4 text-primary" />}
                  {!isFree && !isEquipped && !canAfford && <Lock className="w-4 h-4 text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NovelPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentOutfit, setCurrentOutfit] = useState<string[]>(["suit_default", "casual_default", "helmet_default"]);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [choiceResponse, setChoiceResponse] = useState<string | null>(null);

  const { data: progress, isLoading } = useQuery<any>({
    queryKey: ["/api/novel/progress"],
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const progressMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/novel/progress", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/novel/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (err: any) => {
      toast({ title: "Not enough points!", description: "Earn points by taking quizzes or claiming your daily reward.", variant: "destructive" });
    },
  });

  const currentChapterId = progress?.currentChapter || 1;
  const currentSceneId = progress?.currentScene || 0;
  const completedChoices: string[] = progress?.completedChoices || [];
  const affectionLevel = progress?.affectionLevel || 0;

  const chapter = NOVEL_CHAPTERS.find((c) => c.id === currentChapterId);
  const scene = chapter?.scenes[currentSceneId];

  useEffect(() => {
    if (progress?.selectedOutfit?.length) {
      setCurrentOutfit(progress.selectedOutfit);
    }
  }, [progress?.selectedOutfit]);

  // Typewriter effect
  useEffect(() => {
    if (!scene) return;
    setChoiceResponse(null);
    setIsTyping(true);
    setDisplayedText("");
    let i = 0;
    const text = scene.text;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 18);
    return () => clearInterval(timer);
  }, [scene?.id, scene?.text, currentChapterId, currentSceneId]);

  const handleAdvance = () => {
    if (isTyping) {
      setIsTyping(false);
      setDisplayedText(scene?.text || "");
      return;
    }
    if (!scene?.choices) {
      const isLastScene = currentSceneId >= (chapter?.scenes.length || 1) - 1;
      const isLastChapter = currentChapterId >= NOVEL_CHAPTERS.length;

      if (isLastScene && !isLastChapter) {
        progressMutation.mutate({ advanceChapter: true });
      } else if (!isLastScene) {
        progressMutation.mutate({ advanceScene: true });
      }
    }
  };

  const handleChoice = (choice: any) => {
    if (completedChoices.includes(choice.id)) return;
    setChoiceResponse(choice.response);
    progressMutation.mutate({
      choiceKey: choice.id,
      pointCost: choice.pointCost,
      affectionGain: choice.affectionGain,
    });
  };

  const handleContinueAfterChoice = () => {
    setChoiceResponse(null);
    const isLastScene = currentSceneId >= (chapter?.scenes.length || 1) - 1;
    const isLastChapter = currentChapterId >= NOVEL_CHAPTERS.length;

    if (isLastScene && !isLastChapter) {
      progressMutation.mutate({ advanceChapter: true });
    } else if (!isLastScene) {
      progressMutation.mutate({ advanceScene: true });
    }
  };

  const maxAffection = 500;
  const affectionPct = Math.min(100, (affectionLevel / maxAffection) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dark scene background */}
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(180deg, hsl(0 40% 6%) 0%, hsl(0 0% 8%) 50%, hsl(0 0% 7%) 100%)" }}
      >
        <Tabs defaultValue="story" className="h-full">
          {/* Tab header */}
          <div className="sticky top-0 z-10 px-4 pt-4 pb-2" style={{ background: "hsl(0 40% 6%)" }}>
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-racing text-xl font-black text-white">Bea's Story</h1>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-600 to-pink-400 transition-all duration-500"
                    style={{ width: `${affectionPct}%` }}
                  />
                </div>
                <span className="text-xs font-racing text-pink-400 font-bold">{affectionLevel}</span>
              </div>
            </div>

            <TabsList className="w-full bg-white/5">
              <TabsTrigger value="story" className="flex-1 font-racing text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                Story
              </TabsTrigger>
              <TabsTrigger value="dresser" className="flex-1 font-racing text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                Dress Up
              </TabsTrigger>
              <TabsTrigger value="chapters" className="flex-1 font-racing text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                Chapters
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Story Tab */}
          <TabsContent value="story" className="mt-0 px-4 pb-24">
            {/* Points display */}
            <div className="flex items-center justify-between py-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="font-racing text-xs text-yellow-400 font-bold">
                  {(profile?.totalPoints || 0).toLocaleString()} pts
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-racing border-white/20 text-white/60">
                Ch.{currentChapterId} · Scene {currentSceneId + 1}
              </Badge>
            </div>

            {/* Character stage */}
            <div className="flex justify-center mb-4 relative">
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{ background: "linear-gradient(0deg, hsl(0 40% 6%), transparent)" }}
              />
              {/* Stage lights */}
              <div className="absolute top-0 left-1/4 w-2 h-20 pointer-events-none opacity-20"
                style={{ background: "linear-gradient(180deg, hsl(0 84% 45%), transparent)" }}
              />
              <div className="absolute top-0 right-1/4 w-2 h-20 pointer-events-none opacity-20"
                style={{ background: "linear-gradient(180deg, hsl(0 84% 45%), transparent)" }}
              />
              <AriaCharacter outfit={currentOutfit} emotion={scene?.emotion || "default"} />
            </div>

            {/* Chapter title */}
            {chapter && (
              <div className="text-center mb-3">
                <p className="font-racing text-[10px] text-primary/60 tracking-widest uppercase">
                  Chapter {chapter.id}
                </p>
                <p className="font-racing text-sm font-black text-white/80">{chapter.title}</p>
              </div>
            )}

            {/* Dialogue box */}
            {scene && (
              <div
                className="rounded-lg border border-white/10 p-4 mb-4 relative cursor-pointer"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
                onClick={handleAdvance}
              >
                {scene.character === "aria" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-pink-400" />
                    </div>
                    <span className="font-racing text-xs font-bold text-primary tracking-wide">BEA VOSS</span>
                  </div>
                )}
                {scene.character === "narrator" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span className="font-racing text-[10px] text-yellow-500/80 tracking-widest uppercase">Narrator</span>
                  </div>
                )}

                {/* Choice response overlay */}
                {choiceResponse ? (
                  <div>
                    <p className="text-sm text-white/90 leading-relaxed italic">{choiceResponse}</p>
                    <button
                      className="mt-3 w-full flex items-center justify-center gap-1.5 text-primary text-xs font-racing font-bold py-2 rounded-md bg-primary/10 border border-primary/30"
                      onClick={handleContinueAfterChoice}
                      data-testid="button-continue-story"
                    >
                      Continue <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">{displayedText}</p>
                    {!isTyping && !scene.choices && (
                      <div className="flex items-center justify-end mt-2 text-white/30 animate-bounce">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Choices */}
            {scene?.choices && !choiceResponse && !isTyping && (
              <div className="space-y-2">
                <p className="font-racing text-[10px] text-white/40 tracking-widest uppercase mb-2">Choose your response:</p>
                {scene.choices.map((choice) => {
                  const done = completedChoices.includes(choice.id);
                  const canAfford = !choice.pointCost || (profile?.totalPoints || 0) >= choice.pointCost;
                  return (
                    <button
                      key={choice.id}
                      data-testid={`button-choice-${choice.id}`}
                      disabled={done || progressMutation.isPending}
                      onClick={() => handleChoice(choice)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        done ? "border-primary/30 bg-primary/10 opacity-70 cursor-default" :
                        canAfford ? "border-white/20 bg-white/5 hover:border-primary/50 hover:bg-primary/5" :
                        "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                          done ? "bg-primary" : canAfford ? "bg-white/10" : "bg-white/5"
                        }`}>
                          {done ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : !canAfford ? (
                            <Lock className="w-3 h-3 text-white/40" />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm leading-relaxed ${done ? "text-white/60 line-through" : canAfford ? "text-white/90" : "text-white/40"}`}>
                            {choice.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {choice.pointCost > 0 ? (
                              <span className={`text-[10px] font-racing font-bold ${canAfford ? "text-yellow-500" : "text-red-400"}`}>
                                <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                                {choice.pointCost.toLocaleString()} pts
                              </span>
                            ) : (
                              <span className="text-[10px] font-racing text-green-400">Free</span>
                            )}
                            <span className="text-[10px] font-racing text-pink-400">
                              <Heart className="w-2.5 h-2.5 inline mr-0.5" />
                              +{choice.affectionGain}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Dress Up Tab */}
          <TabsContent value="dresser" className="mt-0 px-4 pb-24">
            <div className="py-3">
              <div className="flex justify-center mb-4">
                <AriaCharacter outfit={currentOutfit} emotion="happy" />
              </div>
              <p className="font-racing text-xs text-white/50 text-center mb-4 tracking-widest uppercase">
                Current: {currentOutfit.map((id) => {
                  const item = OUTFIT_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === id);
                  return item?.label || id;
                }).join(", ")}
              </p>
              <OutfitSelector
                currentOutfit={currentOutfit}
                onSave={setCurrentOutfit}
                profile={profile}
              />
            </div>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="mt-0 px-4 pb-24">
            <div className="py-3 space-y-3">
              {NOVEL_CHAPTERS.map((ch) => {
                const isUnlocked = ch.id <= currentChapterId;
                const isActive = ch.id === currentChapterId;
                const isCompleted = ch.id < currentChapterId;

                return (
                  <div
                    key={ch.id}
                    data-testid={`card-chapter-${ch.id}`}
                    className={`p-4 rounded-lg border transition-all ${
                      isActive ? "border-primary/50 bg-primary/10" :
                      isCompleted ? "border-white/20 bg-white/5" :
                      "border-white/10 bg-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-racing font-black text-sm ${
                        isCompleted ? "bg-green-500/20 text-green-400" :
                        isActive ? "bg-primary text-white" :
                        "bg-white/10 text-white/40"
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : ch.id}
                      </div>
                      <div className="flex-1">
                        <p className={`font-racing text-sm font-black ${isUnlocked ? "text-white" : "text-white/40"}`}>
                          {ch.title}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${isUnlocked ? "text-white/60" : "text-white/30"}`}>
                          {ch.subtitle}
                        </p>
                        {!isUnlocked && ch.unlockCost > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Lock className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-racing text-yellow-500">
                              Unlocks after Chapter {ch.id - 1}
                            </span>
                          </div>
                        )}
                        {isActive && (
                          <Badge className="mt-2 text-[9px] font-racing">Current</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
