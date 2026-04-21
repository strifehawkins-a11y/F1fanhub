import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

// Pre-populate TanStack Query cache with SSR-injected data so React renders
// articles immediately without waiting for an API round-trip. This ensures
// Googlebot (and real users) see content even if the API call is slow/blocked.
const win = window as any;
if (win.__INITIAL_DATA__) {
  const data = win.__INITIAL_DATA__;
  if (Array.isArray(data.articles) && data.articles.length > 0) {
    queryClient.setQueryData(["/api/articles"], data.articles);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
