// Must import polyfills at the very top of the file, before anything else
import 'process'; // Node.js process polyfill
import { Buffer } from 'buffer'; // Node.js Buffer polyfill

// Fix global
if (typeof window !== 'undefined') {
  // Make Buffer available globally
  window.Buffer = Buffer;
  // Set global to window
  window.global = window;
}

import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "./components/ui/toaster";
import App from "./App";
import "./index.css";

// We'll use our custom mock implementation instead of MeshProvider until we can resolve
// the polyfill issues
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </QueryClientProvider>
);
