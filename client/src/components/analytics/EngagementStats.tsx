import React from "react";
import { cn } from "@/lib/utils";

interface EngagementStatsProps {
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  className?: string;
}

const EngagementStats: React.FC<EngagementStatsProps> = ({
  likes,
  retweets,
  replies,
  impressions,
  className,
}) => {
  // Calculate engagement rate
  const engagementRate = ((likes + retweets + replies) / impressions * 100).toFixed(2);
  
  return (
    <div className={cn("flex flex-wrap gap-3 text-xs", className)}>
      <div className="flex items-center">
        <div className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mr-1">
          <i className="fas fa-heart text-red-500"></i>
        </div>
        <span className="text-matrixGreen">{likes} likes</span>
      </div>
      
      <div className="flex items-center">
        <div className="h-6 w-6 rounded-full bg-neonGreen/10 border border-neonGreen/30 flex items-center justify-center mr-1">
          <i className="fas fa-retweet text-neonGreen"></i>
        </div>
        <span className="text-matrixGreen">{retweets} retweets</span>
      </div>
      
      <div className="flex items-center">
        <div className="h-6 w-6 rounded-full bg-cyberBlue/10 border border-cyberBlue/30 flex items-center justify-center mr-1">
          <i className="fas fa-reply text-cyberBlue"></i>
        </div>
        <span className="text-matrixGreen">{replies} replies</span>
      </div>
      
      <div className="flex items-center">
        <div className="h-6 w-6 rounded-full bg-electricPurple/10 border border-electricPurple/30 flex items-center justify-center mr-1">
          <i className="fas fa-eye text-electricPurple"></i>
        </div>
        <span className="text-matrixGreen">{impressions} impressions</span>
      </div>
      
      <div className="flex items-center ml-auto">
        <div className="h-6 w-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mr-1">
          <i className="fas fa-chart-bar text-yellow-500"></i>
        </div>
        <span className={`${parseFloat(engagementRate) > 3 ? 'text-neonGreen' : 'text-matrixGreen'}`}>
          {engagementRate}% engagement
        </span>
      </div>
    </div>
  );
};

export default EngagementStats;
