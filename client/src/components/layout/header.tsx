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
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import both wallet implementations - the original and the MeshSDK version
import { MeshWalletConnect } from "@/components/wallet/mesh-wallet-connect";
import { WalletAuth } from "@/components/wallet/wallet-auth";

export function Header() {
  const [location, navigate] = useLocation();
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
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              
              <img 
                src="/images/logo1d.png" 
                alt="Littlefish Foundation" 
                className="h-5 w-auto ml-2" 
              />
            </Link>
          </div>
            
          {/* Main Navigation - moved outside the inner div for better spacing */}
          <nav className="hidden md:flex space-x-8 ml-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "font-medium transition text-base",
                  location === item.path 
                    ? "text-primary-800 font-semibold" 
                    : "text-gray-600 hover:text-primary-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-100 border-0 rounded-full px-4 py-2 pl-10 w-48 focus:w-64 transition-all duration-300 focus:ring-2 focus:ring-primary-600 focus:bg-white"
            />
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Notifications - Only show for authenticated users */}
          {mounted && user && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          )}
          
          {/* User Menu - For authenticated users */}
          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary-100 text-primary-800">{getInitials(user.name)}</AvatarFallback>
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
          ) : (
            /* Login/Register buttons for unauthenticated users */
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-gray-700 hover:text-primary-700 hover:bg-gray-100"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="mr-1 h-4 w-4" />
                <span>Login</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center bg-primary-700 hover:bg-primary-800"
                onClick={() => navigate("/auth?tab=register")}
              >
                <UserPlus className="mr-1 h-4 w-4" />
                <span>Register</span>
              </Button>
            </div>
          )}
          
          {/* Wallet Connection - Only for authenticated users */}
          {mounted && user && (
            <div className="hidden md:flex items-center space-x-2">
              <MeshWalletConnect />
              <WalletAuth />
            </div>
          )}
          
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
              
              {/* Mobile auth buttons for unauthenticated users */}
              {mounted && !user && (
                <div className="mt-4 flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/auth");
                      setMobileNavOpen(false);
                    }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/auth?tab=register");
                      setMobileNavOpen(false);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </div>
              )}
              
              {/* Mobile wallet connection for authenticated users */}
              {mounted && user && (
                <div className="mt-4 flex flex-col space-y-2">
                  <MeshWalletConnect />
                  <WalletAuth />
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
