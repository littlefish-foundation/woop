import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import type { Action, Wooperative } from "@shared/schema";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart2, MapPin, Globe, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Chart component to display data visually
const BarChartComponent = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="h-64 flex items-end space-x-6 mt-6 mb-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div 
            className="w-full rounded-t-md transition-all duration-500 ease-in-out" 
            style={{ 
              height: `${(item.value / maxValue) * 100}%`, 
              backgroundColor: item.color 
            }}
          ></div>
          <div className="text-xs font-medium mt-2 text-center">{item.name}</div>
          <div className="text-sm font-bold">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default function ImpactPage() {
  const [timeRange, setTimeRange] = useState<string>("week");
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Query for actions data
  const { 
    data: actions = [], 
    isLoading: isLoadingActions
  } = useQuery<Action[]>({
    queryKey: ["/api/actions"],
  });

  // Query for wooperatives data
  const { 
    data: wooperatives = [], 
    isLoading: isLoadingWooperatives
  } = useQuery<Wooperative[]>({
    queryKey: ["/api/wooperatives"],
  });

  // Calculate stats based on the data
  const calculateStats = () => {
    const totalActions = actions.length;
    const completedActions = actions.filter(action => action.purchased).length;
    const totalWooperatives = wooperatives.length;
    const totalValue = actions.reduce((acc, curr) => acc + curr.price, 0);
    
    return {
      totalActions,
      completedActions,
      completionRate: totalActions > 0 ? (completedActions / totalActions) * 100 : 0,
      totalWooperatives,
      totalValue
    };
  };

  // Calculate category distributions
  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    
    actions.forEach(action => {
      if (categories[action.category]) {
        categories[action.category]++;
      } else {
        categories[action.category] = 1;
      }
    });
    
    const colors = {
      Environmental: "#3182ce", // blue
      Agriculture: "#38a169", // green
      Education: "#805ad5", // purple
      Community: "#dd6b20", // orange
      Technology: "#5a67d8", // indigo
      Healthcare: "#e53e3e", // red
      Arts: "#d53f8c", // pink
    };
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || "#718096" // Default color
    }));
  };

  // Location data for the impact map
  const locationData = [
    { name: "California, USA", count: 312, percentage: 85 },
    { name: "Kerala, India", count: 247, percentage: 65 },
    { name: "Barcelona, Spain", count: 196, percentage: 52 },
    { name: "Cape Town, S. Africa", count: 184, percentage: 48 },
    { name: "Melbourne, Australia", count: 152, percentage: 40 },
  ];

  // Time series data for the charts based on selected time range
  const getTimeSeriesData = () => {
    const periods = timeRange === "week" ? 7 : timeRange === "month" ? 4 : 12;
    const labels = timeRange === "week" ? 
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : 
      timeRange === "month" ? 
        ["Week 1", "Week 2", "Week 3", "Week 4"] : 
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Generate random realistic data
    return labels.map((name, index) => ({
      name,
      value: Math.floor(Math.random() * 50) + 20,
      color: "#3182ce"
    }));
  };

  // Display loading state
  if (isLoadingActions || isLoadingWooperatives) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const stats = calculateStats();
  const categoryData = getCategoryData();
  const timeSeriesData = getTimeSeriesData();

  return (
    <MainLayout>
      <div className="bg-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Impact Dashboard</h1>
              <p className="mt-2 text-blue-100">Track collective impact and metrics across our ecosystem</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={timeRange === "week" ? "secondary" : "outline"} 
                className={timeRange === "week" ? "bg-white text-primary-700" : "text-white border-white/20"}
                onClick={() => setTimeRange("week")}
              >
                Week
              </Button>
              <Button 
                variant={timeRange === "month" ? "secondary" : "outline"} 
                className={timeRange === "month" ? "bg-white text-primary-700" : "text-white border-white/20"}
                onClick={() => setTimeRange("month")}
              >
                Month
              </Button>
              <Button 
                variant={timeRange === "year" ? "secondary" : "outline"} 
                className={timeRange === "year" ? "bg-white text-primary-700" : "text-white border-white/20"}
                onClick={() => setTimeRange("year")}
              >
                Year
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <p className="text-primary-500 text-3xl md:text-4xl font-bold">{stats.totalActions}</p>
                <p className="text-gray-600 mt-2">Actions Created</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <p className="text-green-600 text-3xl md:text-4xl font-bold">{stats.totalWooperatives}</p>
                <p className="text-gray-600 mt-2">Wooperatives</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <p className="text-purple-600 text-3xl md:text-4xl font-bold">15,789</p>
                <p className="text-gray-600 mt-2">Investors</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-teal-50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <p className="text-teal-600 text-3xl md:text-4xl font-bold">${stats.totalValue}K</p>
                <p className="text-gray-600 mt-2">Total Impact</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex space-x-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="auditing">Auditing & Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold">Activity Over Time</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BarChartComponent data={timeSeriesData} />
                    <div className="grid grid-cols-3 gap-4 text-center mt-4">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Actions Created</p>
                        <p className="font-bold text-primary-700">{Math.round(stats.totalActions * 0.7)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Actions Purchased</p>
                        <p className="font-bold text-purple-600">{stats.completedActions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Completion Rate</p>
                        <p className="font-bold text-green-600">{Math.round(stats.completionRate)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Impact Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryData.map((category, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{category.name}</span>
                            <Badge 
                              variant="outline" 
                              className="bg-gray-100 text-gray-600"
                            >
                              {category.value} Actions
                            </Badge>
                          </div>
                          <Progress value={category.value / stats.totalActions * 100} className="h-2" indicatorClassName={`bg-[${category.color}]`} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <BarChartComponent data={categoryData} />
                  </div>
                  <div className="space-y-6">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-start">
                        <div 
                          className="w-4 h-4 mt-1 mr-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <span className="text-sm font-medium" style={{ color: category.color }}>{category.value}</span>
                          </div>
                          <Progress value={category.value / stats.totalActions * 100} className="h-2" indicatorClassName={`bg-[${category.color}]`} />
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.round(category.value / stats.totalActions * 100)}% of total actions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-8">
                  <div className="relative w-full max-w-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1589519160732-576a3e4f0b11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                      alt="World Map" 
                      className="w-full h-auto rounded-lg opacity-30"
                    />
                    <div className="absolute top-1/4 left-1/4 h-6 w-6 rounded-full bg-primary-500 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/3 h-4 w-4 rounded-full bg-primary-500 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 h-5 w-5 rounded-full bg-primary-500 animate-pulse"></div>
                    <div className="absolute bottom-1/3 left-1/3 h-3 w-3 rounded-full bg-primary-500 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 h-4 w-4 rounded-full bg-primary-500 animate-pulse"></div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-4">Top Locations</h3>
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full" 
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="auditing" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>DALL System: Decentralized Auditing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    The Distributed Auditing and Ledgering (DALL) system provides transparent verification of all Actions and Wooperatives.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                        <h3 className="font-medium">On-Chain Verification</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        All Actions are recorded as NFTs on the Cardano blockchain, providing immutable proof of completed work.
                      </p>
                      <div className="mt-3 text-sm flex justify-between">
                        <span>Last 30 days:</span>
                        <span className="font-medium text-primary-600">
                          {stats.totalActions} verified actions
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Globe className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-medium">Community Reviews</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Community members and experts provide additional verification through peer reviews of documented Actions.
                      </p>
                      <div className="mt-3 text-sm flex justify-between">
                        <span>Review completion:</span>
                        <span className="font-medium text-green-600">
                          94% positive
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-4">Latest Audit Trails</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {actions.slice(0, 5).map((action, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{action.title}</div>
                            <div className="text-xs text-gray-500">#{action.nftId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(action.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className={
                              action.purchased 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }>
                              {action.purchased ? "Completed" : "Pending"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                              <span>Verified</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
