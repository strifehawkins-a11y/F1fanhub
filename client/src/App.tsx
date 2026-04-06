import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/Landing";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
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
import PollsPage from "@/pages/PollsPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import AboutPage from "@/pages/AboutPage";
import SubmitStoryPage from "@/pages/SubmitStoryPage";
import JobsPage from "@/pages/JobsPage";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/AppLayout";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

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
        <Route path="/polls" component={PollsPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/submit-story" component={SubmitStoryPage} />
        <Route path="/jobs" component={JobsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const [location] = useLocation();

  // Fire a GA4 page_view on every client-side navigation
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location,
        page_title: document.title,
      });
    }
  }, [location]);

  if (location === "/login") return <LoginPage />;
  if (location === "/register") return <RegisterPage />;

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
