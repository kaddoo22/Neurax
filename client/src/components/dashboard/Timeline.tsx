import React from "react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";

export interface TimelineItem {
  id: string | number;
  content: string;
  timestamp: Date | string;
  description?: string;
  type: "tweet" | "reply" | "meme" | "other";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  // Get color based on item type
  const getTypeColor = (type: TimelineItem["type"]) => {
    switch (type) {
      case "tweet":
        return "bg-neonGreen";
      case "reply":
        return "bg-cyberBlue";
      case "meme":
        return "bg-electricPurple";
      default:
        return "bg-techWhite/50";
    }
  };

  return (
    <div className={cn("", className)}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-mono text-sm text-matrixGreen">Recent Activity Timeline</h4>
        <a href="#" className="text-xs text-cyberBlue hover:text-neonGreen transition-colors">
          View All <i className="fas fa-arrow-right ml-1"></i>
        </a>
      </div>

      <div className="space-y-4 relative before:absolute before:left-1.5 before:top-0 before:bottom-0 before:w-px before:bg-neonGreen/20">
        {items.map((item) => (
          <div key={item.id} className="flex">
            <div
              className={cn(
                "h-3 w-3 rounded-full mt-1.5 mr-3 z-10",
                getTypeColor(item.type)
              )}
            ></div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                <p className="text-sm text-matrixGreen">{item.content}</p>
                <span className="text-xs text-techWhite/50">
                  {timeAgo(item.timestamp)}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-techWhite/70">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
