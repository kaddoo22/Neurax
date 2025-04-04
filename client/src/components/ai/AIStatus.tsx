import React from "react";
import { LoadingBar } from "@/components/ui/loading-bar";
import DashboardCard from "@/components/dashboard/DashboardCard";

interface AIStatusProps {
  systemResources: number;
  apiCredits: number;
  learningProgress: number;
  latestLog: string;
  className?: string;
}

const AIStatus: React.FC<AIStatusProps> = ({
  systemResources,
  apiCredits,
  learningProgress,
  latestLog,
  className,
}) => {
  return (
    <DashboardCard title="System Status" className={className}>
      <div className="flex items-center mb-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 flex items-center justify-center border-2 border-neonGreen/40 animate-pulse-glow mr-4">
          <i className="fas fa-microchip text-neonGreen text-xl"></i>
        </div>
        <div>
          <div className="flex items-center mb-1">
            <div className="h-2 w-2 rounded-full bg-neonGreen animate-pulse mr-2"></div>
            <p className="text-neonGreen font-bold">ACTIVE</p>
          </div>
          <p className="text-sm text-techWhite/70">NeuraX is online and operational</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <LoadingBar
          label="System Resources"
          value={systemResources}
          color="neonGreen"
          showPercentage
        />
        <LoadingBar
          label="API Credits"
          value={apiCredits}
          color="neonGreen"
          showPercentage
        />
        <LoadingBar
          label="Learning Progress"
          value={learningProgress}
          color="cyberBlue"
          showPercentage
        />
      </div>

      <div className="font-mono text-xs text-techWhite/60 p-3 bg-spaceBlack rounded border border-neonGreen/20">
        <div className="flex items-start terminal-text">
          <span className="text-neonGreen mr-1">&gt;</span>
          <div>
            <span className="text-neonGreen">LATEST LOG:</span> {latestLog}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default AIStatus;
