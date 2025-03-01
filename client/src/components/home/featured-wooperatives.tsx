import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Wooperative } from "@shared/schema";

interface FeaturedWooperativesProps {
  wooperatives: Wooperative[];
}

export function FeaturedWooperatives({ wooperatives }: FeaturedWooperativesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [joiningId, setJoiningId] = useState<number | null>(null);

  // Function to handle joining a wooperative
  const handleJoinWooperative = async (wooperativeId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join wooperatives.",
        variant: "destructive",
      });
      return;
    }

    setJoiningId(wooperativeId);
    
    try {
      await apiRequest("POST", `/api/wooperatives/${wooperativeId}/join`);
      queryClient.invalidateQueries({ queryKey: ["/api/wooperatives"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-wooperatives"] });
      
      toast({
        title: "Joined wooperative",
        description: "You have successfully joined the wooperative.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join wooperative. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningId(null);
    }
  };

  // Check if there are wooperatives to display
  if (wooperatives.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-primary-800">Featured Wooperatives</h2>
            <p className="text-gray-600 mt-2">Join purpose-driven cooperative initiatives</p>
          </div>
          <Button asChild variant="ghost" className="text-primary-600 font-medium group">
            <Link href="/wooperatives">
              View all
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {wooperatives.map((wooperative) => (
            <Card key={wooperative.id} className="overflow-hidden hover:shadow-md transition duration-200">
              <div className="h-48 overflow-hidden">
                <img 
                  src={wooperative.image} 
                  alt={wooperative.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Badge 
                    variant="outline" 
                    className={`
                      mr-2
                      ${wooperative.category === 'Environmental' ? 'bg-blue-100 text-blue-700' : ''}
                      ${wooperative.category === 'Agriculture' ? 'bg-green-100 text-green-700' : ''}
                      ${wooperative.category === 'Education' ? 'bg-purple-100 text-purple-700' : ''}
                      ${wooperative.category === 'Community' ? 'bg-orange-100 text-orange-700' : ''}
                      ${wooperative.category === 'Technology' ? 'bg-indigo-100 text-indigo-700' : ''}
                      ${wooperative.category === 'Healthcare' ? 'bg-red-100 text-red-700' : ''}
                      ${wooperative.category === 'Arts' ? 'bg-pink-100 text-pink-700' : ''}
                    `}
                  >
                    {wooperative.category}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {wooperative.memberCount} members
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary-800 mb-2">{wooperative.name}</h3>
                <p className="text-gray-600 mb-6 text-sm">{wooperative.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(3, wooperative.memberCount) }).map((_, i) => (
                      <Avatar key={i} className="border-2 border-white h-8 w-8">
                        <AvatarImage src={`https://i.pravatar.cc/150?img=${i + wooperative.id * 3}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                    {wooperative.memberCount > 3 && (
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                        +{wooperative.memberCount - 3}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleJoinWooperative(wooperative.id)}
                    disabled={joiningId === wooperative.id}
                    size="sm"
                  >
                    {joiningId === wooperative.id ? (
                      <>
                        <span className="animate-spin mr-2">⋯</span>
                        Joining...
                      </>
                    ) : "Join"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
