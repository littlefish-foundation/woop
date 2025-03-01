// Polyfills for NodeJS APIs needed by Cardano wallet libraries in browser environment

/**
 * Initialize all necessary polyfills for Cardano wallet libraries
 * This should be imported before any wallet library code
 */
export function initPolyfills() {
  if (typeof window !== 'undefined') {
    // Make Buffer available globally if needed
    if (typeof window.Buffer === 'undefined') {
      try {
        const { Buffer } = require('buffer');
        window.Buffer = Buffer;
      } catch (e) {
        console.warn('Failed to polyfill Buffer:', e);
      }
    }
    
    // Set global to window
    if (typeof global === 'undefined') {
      window.global = window;
    }
    
    // Polyfill process.env if needed
    if (typeof window.process === 'undefined') {
      try {
        window.process = require('process');
      } catch (e) {
        window.process = { env: {} };
        console.warn('Failed to polyfill process:', e);
      }
    } else if (typeof window.process.env === 'undefined') {
      window.process.env = {};
    }
    
    // Add other NodeJS polyfills as needed
    if (typeof window.setImmediate === 'undefined') {
      window.setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => 
        setTimeout(() => callback(...args), 0);
    }
  }
}

// Create type declarations for the polyfilled globals
declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: typeof globalThis;
    process: {
      env: Record<string, string | undefined>;
      [key: string]: any;
    };
    setImmediate: (callback: (...args: any[]) => void, ...args: any[]) => number;
  }
}

export default initPolyfills;