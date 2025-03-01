import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import type { Action, Wooperative } from "@shared/schema";
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
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, PlusCircle, ShoppingCart, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Schema for creating an action
const createActionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  wooperativeId: z.number().positive("Please select a wooperative"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  image: z.string().url("Please enter a valid image URL"),
  proofOfActivity: z.object({
    images: z.array(z.string()).optional(),
    documents: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
});

type CreateActionForm = z.infer<typeof createActionSchema>;

export default function ActionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Query for all actions
  const { 
    data: actions = [], 
    isLoading: isLoadingActions
  } = useQuery<Action[]>({
    queryKey: ["/api/actions"],
  });

  // Query for user's actions
  const { 
    data: myActions = [],
    isLoading: isLoadingMyActions
  } = useQuery<Action[]>({
    queryKey: ["/api/my-actions"],
    enabled: !!user,
  });

  // Query for wooperatives for action creation
  const { 
    data: wooperatives = [],
  } = useQuery<Wooperative[]>({
    queryKey: ["/api/my-wooperatives"],
    enabled: !!user,
  });

  // Form for creating an action
  const form = useForm<CreateActionForm>({
    resolver: zodResolver(createActionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      wooperativeId: 0,
      location: "",
      price: 100,
      image: "",
      proofOfActivity: {
        images: [],
        documents: [],
        notes: "",
      },
    },
  });

  // Function to handle action creation
  const handleCreateAction = async (data: CreateActionForm) => {
    try {
      await apiRequest("POST", "/api/actions", data);
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-actions"] });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Action created",
        description: "Your action has been created successfully and is now available in the marketplace.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create action. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get creator name for an action
  const getCreatorName = (action: Action) => {
    if (action.creatorId === user?.id) {
      return "You";
    }
    // In a real app, we would fetch user data or have it in the action object
    return "Unknown User";
  };

  // Get wooperative name for an action
  const getWooperativeName = (action: Action) => {
    const wooperative = wooperatives.find(w => w.id === action.wooperativeId);
    return wooperative?.name || "Unknown Wooperative";
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
  if (isLoadingActions || isLoadingMyActions) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Actions</h1>
              <p className="mt-2 text-blue-100">Document and verify your impactful work</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-primary-700 hover:bg-blue-50">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Action
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create a New Action</DialogTitle>
                  <DialogDescription>
                    Document your work with verifiable proof that can be purchased in the marketplace.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateAction)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Beach Cleanup - 300lbs Removed" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe what you did, the impact it had, and any relevant details" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Environmental">Environmental</SelectItem>
                                <SelectItem value="Agriculture">Agriculture</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Community">Community</SelectItem>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Arts">Arts</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="wooperativeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wooperative</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a wooperative" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {wooperatives.map(wooperative => (
                                  <SelectItem key={wooperative.id} value={wooperative.id.toString()}>
                                    {wooperative.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Venice Beach, California" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (ADA)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="proofOfActivity.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proof of Activity Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional notes about your proof of activity" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Create Action</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex space-x-2">
            <TabsTrigger value="all">All Actions</TabsTrigger>
            <TabsTrigger value="my">My Actions</TabsTrigger>
            <TabsTrigger value="purchased">My Purchases</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {actions.map((action) => (
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
                        <AvatarImage src={`https://i.pravatar.cc/150?img=${action.creatorId + 10}`} alt={getCreatorName(action)} />
                        <AvatarFallback>{getCreatorName(action).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getCreatorName(action)}</p>
                        <p className="text-xs text-gray-500">{getWooperativeName(action)}</p>
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
                      <Button variant="outline" className="text-sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my" className="space-y-8">
            {myActions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myActions.map((action) => (
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
                          <AvatarImage src={`https://i.pravatar.cc/150?img=${action.creatorId + 10}`} alt={getCreatorName(action)} />
                          <AvatarFallback>{getCreatorName(action).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getCreatorName(action)}</p>
                          <p className="text-xs text-gray-500">{getWooperativeName(action)}</p>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-primary-800 mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{formatDate(new Date(action.createdAt))}</span>
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
                        <div className="flex space-x-2">
                          <Badge variant={action.purchased ? "secondary" : "outline"} className="text-xs">
                            {action.purchased ? "Purchased" : "Available"}
                          </Badge>
                          <Button variant="outline" className="text-sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <PlusCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No actions yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't created any actions yet. Document your impactful work and make it available in the marketplace.</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Action
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="purchased" className="space-y-8">
            {actions.filter(action => action.purchased && action.purchaserId === user?.id).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {actions.filter(action => action.purchased && action.purchaserId === user?.id).map((action) => (
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
                        <Badge variant="default" className="bg-purple-600/90 text-white backdrop-blur-sm">
                          Owned
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
                          <AvatarFallback>{getCreatorName(action).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getCreatorName(action)}</p>
                          <p className="text-xs text-gray-500">{getWooperativeName(action)}</p>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-primary-800 mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>Purchased: {action.purchasedAt ? formatDate(action.purchasedAt) : formatDate(new Date())}</span>
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
                        <Button variant="outline" className="text-sm">
                          View Certificate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't purchased any actions yet. Check out the marketplace to invest in verified impact.</p>
                <Button asChild>
                  <Link href="/marketplace">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Go to Marketplace
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
