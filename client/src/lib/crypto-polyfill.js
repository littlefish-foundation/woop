// Custom crypto polyfill for MeshSDK
import { Buffer } from 'buffer';

// Re-export crypto-browserify functionality
import cryptoBrowserify from 'crypto-browserify';

// Export specific functions needed by @meshsdk/core-cst
export const pbkdf2Sync = cryptoBrowserify.pbkdf2Sync;

// Add other crypto functions as needed
export function randomBytes(size) {
  const arr = new Uint8Array(size);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(arr);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < size; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(arr);
}

export function createHash(algorithm) {
  return {
    update(data) {
      this._data = data;
      return this;
    },
    digest(encoding) {
      console.warn(`Using mock hash implementation for algorithm: ${algorithm}`);
      // Return a mock hash value
      const mockHash = Buffer.alloc(32); // 32 bytes for SHA-256
      if (encoding === 'hex') {
        return mockHash.toString('hex');
      }
      return mockHash;
    }
  };
}

// Add other commonly used crypto functions
export function createHmac(algorithm, key) {
  return {
    update(data) {
      this._data = data;
      return this;
    },
    digest(encoding) {
      console.warn(`Using mock HMAC implementation for algorithm: ${algorithm}`);
      // Return a mock HMAC value
      const mockHmac = Buffer.alloc(32);
      if (encoding === 'hex') {
        return mockHmac.toString('hex');
      }
      return mockHmac;
    }
  };
}

// Export everything else from crypto-browserify as default
export default cryptoBrowserify; 