import { Card, CardContent } from "@/components/ui/card";

interface StatsProps {
  actionsCount: number;
  wooperativesCount: number;
  investorsCount: number;
  totalImpact: number;
}

export function StatsSection({ 
  actionsCount, 
  wooperativesCount, 
  investorsCount, 
  totalImpact 
}: StatsProps) {
  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format currency values
  const formatCurrency = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    } else {
      return `$${num}`;
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Card className="bg-blue-50 border-0">
            <CardContent className="p-6">
              <p className="text-primary-500 text-3xl md:text-4xl font-bold">{formatNumber(actionsCount)}</p>
              <p className="text-gray-600 mt-2">Actions Created</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-0">
            <CardContent className="p-6">
              <p className="text-green-600 text-3xl md:text-4xl font-bold">{formatNumber(wooperativesCount)}</p>
              <p className="text-gray-600 mt-2">Wooperatives</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-0">
            <CardContent className="p-6">
              <p className="text-purple-600 text-3xl md:text-4xl font-bold">{formatNumber(investorsCount)}</p>
              <p className="text-gray-600 mt-2">Investors</p>
            </CardContent>
          </Card>
          
          <Card className="bg-teal-50 border-0">
            <CardContent className="p-6">
              <p className="text-teal-600 text-3xl md:text-4xl font-bold">{formatCurrency(totalImpact)}</p>
              <p className="text-gray-600 mt-2">Total Impact</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
