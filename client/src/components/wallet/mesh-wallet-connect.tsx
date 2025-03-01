import { CardanoWallet, useWallet } from '@meshsdk/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Wallet as WalletIcon, Loader2 } from 'lucide-react';

// Helper function to format ADA value (from lovelace)
const formatAdaValue = (lovelace: string): string => {
  const ada = parseInt(lovelace) / 1_000_000;
  return `${ada.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ₳`;
};

export function MeshWalletConnect() {
  const { wallet, connected, name, connecting, disconnect } = useWallet();

  // Display wallet selection using MeshSDK's CardanoWallet when not connected
  if (!connected) {
    return (
      <div className="flex items-center">
        {connecting ? (
          <Button variant="outline" className="gap-2" disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </Button>
        ) : (
          <CardanoWallet
            label="Connect Wallet"
            persist={true}
            onConnected={() => console.log('Wallet connected successfully')}
          />
        )}
      </div>
    );
  }

  // Display connected wallet info
  return (
    <div className="relative group">
      <Button 
        variant="outline" 
        className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
      >
        <WalletIcon className="h-4 w-4" />
        <span className="truncate max-w-[100px]">{name || 'Connected'}</span>
      </Button>
      
      {/* Wallet dropdown */}
      <div className="absolute right-0 mt-2 w-72 p-4 rounded-md shadow-lg bg-white border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
        <div className="mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{name}</h4>
            <Badge variant="secondary">Connected</Badge>
          </div>
          {wallet && (
            <p className="text-xs text-muted-foreground break-all">
              {/* Add wallet address here if available */}
            </p>
          )}
        </div>
        
        <Button variant="outline" className="w-full" onClick={() => disconnect()}>
          Disconnect Wallet
        </Button>
      </div>
    </div>
  );
}