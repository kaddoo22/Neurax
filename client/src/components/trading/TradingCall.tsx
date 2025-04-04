import React, { useState } from "react";
import { TradingCall as TradingCallType } from "@/types";
import { CyberButton } from "@/components/ui/cyber-button";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { 
  getAssetIcon, 
  getPositionStyles, 
  getStatusStyles, 
  getProfitLossStyles 
} from "@/lib/utils";

interface TradingCallProps {
  tradingCall: TradingCallType;
  onClose?: (currentPrice: string) => void;
  onShare?: () => void;
  className?: string;
}

const TradingCall: React.FC<TradingCallProps> = ({
  tradingCall,
  onClose,
  onShare,
  className,
}) => {
  const [currentPrice, setCurrentPrice] = useState(tradingCall.currentPrice || tradingCall.entryPrice);
  
  // Calculate profit/loss based on current price
  const calculatePL = () => {
    const entryPrice = parseFloat(tradingCall.entryPrice);
    const current = parseFloat(currentPrice);
    
    if (tradingCall.position === "LONG") {
      return ((current - entryPrice) / entryPrice * 100).toFixed(2);
    } else {
      return ((entryPrice - current) / entryPrice * 100).toFixed(2);
    }
  };

  const profitLoss = calculatePL();
  const profitLossStyles = getProfitLossStyles(profitLoss);
  const positionStyles = getPositionStyles(tradingCall.position);
  
  // Get color based on asset
  const getAssetColor = () => {
    if (tradingCall.asset === "BTC") return "neonGreen";
    if (tradingCall.asset === "ETH") return "electricPurple";
    return "cyberBlue";
  };
  
  return (
    <DashboardCard 
      title={`${tradingCall.position} ${tradingCall.asset}/USD`} 
      titleColor={getAssetColor() as any}
      className={className}
    >
      <div className="flex items-center mb-5">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 flex items-center justify-center border-2 border-neonGreen/40 mr-4">
          <i className={`${tradingCall.asset === 'BTC' ? 'fab fa-bitcoin' : tradingCall.asset === 'ETH' ? 'fab fa-ethereum' : `fas fa-${getAssetIcon(tradingCall.asset)}`} text-2xl ${tradingCall.asset === 'BTC' ? 'text-neonGreen' : tradingCall.asset === 'ETH' ? 'text-electricPurple' : 'text-cyberBlue'}`}></i>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm px-2 py-0.5 ${positionStyles.bgColor} ${positionStyles.textColor} rounded`}>
              {tradingCall.position}
            </span>
            <span className={`text-sm px-2 py-0.5 ${getStatusStyles(tradingCall.status).bgColor} ${getStatusStyles(tradingCall.status).textColor} rounded`}>
              {tradingCall.status}
            </span>
          </div>
          <p className="text-matrixGreen text-sm">
            {tradingCall.asset === 'BTC' ? 'Bitcoin' : 
             tradingCall.asset === 'ETH' ? 'Ethereum' : 
             tradingCall.asset === 'SOL' ? 'Solana' :
             tradingCall.asset === 'ADA' ? 'Cardano' :
             tradingCall.asset === 'DOT' ? 'Polkadot' :
             tradingCall.asset === 'MATIC' ? 'Polygon' :
             tradingCall.asset === 'XRP' ? 'Ripple' :
             tradingCall.asset === 'LINK' ? 'Chainlink' :
             tradingCall.asset === 'UNI' ? 'Uniswap' :
             tradingCall.asset === 'AVAX' ? 'Avalanche' : tradingCall.asset}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="p-3 bg-gradient-to-br from-neonGreen/10 to-transparent border border-neonGreen/30 rounded">
          <p className="text-xs text-matrixGreen/70 mb-1">Entry Price</p>
          <p className="text-xl font-bold text-neonGreen">${tradingCall.entryPrice}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-cyberBlue/10 to-transparent border border-cyberBlue/30 rounded">
          <p className="text-xs text-matrixGreen/70 mb-1">Target Price</p>
          <p className="text-xl font-bold text-cyberBlue">${tradingCall.targetPrice}</p>
        </div>
      </div>
      
      {tradingCall.status === "ACTIVE" ? (
        <>
          <div className="mb-4">
            <label className="text-xs text-matrixGreen/70 mb-1 block">Current Price</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full bg-spaceBlack border border-neonGreen/20 rounded p-2 text-matrixGreen font-mono"
                placeholder="Enter current price..."
              />
              <span className={`text-lg font-bold ${profitLossStyles.textColor}`}>
                {parseFloat(profitLoss) > 0 ? '+' : ''}{profitLoss}%
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <CyberButton
              className="flex-1"
              onClick={() => onClose && onClose(currentPrice)}
              iconLeft={<i className="fas fa-check-circle"></i>}
            >
              CLOSE POSITION
            </CyberButton>
            <CyberButton
              className="flex-1"
              onClick={onShare}
              iconLeft={<i className="fas fa-share-alt"></i>}
            >
              SHARE
            </CyberButton>
          </div>
        </>
      ) : (
        <div className="p-3 bg-gradient-to-br from-electricPurple/10 to-transparent border border-electricPurple/30 rounded mb-4">
          <p className="text-xs text-matrixGreen/70 mb-1">Final Result</p>
          <p className={`text-xl font-bold ${profitLossStyles.textColor}`}>
            {parseFloat(tradingCall.profitLoss || '0') > 0 ? '+' : ''}{tradingCall.profitLoss}%
          </p>
          <p className="text-xs text-matrixGreen/70 mt-1">
            Closed at ${tradingCall.currentPrice}
          </p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-matrixGreen/70 border border-neonGreen/20 rounded p-3 bg-spaceBlack/50">
        <p className="text-neonGreen mb-1">Trading Reasoning:</p>
        <p>
          {tradingCall.position === "LONG" 
            ? `Bullish pattern detected on ${tradingCall.asset}. Strong support levels and increasing volume indicate potential upward movement.` 
            : `Bearish pattern detected on ${tradingCall.asset}. Resistance levels holding strong and decreasing volume suggest a potential downward movement.`}
        </p>
      </div>
    </DashboardCard>
  );
};

export default TradingCall;
