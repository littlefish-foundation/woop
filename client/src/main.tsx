import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "./components/ui/toaster";
import { CardanoWalletProvider } from "@/hooks/use-cardano-wallet";
import App from "./App";
import "./index.css";

// Use our custom CardanoWalletProvider
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CardanoWalletProvider>
        <App />
        <Toaster />
      </CardanoWalletProvider>
    </AuthProvider>
  </QueryClientProvider>
);
