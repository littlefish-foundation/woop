import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { MeshWalletProvider } from "@/hooks/use-mesh-wallet";
import { ProtectedRoute } from "./lib/protected-route";
import { PublicRoute } from "./lib/public-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import WooperativesPage from "@/pages/wooperatives-page";
import ActionsPage from "@/pages/actions-page";
import MarketplacePage from "@/pages/marketplace-page";
import ImpactPage from "@/pages/impact-page";

function Router() {
  return (
    <Switch>
      <PublicRoute path="/" component={HomePage} />
      <ProtectedRoute path="/wooperatives" component={WooperativesPage} />
      <ProtectedRoute path="/actions" component={ActionsPage} />
      <ProtectedRoute path="/marketplace" component={MarketplacePage} />
      <ProtectedRoute path="/impact" component={ImpactPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MeshWalletProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </MeshWalletProvider>
    </QueryClientProvider>
  );
}

export default App;
