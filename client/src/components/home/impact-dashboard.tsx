import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, BarChart2 } from "lucide-react";

// Sample data for charts and visualizations
const categoryData = [
  { name: "Environmental", value: 1245, color: "#3182ce" },
  { name: "Education", value: 832, color: "#805ad5" },
  { name: "Agriculture", value: 647, color: "#48bb78" },
];

const locationData = [
  { name: "California, USA", count: 312, percentage: 85 },
  { name: "Kerala, India", count: 247, percentage: 65 },
  { name: "Barcelona, Spain", count: 196, percentage: 52 },
  { name: "Cape Town, S. Africa", count: 184, percentage: 48 },
  { name: "Melbourne, Australia", count: 152, percentage: 40 },
];

// Bar chart component
const BarChart = () => {
  return (
    <div className="chart-container h-64 border-b border-gray-100 mb-4 relative">
      <div className="chart-bar animate-rise" style={{ height: '70%', left: '10%', backgroundColor: '#3182ce' }}></div>
      <div className="chart-bar animate-rise" style={{ height: '50%', left: '25%', backgroundColor: '#38b2ac', animationDelay: '0.1s' }}></div>
      <div className="chart-bar animate-rise" style={{ height: '85%', left: '40%', backgroundColor: '#805ad5', animationDelay: '0.2s' }}></div>
      <div className="chart-bar animate-rise" style={{ height: '35%', left: '55%', backgroundColor: '#e53e3e', animationDelay: '0.3s' }}></div>
      <div className="chart-bar animate-rise" style={{ height: '60%', left: '70%', backgroundColor: '#f6ad55', animationDelay: '0.4s' }}></div>
      <div className="chart-bar animate-rise" style={{ height: '45%', left: '85%', backgroundColor: '#48bb78', animationDelay: '0.5s' }}></div>
    </div>
  );
};

export function ImpactDashboard() {
  const [timeRange, setTimeRange] = useState<string>("week");

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <style jsx global>{`
        .chart-bar {
          position: absolute;
          bottom: 0;
          width: 10%;
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }
        
        @keyframes rise {
          from { height: 0; }
          to { height: var(--final-height); }
        }
        
        .animate-rise {
          animation: rise 1s ease forwards;
          --final-height: var(--height);
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-primary-800">Global Impact Dashboard</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Track the collective impact of actions worldwide</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-semibold text-lg text-primary-800">Impact by Category</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant={timeRange === "week" ? "default" : "outline"} 
                      onClick={() => setTimeRange("week")}
                      size="sm"
                      className="text-xs font-medium rounded-full px-3"
                    >
                      Week
                    </Button>
                    <Button 
                      variant={timeRange === "month" ? "default" : "outline"} 
                      onClick={() => setTimeRange("month")}
                      size="sm"
                      className="text-xs font-medium rounded-full px-3"
                    >
                      Month
                    </Button>
                    <Button 
                      variant={timeRange === "year" ? "default" : "outline"} 
                      onClick={() => setTimeRange("year")}
                      size="sm"
                      className="text-xs font-medium rounded-full px-3"
                    >
                      Year
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <BarChart />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  {categoryData.map((category, index) => (
                    <div key={index}>
                      <p className="text-gray-500 text-sm mb-1">{category.name}</p>
                      <p className="font-bold" style={{ color: category.color }}>{category.value} Actions</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-semibold text-lg text-primary-800">Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locationData.map((location, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 mr-3 rounded-full bg-blue-100 flex items-center justify-center text-primary-700">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-gray-900">{location.name}</p>
                          <span className="text-sm text-primary-600 font-medium">{location.count}</span>
                        </div>
                        <Progress value={location.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
