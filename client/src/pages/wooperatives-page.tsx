import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import type { Wooperative, User } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for creating a wooperative
const createWooperativeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  charter: z.string().min(20, "Charter must be at least 20 characters"),
  image: z.string().url("Please enter a valid image URL"),
  proposerShare: z.number().min(60).max(80),
  wooperativeShare: z.number().min(10).max(30),
  solidarityShare: z.number().min(1).max(5),
});

type CreateWooperativeForm = z.infer<typeof createWooperativeSchema>;

export default function WooperativesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Query for all wooperatives
  const { 
    data: wooperatives = [], 
    isLoading 
  } = useQuery<Wooperative[]>({
    queryKey: ["/api/wooperatives"],
  });

  // Query for user's wooperatives
  const { 
    data: myWooperatives = [],
  } = useQuery<Wooperative[]>({
    queryKey: ["/api/my-wooperatives"],
    enabled: !!user,
  });

  // Form for creating a wooperative
  const form = useForm<CreateWooperativeForm>({
    resolver: zodResolver(createWooperativeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      charter: "",
      image: "",
      proposerShare: 70,
      wooperativeShare: 25,
      solidarityShare: 5,
    },
  });

  // Function to handle wooperative creation
  const handleCreateWooperative = async (data: CreateWooperativeForm) => {
    try {
      await apiRequest("POST", "/api/wooperatives", data);
      queryClient.invalidateQueries({ queryKey: ["/api/wooperatives"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-wooperatives"] });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Wooperative created",
        description: "Your wooperative has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create wooperative. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle joining a wooperative
  const handleJoinWooperative = async (wooperativeId: number) => {
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
    }
  };

  // Helper function to determine if user is a member of a wooperative
  const isMember = (wooperativeId: number) => {
    return myWooperatives.some(w => w.id === wooperativeId);
  };

  // Helper function to calculate shares - ensures they total 100%
  const updateShares = (
    field: "proposerShare" | "wooperativeShare" | "solidarityShare", 
    value: number
  ) => {
    const currentValues = form.getValues();
    const remaining = 100 - value;
    
    if (field === "proposerShare") {
      // Adjust other shares proportionally
      const totalOthers = currentValues.wooperativeShare + currentValues.solidarityShare;
      if (totalOthers > 0) {
        const ratio = currentValues.wooperativeShare / totalOthers;
        const newWoopShare = Math.round(remaining * ratio);
        const newSolidarityShare = remaining - newWoopShare;
        
        form.setValue("wooperativeShare", newWoopShare);
        form.setValue("solidarityShare", newSolidarityShare);
      }
    } else if (field === "wooperativeShare") {
      // Adjust solidarity share to maintain total of 100%
      const newSolidarityShare = 100 - value - currentValues.proposerShare;
      form.setValue("solidarityShare", newSolidarityShare);
    } else {
      // Adjust wooperative share to maintain total of 100%
      const newWoopShare = 100 - value - currentValues.proposerShare;
      form.setValue("wooperativeShare", newWoopShare);
    }
  };

  // Display loading state
  if (isLoading) {
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
              <h1 className="text-3xl font-bold">Wooperatives</h1>
              <p className="mt-2 text-blue-100">Join purpose-driven cooperative initiatives and collaborate for change</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-primary-700 hover:bg-blue-50">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Wooperative
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create a New Wooperative</DialogTitle>
                  <DialogDescription>
                    Define the purpose, goals, and governance structure for your Wooperative.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateWooperative)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wooperative Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Ocean Cleanup Initiative" {...field} />
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
                            <Textarea placeholder="Describe the mission and goals of your wooperative" {...field} />
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
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="charter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charter</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Define the governance rules, mission statement, and objectives" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <h3 className="font-medium">Reward Distribution</h3>
                      <p className="text-sm text-gray-500">Determine how rewards will be distributed when Actions are purchased</p>
                      
                      <FormField
                        control={form.control}
                        name="proposerShare"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Proposer Share: {field.value}%</FormLabel>
                            </div>
                            <FormControl>
                              <Slider 
                                min={60} 
                                max={80} 
                                step={1} 
                                defaultValue={[field.value]} 
                                onValueChange={(value) => {
                                  field.onChange(value[0]);
                                  updateShares("proposerShare", value[0]);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="wooperativeShare"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Wooperative Share: {field.value}%</FormLabel>
                            </div>
                            <FormControl>
                              <Slider 
                                min={10} 
                                max={30} 
                                step={1} 
                                defaultValue={[field.value]} 
                                onValueChange={(value) => {
                                  field.onChange(value[0]);
                                  updateShares("wooperativeShare", value[0]);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="solidarityShare"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Solidarity Share: {field.value}%</FormLabel>
                            </div>
                            <FormControl>
                              <Slider 
                                min={1} 
                                max={5} 
                                step={1} 
                                defaultValue={[field.value]} 
                                onValueChange={(value) => {
                                  field.onChange(value[0]);
                                  updateShares("solidarityShare", value[0]);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between bg-gray-50 p-3 rounded-md">
                        <span className="text-sm">Total</span>
                        <span className="font-medium">
                          {form.watch("proposerShare") + form.watch("wooperativeShare") + form.watch("solidarityShare")}%
                        </span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Wooperative</Button>
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
            <TabsTrigger value="all">All Wooperatives</TabsTrigger>
            <TabsTrigger value="my">My Wooperatives</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wooperatives.map((wooperative) => (
                <Card key={wooperative.id} className="overflow-hidden hover:shadow-md transition duration-200">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={wooperative.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"} 
                      alt={wooperative.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-0 rounded mr-2">
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
                            <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`} />
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
                        variant={isMember(wooperative.id) ? "outline" : "default"}
                        disabled={isMember(wooperative.id)}
                        onClick={() => handleJoinWooperative(wooperative.id)}
                      >
                        {isMember(wooperative.id) ? "Joined" : "Join"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my" className="space-y-8">
            {myWooperatives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myWooperatives.map((wooperative) => (
                  <Card key={wooperative.id} className="overflow-hidden hover:shadow-md transition duration-200">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={wooperative.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"} 
                        alt={wooperative.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-0 rounded mr-2">
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
                              <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                              <AvatarFallback>U{i}</AvatarFallback>
                            </Avatar>
                          ))}
                          {wooperative.memberCount > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                              +{wooperative.memberCount - 3}
                            </div>
                          )}
                        </div>
                        <Button variant="outline">Manage</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No wooperatives yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't joined or created any wooperatives yet. Create a new one or join existing wooperatives.</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Wooperative
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
