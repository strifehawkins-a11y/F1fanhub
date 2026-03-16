import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import QuizPage from "@/pages/QuizPage";
import ForumPage from "@/pages/ForumPage";
import ArticlesPage from "@/pages/ArticlesPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import NovelPage from "@/pages/NovelPage";
import CharacterCreatorPage from "@/pages/CharacterCreatorPage";
import AdminPage from "@/pages/AdminPage";
import StandingsPage from "@/pages/StandingsPage";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/AppLayout";

function AuthenticatedApp() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/standings" component={StandingsPage} />
        <Route path="/quiz" component={QuizPage} />
        <Route path="/forum" component={ForumPage} />
        <Route path="/forum/:raceId" component={ForumPage} />
        <Route path="/articles" component={ArticlesPage} />
        <Route path="/articles/:id" component={ArticleDetailPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/novel" component={NovelPage} />
        <Route path="/creator" component={CharacterCreatorPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const [location] = useLocation();

  if (location === "/login") return <LoginPage />;

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
