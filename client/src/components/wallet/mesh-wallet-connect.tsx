// This is a placeholder component that will be updated with MeshSDK functionality 
// once we've solved the polyfill issues
import { useState } from 'react';
import { useMeshWallet } from '@/hooks/use-mesh-wallet';
import { formatAdaValue } from '@/lib/cardano';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Wallet as WalletIcon, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatusIndicator } from './connection-status-indicator';

export function MeshWalletConnect() {
  const { walletState, availableWallets, loadingWallets, connect, disconnect, refreshWalletInfo } = useMeshWallet();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle wallet connection
  const handleConnect = async (walletName: string) => {
    setDialogOpen(false);
    await connect(walletName);
  };

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    await disconnect();
  };

  // Handle wallet info refresh
  const handleRefresh = async () => {
    if (!walletState.wallet) return;
    
    setRefreshing(true);
    try {
      await refreshWalletInfo();
    } finally {
      setRefreshing(false);
    }
  };

  // Display wallet selection dialog if not connected
  if (!walletState.wallet) {
    return (
      <>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <WalletIcon className="h-4 w-4" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Cardano Wallet</DialogTitle>
            </DialogHeader>
            {loadingWallets ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading available wallets...</p>
              </div>
            ) : availableWallets.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-muted-foreground mb-4">
                  No Cardano wallets detected. Please install one of the following wallets:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href="https://namiwallet.io/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <img 
                      src="https://namiwallet.io/favicon-32x32.png" 
                      alt="Nami" 
                      className="h-8 w-8 mb-2" 
                    />
                    <span>Nami</span>
                  </a>
                  <a 
                    href="https://eternl.io/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <img 
                      src="https://eternl.io/app/favicon.ico" 
                      alt="Eternl" 
                      className="h-8 w-8 mb-2" 
                    />
                    <span>Eternl</span>
                  </a>
                  <a 
                    href="https://vespr.xyz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <img 
                      src="https://vespr.xyz/favicon-32x32.png" 
                      alt="Vespr" 
                      className="h-8 w-8 mb-2" 
                    />
                    <span>Vespr</span>
                  </a>
                  <a 
                    href="https://flint-wallet.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <img 
                      src="https://flint-wallet.com/favicon.svg" 
                      alt="Flint" 
                      className="h-8 w-8 mb-2" 
                    />
                    <span>Flint</span>
                  </a>
                </div>
              </div>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                <div className="grid gap-4 py-4">
                  {availableWallets.map((wallet) => (
                    <Card 
                      key={wallet.name}
                      className="flex items-center p-4 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleConnect(wallet.name)}
                    >
                      <Avatar className="h-10 w-10 mr-4">
                        {wallet.icon ? (
                          <AvatarImage src={wallet.icon} alt={wallet.name} />
                        ) : (
                          <AvatarFallback>{wallet.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{wallet.name}</h4>
                        <p className="text-xs text-muted-foreground">v{wallet.version}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Connect
                      </Button>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Display connected wallet info
  return (
    <>
      <ConnectionStatusIndicator />
      <div className="relative group">
        <Button 
          variant="outline" 
          className="gap-2 border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800"
        >
          <WalletIcon className="h-4 w-4" />
          <span className="truncate max-w-[100px]">
            {walletState.walletInfo?.handle 
              ? `$${walletState.walletInfo.handle}`
              : `${walletState.walletInfo?.address.substring(0, 8)}...${walletState.walletInfo?.address.substring(walletState.walletInfo.address.length - 4)}`
            }
          </span>
        </Button>
        
        {/* Wallet dropdown */}
        <div className="absolute right-0 mt-2 w-80 p-5 rounded-md shadow-lg bg-white border border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
          <div className="mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{walletState.walletInfo?.name}</h4>
              <Badge variant={walletState.walletInfo?.network === 0 ? "secondary" : "default"}>
                {walletState.walletInfo?.network === 0 ? "Testnet" : "Mainnet"}
              </Badge>
            </div>
            {walletState.walletInfo?.handle && (
              <div className="mb-2">
                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-sm font-medium py-1 px-2">
                  ${walletState.walletInfo.handle}
                </Badge>
              </div>
            )}
            {/* Display additional handles if available */}
            {walletState.walletInfo?.handles && walletState.walletInfo.handles.length > 1 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Additional handles:</p>
                <div className="flex flex-wrap gap-1">
                  {walletState.walletInfo.handles.slice(1).map((handle, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium py-0.5 px-1.5"
                    >
                      ${handle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground break-all">{walletState.walletInfo?.address}</p>
            {walletState.walletInfo?.rewardAddress && (
              <p className="text-xs text-muted-foreground mt-1 break-all">
                <span className="font-medium">Stake:</span> {walletState.walletInfo.rewardAddress}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Balance:</span>
              <div className="flex items-center">
                <span className="font-semibold mr-2">
                  {walletState.walletInfo?.balance ? formatAdaValue(walletState.walletInfo.balance.lovelace) : "0 ₳"}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {walletState.walletInfo?.balance.assets.length 
                ? `+ ${walletState.walletInfo.balance.assets.length} asset types`
                : "No assets"
              }
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleDisconnect}>
            Disconnect Wallet
          </Button>
        </div>
      </div>
    </>
  );
}