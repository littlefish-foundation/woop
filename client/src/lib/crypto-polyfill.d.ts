// TypeScript declaration file for crypto-polyfill.js
import { Buffer } from 'buffer';

export function pbkdf2Sync(
  password: string | Buffer,
  salt: string | Buffer,
  iterations: number,
  keylen: number,
  digest: string
): Buffer;

export function randomBytes(size: number): Buffer;

export function createHash(algorithm: string): {
  update(data: string | Buffer): {
    digest(encoding?: string): string | Buffer;
  };
};

export function createHmac(algorithm: string, key: string | Buffer): {
  update(data: string | Buffer): {
    digest(encoding?: string): string | Buffer;
  };
};

export default {
  pbkdf2Sync,
  randomBytes,
  createHash,
  createHmac
}; 