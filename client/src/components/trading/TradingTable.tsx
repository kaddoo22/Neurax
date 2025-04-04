import React from "react";
import { CyberButton } from "@/components/ui/cyber-button";
import { TradingCall } from "@/types";
import { 
  getAssetIcon, 
  getPositionStyles, 
  getStatusStyles, 
  getProfitLossStyles,
  formatDate 
} from "@/lib/utils";

interface TradingTableProps {
  tradingCalls: TradingCall[];
  onViewHistory: () => void;
  onGenerateNew: () => void;
  className?: string;
}

const TradingTable: React.FC<TradingTableProps> = ({
  tradingCalls,
  onViewHistory,
  onGenerateNew,
  className,
}) => {
  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
        <h3 className="font-mono text-lg text-cyberBlue mb-2 md:mb-0">AI Trading Calls</h3>
        <div className="flex gap-3">
          <span className="text-xs px-3 py-1 bg-neonGreen/20 text-neonGreen rounded border border-neonGreen/30">
            <i className="fas fa-chart-line mr-1"></i> Success Rate: 68%
          </span>
          <span className="text-xs px-3 py-1 bg-cyberBlue/20 text-cyberBlue rounded border border-cyberBlue/30">
            <i className="fas fa-chart-pie mr-1"></i> ROI: +24.7%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-neonGreen/30">
              <th className="text-left py-3 px-2 text-xs text-matrixGreen/70">Asset</th>
              <th className="text-center py-3 px-2 text-xs text-matrixGreen/70">Position</th>
              <th className="text-center py-3 px-2 text-xs text-matrixGreen/70">Entry</th>
              <th className="text-center py-3 px-2 text-xs text-matrixGreen/70">Target</th>
              <th className="text-center py-3 px-2 text-xs text-matrixGreen/70">Current</th>
              <th className="text-center py-3 px-2 text-xs text-matrixGreen/70">P/L</th>
              <th className="text-center py-3 px-2 text-xs text-matrixGreen/70">Duration</th>
              <th className="text-center py-3 px-2 text-xs text-matrixGreen/70">Status</th>
            </tr>
          </thead>
          <tbody>
            {tradingCalls.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-matrixGreen/70">
                  No trading calls found
                </td>
              </tr>
            ) : (
              tradingCalls.map((call) => {
                // Calculate duration
                const startDate = new Date(call.startDate);
                const endDate = call.endDate ? new Date(call.endDate) : new Date();
                const durationMs = endDate.getTime() - startDate.getTime();
                const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const durationText = `${durationDays}d ${durationHours}h`;

                // Get styles for position and status
                const positionStyles = getPositionStyles(call.position);
                const statusStyles = getStatusStyles(call.status);
                const profitLossStyles = getProfitLossStyles(call.profitLoss);

                return (
                  <tr
                    key={call.id}
                    className="border-b border-neonGreen/10 hover:bg-neonGreen/5 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-neonGreen/10 border border-neonGreen/30 flex items-center justify-center mr-2">
                          <i className={`${call.asset === 'BTC' ? 'fab fa-bitcoin' : call.asset === 'ETH' ? 'fab fa-ethereum' : `fas fa-${getAssetIcon(call.asset)}`} ${call.asset === 'BTC' ? 'text-neonGreen' : call.asset === 'ETH' ? 'text-electricPurple' : 'text-cyberBlue'}`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-matrixGreen">{call.asset}/USD</p>
                          <p className="text-xs text-techWhite/50">
                            {call.asset === 'BTC' ? 'Bitcoin' : 
                             call.asset === 'ETH' ? 'Ethereum' : 
                             call.asset === 'SOL' ? 'Solana' :
                             call.asset === 'ADA' ? 'Cardano' :
                             call.asset === 'DOT' ? 'Polkadot' :
                             call.asset === 'MATIC' ? 'Polygon' :
                             call.asset === 'XRP' ? 'Ripple' :
                             call.asset === 'LINK' ? 'Chainlink' :
                             call.asset === 'UNI' ? 'Uniswap' :
                             call.asset === 'AVAX' ? 'Avalanche' : call.asset}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs px-2 py-0.5 ${positionStyles.bgColor} ${positionStyles.textColor} rounded`}>
                        {call.position}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-matrixGreen">${call.entryPrice}</td>
                    <td className="py-3 px-2 text-center text-sm text-matrixGreen">${call.targetPrice}</td>
                    <td className="py-3 px-2 text-center text-sm text-cyberBlue">${call.currentPrice || 'N/A'}</td>
                    <td className={`py-3 px-2 text-center text-sm ${profitLossStyles.textColor}`}>
                      {call.profitLoss ? `${parseFloat(call.profitLoss) > 0 ? '+' : ''}${call.profitLoss}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-techWhite/60">{durationText}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs px-2 py-0.5 ${statusStyles.bgColor} ${statusStyles.textColor} rounded`}>
                        {call.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-5">
        <CyberButton
          className=""
          onClick={onViewHistory}
          iconLeft={<i className="fas fa-history"></i>}
        >
          TRADING HISTORY
        </CyberButton>
        <CyberButton
          className=""
          onClick={onGenerateNew}
          iconLeft={<i className="fas fa-robot"></i>}
        >
          GENERATE NEW CALLS
        </CyberButton>
      </div>
    </div>
  );
};

export default TradingTable;
