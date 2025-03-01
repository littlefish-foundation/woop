import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                </svg>
              </div>
              <span className="ml-2 text-lg font-semibold text-white">Littlefish Foundation</span>
            </div>
            <p className="text-blue-200 text-sm mb-6">Empowering everyday people to coordinate economic action and create meaningful change through collective efforts.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.016c0 1.368-1.104 2.472-2.46 2.472h-15.080c-1.356 0-2.46-1.104-2.46-2.472v-19.016c0-1.368 1.104-2.472 2.46-2.472h15.080zm-7.54 9.892c-2.084 0-3.768 1.656-3.768 3.703 0 2.047 1.684 3.703 3.768 3.703s3.768-1.656 3.768-3.703c0-2.047-1.684-3.703-3.768-3.703zm-6.4 13.608h12.8v-7.2h-1.712c.154.544.224 1.118.224 1.703 0 3.766-3.092 6.813-6.912 6.813s-6.912-3.047-6.912-6.813c0-.585.07-1.16.224-1.703h-1.712v7.2zm12.8-14.4h-3.2v-3.2h-6.4v3.2h-3.2v3.2h12.8v-3.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-blue-200 hover:text-white transition text-sm">How It Works</Link></li>
              <li><Link href="/wooperatives" className="text-blue-200 hover:text-white transition text-sm">Wooperatives</Link></li>
              <li><Link href="/actions" className="text-blue-200 hover:text-white transition text-sm">Actions</Link></li>
              <li><Link href="/marketplace" className="text-blue-200 hover:text-white transition text-sm">Marketplace</Link></li>
              <li><Link href="/impact" className="text-blue-200 hover:text-white transition text-sm">Impact Dashboard</Link></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Solidarity Fund</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Documentation</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">API</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Whitepaper</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Governance</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Partners</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Audit Reports</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Compliance</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white transition text-sm">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-blue-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-300 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Littlefish Foundation. All rights reserved.</p>
          <p className="text-blue-300 text-sm">Built on <span className="text-white font-medium">Cardano</span> with ❤️ for a better world</p>
        </div>
      </div>
    </footer>
  );
}
