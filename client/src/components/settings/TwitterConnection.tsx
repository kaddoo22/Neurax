import React from "react";
import { CyberButton } from "@/components/ui/cyber-button";
import DashboardCard from "@/components/dashboard/DashboardCard";

interface TwitterConnectionProps {
  isConnected: boolean;
  onConnect: () => void;
  username: string;
  onSendTestTweet?: () => void; // Callback opzionale per inviare tweet di test
}

const TwitterConnection: React.FC<TwitterConnectionProps> = ({
  isConnected,
  onConnect,
  username,
  onSendTestTweet,
}) => {
  return (
    <DashboardCard title="Twitter Integration" titleColor="cyberBlue">
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#1DA1F2]/20 to-cyberBlue/20 flex items-center justify-center border border-[#1DA1F2]/40 mr-4">
          <i className="fab fa-twitter text-[#1DA1F2] text-2xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-medium text-cyberBlue">
            {isConnected ? "Connected" : "Not Connected"}
          </h3>
          {isConnected ? (
            <p className="text-sm text-matrixGreen/70">
              Connected as @{username}
            </p>
          ) : (
            <p className="text-sm text-matrixGreen/70">
              Connect your Twitter account to enable automatic posting
            </p>
          )}
        </div>
      </div>

      {isConnected ? (
        <div>
          <div className="p-3 bg-spaceBlack border border-cyberBlue/30 rounded mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-matrixGreen">API Status</span>
              <span className="text-xs px-2 py-0.5 bg-neonGreen/20 text-neonGreen rounded">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-matrixGreen">API Rate Limit</span>
              <span className="text-xs px-2 py-0.5 bg-cyberBlue/20 text-cyberBlue rounded">
                498/500
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-matrixGreen">Last Sync</span>
              <span className="text-xs text-matrixGreen/70">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-4">
            <CyberButton
              className="w-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 border-neonGreen/40"
              variant="outline"
              onClick={onSendTestTweet}
              iconLeft={<i className="fas fa-paper-plane"></i>}
              disabled={!onSendTestTweet}
            >
              INVIA TWEET DI TEST "CIAO MONDO"
            </CyberButton>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <CyberButton
              className="w-full"
              variant="outline"
              onClick={() => {}}
            >
              REFRESH TOKEN
            </CyberButton>
            <CyberButton
              className="w-full border-red-500/30 hover:border-red-500/60"
              variant="outline"
              onClick={() => {}}
            >
              DISCONNECT
            </CyberButton>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-3 bg-spaceBlack border border-red-500/30 rounded mb-4">
            <p className="text-xs text-red-400 mb-2">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Twitter account not connected
            </p>
            <p className="text-xs text-matrixGreen/70">
              Connecting to Twitter allows NeuraX to post content, analyze metrics, and grow your audience automatically.
            </p>
          </div>

          <CyberButton
            className="w-full"
            onClick={onConnect}
            iconLeft={<i className="fab fa-twitter"></i>}
          >
            CONNECT TWITTER
          </CyberButton>
        </div>
      )}
    </DashboardCard>
  );
};

export default TwitterConnection;
