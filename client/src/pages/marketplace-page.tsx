import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import type { Action, User } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, ShoppingCart, Calendar, MapPin, Filter, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function MarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Query for all actions
  const { 
    data: actions = [], 
    isLoading: isLoadingActions
  } = useQuery<Action[]>({
    queryKey: ["/api/actions"],
  });

  // Filter actions based on search term and category
  const filteredActions = actions.filter(action => {
    const matchesSearch = searchTerm === "" || 
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || action.category === categoryFilter;
    
    return matchesSearch && matchesCategory && !action.purchased;
  });

  // Function to handle action purchase
  const handlePurchaseAction = async () => {
    if (!selectedAction) return;
    
    try {
      await apiRequest("POST", `/api/actions/${selectedAction.id}/purchase`);
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] });
      setPurchaseDialogOpen(false);
      setSelectedAction(null);
      
      toast({
        title: "Purchase successful",
        description: "You have successfully purchased this Action.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase Action. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format date relative to now
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return format(new Date(date), 'MMM d, yyyy');
    }
  };

  // Display loading state
  if (isLoadingActions) {
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

  return (
    <MainLayout>
      <div className="bg-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Action Marketplace</h1>
              <p className="mt-2 text-blue-100">Invest in verified Actions with real impact</p>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Input 
                  type="text" 
                  placeholder="Search actions..." 
                  className="pl-10 bg-white/10 text-white border-white/20 placeholder:text-white/50 focus:bg-white/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-white/10 text-white border-white/20">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredActions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActions.map((action) => (
              <Card key={action.id} className="overflow-hidden hover:shadow-md transition duration-200 border border-gray-200">
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src={action.image || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"} 
                    alt={action.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full py-1 px-3 flex items-center text-sm font-medium text-primary-700">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{action.price} ADA</span>
                  </div>
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <Badge variant="default" className="bg-green-600/90 text-white backdrop-blur-sm">
                      Verified
                    </Badge>
                    <Badge variant="default" className={`
                      backdrop-blur-sm
                      ${action.category === 'Environmental' ? 'bg-blue-600/90' : ''}
                      ${action.category === 'Agriculture' ? 'bg-green-600/90' : ''}
                      ${action.category === 'Education' ? 'bg-purple-600/90' : ''}
                      ${action.category === 'Community' ? 'bg-orange-600/90' : ''}
                      ${action.category === 'Technology' ? 'bg-indigo-600/90' : ''}
                      ${action.category === 'Healthcare' ? 'bg-red-600/90' : ''}
                      ${action.category === 'Arts' ? 'bg-pink-600/90' : ''}
                    `}>
                      {action.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src="https://i.pravatar.cc/150" alt="Creator" />
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Creator {action.creatorId}</p>
                      <p className="text-xs text-gray-500">Wooperative {action.wooperativeId}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-primary-800 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(action.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{action.location}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      NFT #{action.nftId}
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => {
                        setSelectedAction(action);
                        setPurchaseDialogOpen(true);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Purchase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No actions found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm || categoryFilter !== "all" 
                ? "Try adjusting your search filters to find more actions."
                : "There are currently no actions available in the marketplace."}
            </p>
            {(searchTerm || categoryFilter !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Purchase Confirmation Dialog */}
      {selectedAction && (
        <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                You're about to purchase this Action as an NFT. This will transfer funds to the creator and wooperative.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center mb-4">
                <img 
                  src={selectedAction.image || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"} 
                  alt={selectedAction.title} 
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h4 className="font-semibold text-lg">{selectedAction.title}</h4>
                  <p className="text-sm text-gray-500">NFT #{selectedAction.nftId}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">{selectedAction.price} ADA</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Creator Share (70%)</span>
                  <span>{Math.round(selectedAction.price * 0.7)} ADA</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Wooperative Share (25%)</span>
                  <span>{Math.round(selectedAction.price * 0.25)} ADA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Solidarity Fund (5%)</span>
                  <span>{Math.round(selectedAction.price * 0.05)} ADA</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                By purchasing this Action, you are directly supporting the creator and the wooperative's mission. The NFT will be transferred to your wallet.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
              <Button onClick={handlePurchaseAction}>Confirm Purchase</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}
