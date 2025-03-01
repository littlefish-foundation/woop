import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CTASection() {
  return (
    <section className="py-16 bg-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to make an impact?</h2>
            <p className="text-blue-200 text-lg mb-6">Join thousands of change-makers creating a better world through verified actions and collaborative initiatives.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild className="bg-white text-primary-700 hover:bg-blue-50 font-medium py-3 px-6 h-auto">
                <Link href="/actions">
                  <span>Create an Action</span>
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium py-3 px-6 h-auto">
                <Link href="/wooperatives">
                  <span>Explore Wooperatives</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <div className="bg-primary-700 p-6 rounded-xl max-w-xs">
              <h3 className="text-lg font-medium text-white mb-4">Join the Solidarity Fund</h3>
              <p className="text-blue-200 text-sm mb-4">Support broader initiatives and help allocate resources to high-impact projects.</p>
              <div className="bg-primary-600 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100 text-sm">Current fund size</span>
                  <span className="text-white font-medium">158,945 ADA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Active allocations</span>
                  <span className="text-white font-medium">12 projects</span>
                </div>
              </div>
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                Contribute to Fund
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
