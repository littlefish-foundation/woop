// Polyfills for NodeJS APIs needed by Cardano wallet libraries in browser environment
// @ts-ignore - Import crypto polyfill without type checking
import * as cryptoPolyfill from './crypto-polyfill';

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
    
    // Set global to window - CRITICAL for MeshSDK
    if (typeof global === 'undefined') {
      // @ts-ignore - we're explicitly setting global
      window.global = window;
    }
    
    // Polyfill process.env if needed
    if (typeof window.process === 'undefined') {
      try {
        window.process = require('process');
      } catch (e) {
        // @ts-ignore - simplified process object
        window.process = { env: {} };
        console.warn('Failed to polyfill process:', e);
      }
    } else if (typeof window.process.env === 'undefined') {
      window.process.env = {};
    }
    
    // Add other NodeJS polyfills as needed
    if (typeof window.setImmediate === 'undefined') {
      // @ts-ignore - simplified setImmediate implementation
      window.setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => 
        setTimeout(() => callback(...args), 0);
    }
    
    // Polyfill crypto for MeshSDK if needed
    if (typeof window.crypto === 'undefined' || typeof window.crypto.getRandomValues === 'undefined') {
      try {
        // Create a new crypto object or use the existing one
        const cryptoObj = window.crypto || {};
        
        // Add getRandomValues if it doesn't exist
        if (!cryptoObj.getRandomValues) {
          // @ts-ignore - we're adding a custom implementation
          cryptoObj.getRandomValues = function<T extends ArrayBufferView | null>(buffer: T): T {
            if (buffer === null) return buffer;
            
            const bytes = cryptoPolyfill.randomBytes(buffer.byteLength);
            // Copy bytes to the buffer
            const uint8View = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            uint8View.set(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
            
            return buffer;
          };
        }
        
        // @ts-ignore - assign the crypto object
        window.crypto = cryptoObj;
      } catch (e) {
        console.warn('Failed to polyfill crypto:', e);
      }
    }
    
    // Ensure crypto functions are available globally
    if (typeof window.crypto.pbkdf2Sync === 'undefined') {
      // @ts-ignore - adding custom crypto functions
      window.crypto.pbkdf2Sync = cryptoPolyfill.pbkdf2Sync;
    }
    
    // Add other crypto functions that MeshSDK might need
    if (typeof window.crypto.randomBytes === 'undefined') {
      // @ts-ignore - adding custom crypto functions
      window.crypto.randomBytes = cryptoPolyfill.randomBytes;
    }
    
    if (typeof window.crypto.createHash === 'undefined') {
      // @ts-ignore - adding custom crypto functions
      window.crypto.createHash = cryptoPolyfill.createHash;
    }
    
    if (typeof window.crypto.createHmac === 'undefined') {
      // @ts-ignore - adding custom crypto functions
      window.crypto.createHmac = cryptoPolyfill.createHmac;
    }
    
    // Polyfill TextEncoder/TextDecoder if needed
    if (typeof window.TextEncoder === 'undefined') {
      try {
        const util = require('util');
        window.TextEncoder = util.TextEncoder;
        window.TextDecoder = util.TextDecoder;
      } catch (e) {
        console.warn('Failed to polyfill TextEncoder/TextDecoder:', e);
      }
    }
    
    // Ensure Node.js crypto module is available
    try {
      // This is a hack to make sure the crypto module is available
      // Some libraries might try to require('crypto') directly
      if (typeof window.require === 'function') {
        const originalRequire = window.require;
        // @ts-ignore - we're patching require
        window.require = function(moduleName: string) {
          if (moduleName === 'crypto') {
            return cryptoPolyfill;
          }
          return originalRequire(moduleName);
        };
      }
    } catch (e) {
      console.warn('Failed to patch require for crypto:', e);
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
    crypto: {
      getRandomValues: <T extends ArrayBufferView | null>(array: T) => T;
      pbkdf2Sync?: any;
      randomBytes?: any;
      createHash?: any;
      createHmac?: any;
      [key: string]: any;
    };
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
    require?: (id: string) => any;
  }
  
  // Ensure global is available in the global scope
  // This is a type declaration, not a variable declaration
  var global: typeof globalThis;
}

export default initPolyfills;