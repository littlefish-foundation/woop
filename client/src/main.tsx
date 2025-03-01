import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "./components/ui/toaster";
import App from "./App";
import "./index.css";

// More comprehensive polyfills for Cardano libraries
if (typeof window !== 'undefined') {
  // Global object polyfill - must come first
  window.global = window;
  
  // Process polyfill
  window.process = {
    env: {},
    nextTick: (cb: Function) => setTimeout(cb, 0),
    version: '',
    versions: {},
    platform: 'browser',
    browser: true
  };
  
  // Buffer polyfill (simplified)
  window.Buffer = {
    from: () => ({}),
    isBuffer: () => false,
    alloc: () => ({})
  };
  
  // Stream polyfill
  if (!window.Stream) {
    window.Stream = {};
  }
  
  // Crypto polyfill (if needed)
  if (!window.crypto) {
    window.crypto = {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }
    };
  }
}

// Instead of using CardanoWalletProvider directly, we'll use our simplified mock 
// for now until we can fully integrate MeshSDK
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </QueryClientProvider>
);
