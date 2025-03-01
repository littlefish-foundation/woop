import { useEffect, useState } from "react";
import { useCardanoWallet } from "@/hooks/use-cardano-wallet";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, X, AlertCircle } from "lucide-react";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function ConnectionStatusIndicator() {
  const { walletState } = useCardanoWallet();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [visible, setVisible] = useState(false);
  
  // Determine connection status based on wallet state
  useEffect(() => {
    if (walletState.connecting) {
      setStatus("connecting");
      setVisible(true);
    } else if (walletState.wallet && walletState.walletInfo) {
      setStatus("connected");
      setVisible(true);
      // Hide the indicator after 3 seconds when connected
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (walletState.error) {
      setStatus("error");
      setVisible(true);
      // Hide error indicator after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setStatus("disconnected");
      setVisible(false);
    }
  }, [walletState]);

  // Status-specific configurations
  const statusConfig = {
    disconnected: {
      icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
      text: "Wallet disconnected",
      bgColor: "bg-orange-50 border-orange-200",
      textColor: "text-orange-700"
    },
    connecting: {
      icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
      text: "Connecting...",
      bgColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700"
    },
    connected: {
      icon: <Check className="h-4 w-4 text-emerald-500" />,
      text: `Connected to ${walletState.walletInfo?.name || "wallet"}`,
      bgColor: "bg-emerald-50 border-emerald-200",
      textColor: "text-emerald-700"
    },
    error: {
      icon: <X className="h-4 w-4 text-red-500" />,
      text: walletState.error || "Connection failed",
      bgColor: "bg-red-50 border-red-200",
      textColor: "text-red-700"
    }
  };

  const currentConfig = statusConfig[status];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg border px-4 py-2 shadow-sm",
            currentConfig.bgColor
          )}
        >
          {currentConfig.icon}
          <span className={cn("text-sm font-medium", currentConfig.textColor)}>
            {currentConfig.text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}