import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, ShoppingCart, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import type { Action } from "@shared/schema";

interface RecentActionsProps {
  actions: Action[];
}

export function RecentActions({ actions }: RecentActionsProps) {
  const { user } = useAuth();

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

  // Check if there are actions to display
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-primary-800">Recent Actions</h2>
            <p className="text-gray-600 mt-2">Invest in verified work with real impact</p>
          </div>
          <Button asChild variant="ghost" className="text-primary-600 font-medium group">
            <Link href="/marketplace">
              View marketplace
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {actions.map((action) => (
            <Card key={action.id} className="overflow-hidden hover:shadow-md transition duration-200 border border-gray-200">
              <div className="h-56 relative overflow-hidden">
                <img 
                  src={action.image} 
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
                    <AvatarImage src={`https://i.pravatar.cc/150?img=${action.creatorId + 10}`} alt="Creator" />
                    <AvatarFallback>C{action.creatorId}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {action.creatorId === user?.id ? "You" : `Creator ${action.creatorId}`}
                    </p>
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
                  <Button asChild variant="default" size="sm" className="flex items-center">
                    <Link href={`/marketplace?actionId=${action.id}`}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Purchase
                    </Link>
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
