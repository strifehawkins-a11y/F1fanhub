import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Trophy, RotateCcw, Brain, Zap } from "lucide-react";
import AuthGate from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { QuizQuestion } from "@shared/schema";

type QuizState = "ready" | "playing" | "answered" | "complete";

export default function QuizPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<QuizState>("ready");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const { data: questions, refetch, isLoading } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quiz/questions"],
    enabled: false,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { score: number; totalQuestions: number; pointsEarned: number }) =>
      apiRequest("POST", "/api/quiz/submit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const startQuiz = async () => {
    const result = await refetch();
    if (result.data) {
      setState("playing");
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setPointsEarned(0);
      setAnswers([]);
    }
  };

  const handleAnswer = (index: number) => {
    if (state !== "playing" || selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setState("answered");
    const current = questions![currentIndex];
    const correct = index === current.correctAnswer;
    if (correct) {
      setScore((s) => s + 1);
      setPointsEarned((p) => p + current.points);
    }
    setAnswers((a) => [...a, correct]);
  };

  const nextQuestion = () => {
    if (!questions) return;
    if (currentIndex + 1 >= questions.length) {
      const finalScore = score + (selectedAnswer === questions[currentIndex].correctAnswer ? 1 : 0);
      const finalPoints = pointsEarned;
      setState("complete");
      submitMutation.mutate({ score: finalScore, totalQuestions: questions.length, pointsEarned: finalPoints });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setState("playing");
    }
  };

  const resetQuiz = () => {
    setState("ready");
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setPointsEarned(0);
    setAnswers([]);
  };

  const current = questions?.[currentIndex];
  const totalQuestions = questions?.length || 10;
  const progress = ((currentIndex + (state === "answered" || state === "complete" ? 1 : 0)) / totalQuestions) * 100;

  if (state === "ready") {
    return (
      <div className="px-4 py-6 space-y-6">
        <div>
          <p className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Test Your Knowledge</p>
          <h1 className="font-racing text-3xl font-black text-foreground mt-1">F1 Quiz</h1>
        </div>

        <Card className="border-card-border p-5 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-racing text-xl font-black text-foreground">Ready to Race?</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              10 questions about Formula 1. Answer correctly to earn points and climb the leaderboard.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Questions", value: "10" },
                { label: "Max Points", value: "2,000+" },
                { label: "Difficulty", value: "Mixed" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted rounded-lg p-2">
                  <p className="font-racing text-base font-black text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4 font-racing tracking-widest"
              size="lg"
              onClick={startQuiz}
              disabled={isLoading}
              data-testid="button-start-quiz"
            >
              {isLoading ? "Loading..." : "Start Quiz"}
            </Button>
          </div>
        </Card>

        <div>
          <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase mb-2">Points per difficulty</h3>
          <div className="space-y-2">
            {[
              { label: "Easy", pts: "100 pts", color: "text-green-500" },
              { label: "Medium", pts: "150 pts", color: "text-yellow-500" },
              { label: "Hard", pts: "200 pts", color: "text-red-500" },
            ].map(({ label, pts, color }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-card border border-card-border rounded-lg">
                <span className="font-racing text-sm font-bold text-foreground">{label}</span>
                <span className={`font-racing text-sm font-black ${color}`}>{pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === "complete") {
    const pct = Math.round((score / totalQuestions) * 100);
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-racing text-3xl font-black text-foreground">Race Complete!</h1>
          <p className="text-muted-foreground text-sm mt-2">Here's how you did</p>
        </div>

        <Card className="border-card-border p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="font-racing text-4xl font-black text-primary">{score}/{totalQuestions}</p>
              <p className="text-xs text-muted-foreground font-racing">Correct Answers</p>
            </div>
            <div className="text-center">
              <p className="font-racing text-4xl font-black text-yellow-500">+{pointsEarned}</p>
              <p className="text-xs text-muted-foreground font-racing">Points Earned</p>
            </div>
          </div>
          <Progress value={pct} className="h-2 mb-3" />
          <p className="text-center text-sm font-racing text-muted-foreground">{pct}% correct</p>
        </Card>

        <div className="space-y-2">
          <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Answer Review</h3>
          {answers.map((correct, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${correct ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              {correct ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span className="text-xs text-foreground font-racing">
                Question {i + 1}: {correct ? "Correct" : "Incorrect"}
              </span>
              {correct && (
                <span className="ml-auto text-xs font-racing text-green-500">
                  +{questions?.[i]?.points || 100}
                </span>
              )}
            </div>
          ))}
        </div>

        <Button
          className="w-full font-racing tracking-widest"
          onClick={resetQuiz}
          data-testid="button-retake-quiz"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!current) return null;

  const isCorrect = selectedAnswer === current.correctAnswer;

  return (
    <AuthGate feature="the F1 Quiz" description="Sign in to test your F1 knowledge and earn points each round.">
    <div className="px-4 py-6 space-y-5">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-racing text-xs text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="font-racing text-xs font-bold text-yellow-500">+{pointsEarned} pts</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Difficulty & Category */}
      <div className="flex gap-2">
        <Badge
          variant="outline"
          className={`text-[10px] font-racing ${
            current.difficulty === "hard" ? "border-red-500 text-red-500" :
            current.difficulty === "medium" ? "border-yellow-500 text-yellow-500" :
            "border-green-500 text-green-500"
          }`}
        >
          {current.difficulty}
        </Badge>
        <Badge variant="secondary" className="text-[10px] font-racing">{current.category}</Badge>
        <Badge variant="outline" className="text-[10px] font-racing ml-auto">+{current.points} pts</Badge>
      </div>

      {/* Question */}
      <Card className="border-card-border p-5">
        <p className="font-racing text-base font-bold text-foreground leading-relaxed">{current.question}</p>
      </Card>

      {/* Options */}
      <div className="space-y-2.5">
        {current.options.map((option, index) => {
          let variant: "default" | "outline" = "outline";
          let extraClass = "border-card-border bg-card hover-elevate cursor-pointer";

          if (selectedAnswer !== null) {
            if (index === current.correctAnswer) {
              extraClass = "border-green-500 bg-green-500/10 cursor-default";
            } else if (index === selectedAnswer && !isCorrect) {
              extraClass = "border-red-500 bg-red-500/10 cursor-default";
            } else {
              extraClass = "border-card-border bg-card opacity-50 cursor-default";
            }
          }

          return (
            <button
              key={index}
              data-testid={`button-answer-${index}`}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${extraClass}`}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-racing font-black text-xs border ${
                selectedAnswer !== null && index === current.correctAnswer ? "bg-green-500 border-green-500 text-white" :
                selectedAnswer !== null && index === selectedAnswer && !isCorrect ? "bg-red-500 border-red-500 text-white" :
                "border-border text-muted-foreground"
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className="font-racing text-sm text-left text-foreground">{option}</span>
              {selectedAnswer !== null && index === current.correctAnswer && (
                <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
              )}
              {selectedAnswer !== null && index === selectedAnswer && !isCorrect && (
                <XCircle className="w-4 h-4 text-red-500 ml-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next */}
      {selectedAnswer !== null && (
        <div className={`rounded-lg p-3 border ${isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={`font-racing text-sm font-bold ${isCorrect ? "text-green-500" : "text-red-500"}`}>
              {isCorrect ? `Correct! +${current.points} points` : `Incorrect! Correct: ${current.options[current.correctAnswer]}`}
            </span>
          </div>
          <Button
            className="w-full font-racing tracking-wide"
            size="sm"
            onClick={nextQuestion}
            data-testid="button-next-question"
          >
            {currentIndex + 1 >= totalQuestions ? "See Results" : "Next Question"}
          </Button>
        </div>
      )}
    </div>
    </AuthGate>
  );
}
