/**
 * Type declarations for global objects and interfaces
 */

// Extend the Window interface to include Cardano wallets
interface Cardano {
  [key: string]: any;
  nami?: any;
  eternl?: any;
  flint?: any;
  vespr?: any;
}

interface Window {
  cardano?: Cardano;
} 