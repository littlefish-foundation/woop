import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import both wallet implementations - the original and the MeshSDK version
import { WalletConnect } from "@/components/wallet/wallet-connect";
import { MeshWalletConnect } from "@/components/wallet/mesh-wallet-connect";
import { WalletAuth } from "@/components/wallet/wallet-auth";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "Wooperatives", path: "/wooperatives" },
    { name: "Actions", path: "/actions" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Impact", path: "/impact" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                </svg>
              </div>
              <span className="ml-2 text-lg font-semibold text-primary-800">Littlefish Foundation</span>
            </Link>
            
            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-6 ml-6">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={cn(
                    "font-medium transition",
                    location === item.path 
                      ? "text-primary-700" 
                      : "text-gray-500 hover:text-primary-500"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-100 border-0 rounded-full px-4 py-2 pl-10 w-48 focus:w-64 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:bg-white"
            />
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* User Menu */}
          {mounted && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-2">
            <WalletConnect />
            {mounted && user && <WalletAuth />}
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <Menu className="h-6 w-6 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={cn(
                    "py-2 px-3 rounded-md font-medium",
                    location === item.path 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-4 flex flex-col space-y-2">
                <WalletConnect />
                {mounted && user && <WalletAuth />}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
