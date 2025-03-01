/**
 * Specific polyfills for MeshSDK
 * This file is loaded before MeshSDK is imported to ensure all required Node.js APIs are available
 */

// Import our crypto polyfill
import * as cryptoPolyfill from './crypto-polyfill';

// Explicitly patch the global crypto object if needed
if (typeof window !== 'undefined') {
  // Ensure crypto exists
  if (!window.crypto) {
    window.crypto = {};
  }
  
  // Add pbkdf2Sync to the global crypto object
  if (!window.crypto.pbkdf2Sync) {
    window.crypto.pbkdf2Sync = cryptoPolyfill.pbkdf2Sync;
  }
  
  // Add other crypto functions
  if (!window.crypto.randomBytes) {
    window.crypto.randomBytes = cryptoPolyfill.randomBytes;
  }
  
  if (!window.crypto.createHash) {
    window.crypto.createHash = cryptoPolyfill.createHash;
  }
  
  if (!window.crypto.createHmac) {
    window.crypto.createHmac = cryptoPolyfill.createHmac;
  }
  
  // Ensure global is defined
  if (typeof global === 'undefined') {
    window.global = window;
  }
  
  // Ensure process is defined
  if (typeof process === 'undefined') {
    window.process = { env: {} };
  } else if (typeof process.env === 'undefined') {
    process.env = {};
  }
  
  // Ensure Buffer is available
  if (typeof Buffer === 'undefined') {
    try {
      const { Buffer } = require('buffer');
      window.Buffer = Buffer;
    } catch (e) {
      console.warn('Failed to polyfill Buffer:', e);
    }
  }
}

// Explicitly patch the Node.js modules system
if (typeof module !== 'undefined') {
  // Patch the crypto module
  try {
    if (!module.exports.crypto) {
      module.exports.crypto = cryptoPolyfill;
    }
  } catch (e) {
    console.warn('Failed to patch module.exports.crypto:', e);
  }
}

// Export the crypto polyfill for direct imports
export default cryptoPolyfill; 