import React from "react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";

// Aggiornato per 2025 con nuovi tipi di contenuto
export interface TimelineItem {
  id: string | number;
  content: string;
  timestamp: Date | string;
  description?: string;
  type: "tweet" | "reply" | "meme" | "other" | "media" | "crypto" | "ai";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  // Get color and icon based on item type
  const getTypeStyles = (type: TimelineItem["type"]) => {
    switch (type) {
      case "tweet":
        return {
          bg: "bg-neonGreen", 
          border: "border-neonGreen",
          icon: "fa-comment-alt",
          color: "text-neonGreen"
        };
      case "reply":
        return {
          bg: "bg-cyberBlue", 
          border: "border-cyberBlue",
          icon: "fa-reply",
          color: "text-cyberBlue"
        };
      case "meme":
        return {
          bg: "bg-electricPurple", 
          border: "border-electricPurple",
          icon: "fa-image",
          color: "text-electricPurple"
        };
      case "media":
        return {
          bg: "bg-electricPurple", 
          border: "border-electricPurple/70",
          icon: "fa-photo-film",
          color: "text-electricPurple"
        };
      case "crypto":
        return {
          bg: "bg-neonGreen", 
          border: "border-neonGreen/70",
          icon: "fa-chart-line",
          color: "text-neonGreen"
        };
      case "ai":
        return {
          bg: "bg-cyberBlue", 
          border: "border-cyberBlue/70",
          icon: "fa-robot",
          color: "text-cyberBlue"
        };
      default:
        return {
          bg: "bg-techWhite/50", 
          border: "border-techWhite/30",
          icon: "fa-circle-info",
          color: "text-techWhite/80"
        };
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="space-y-5 relative">
        {items.map((item, index) => {
          const styles = getTypeStyles(item.type);
          
          return (
            <div key={item.id} className="flex group">
              <div className="relative">
                <div
                  className={cn(
                    "h-4 w-4 rounded-full z-10 border flex items-center justify-center",
                    styles.bg,
                    styles.border
                  )}
                >
                  <i className={`fas ${styles.icon} text-[8px] text-black/80`}></i>
                </div>
                {index < items.length - 1 && (
                  <div className="absolute left-1/2 top-4 bottom-[-20px] transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-neonGreen/30 to-transparent"></div>
                )}
              </div>
              
              <div className="flex-1 ml-4 bg-gradient-to-br from-spaceBlack/60 to-spaceBlack/40 backdrop-blur-sm rounded-lg p-3 border border-neonGreen/10 shadow-sm group-hover:border-neonGreen/30 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                  <div className="flex items-center">
                    <p className="text-sm text-matrixGreen font-medium">{item.content}</p>
                  </div>
                  <span className="text-xs text-techWhite/50 ml-0 sm:ml-4 mt-1 sm:mt-0 sm:whitespace-nowrap">
                    {timeAgo(item.timestamp)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-techWhite/70 font-mono bg-spaceBlack/40 p-2 rounded border border-neonGreen/5">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
