import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-16 md:py-24 relative">
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-15"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white drop-shadow-sm">Impact of the Masses</h1>
            <p className="text-lg md:text-xl text-blue-50 mb-8">
              Empowering everyday people to coordinate economic action and create meaningful change through blockchain-powered collective efforts.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild variant="secondary" className="bg-white text-primary-700 hover:bg-blue-50 font-medium py-3 px-6 h-auto rounded-lg shadow-lg">
                <Link href="/wooperatives">
                  <span>Create a Wooperative</span>
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </Button>
              <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 h-auto rounded-lg shadow-lg">
                <Link href="/actions">
                  <span>Explore Actions</span>
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center text-blue-50">
              <span className="flex items-center mr-4 mb-2">
                <Shield className="mr-2 h-5 w-5 text-teal-300" />
                <span>Blockchain-verified impact</span>
              </span>
              <span className="hidden sm:inline mx-2 mb-2">•</span>
              <span className="flex items-center mb-2">
                <Users className="mr-2 h-5 w-5 text-teal-300" />
                <span>Community-driven</span>
              </span>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80" 
                alt="Collaborative community" 
                className="w-full h-auto rounded-lg object-cover brightness-95"
              />
              {/* Subtle gradient overlay on the image */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent rounded-lg"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg max-w-xs">
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3 border border-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" 
                    alt="User profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-primary-800 font-medium">John created an Action</p>
                  <p className="text-gray-500 text-sm">2 hours ago</p>
                </div>
              </div>
              <div className="bg-blue-50 p-2 rounded text-primary-700 text-sm">
                "Planted 50 trees in downtown park #ClimateAction"
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
