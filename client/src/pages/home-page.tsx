import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturedWooperatives } from "@/components/home/featured-wooperatives";
import { RecentActions } from "@/components/home/recent-actions";
import { ImpactDashboard } from "@/components/home/impact-dashboard";
import { CTASection } from "@/components/home/cta-section";
import { useQuery } from "@tanstack/react-query";
import type { Wooperative, Action } from "@shared/schema";

export default function HomePage() {
  const { data: wooperatives = [] } = useQuery<Wooperative[]>({
    queryKey: ["/api/wooperatives"],
  });

  const { data: actions = [] } = useQuery<Action[]>({
    queryKey: ["/api/actions"],
  });

  // Calculate stats
  const stats = {
    actions: actions.length,
    wooperatives: wooperatives.length,
    investors: Math.floor(Math.random() * 10000) + 5000, // Mock data
    totalImpact: Math.floor(Math.random() * 1000000) + 500000, // Mock data in $
  };

  return (
    <MainLayout>
      <HeroSection />
      <StatsSection 
        actionsCount={stats.actions}
        wooperativesCount={stats.wooperatives}
        investorsCount={stats.investors}
        totalImpact={stats.totalImpact}
      />
      <FeaturedWooperatives wooperatives={wooperatives.slice(0, 3)} />
      <RecentActions actions={actions.slice(0, 3)} />
      <ImpactDashboard />
      <CTASection />
    </MainLayout>
  );
}
