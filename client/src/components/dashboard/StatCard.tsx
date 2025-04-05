import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "neonGreen" | "cyberBlue" | "electricPurple";
  className?: string;
  icon?: string; // New 2025: Aggiunti icon per design moderno
  animated?: boolean; // New 2025: Effetti animati
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendValue,
  color = "neonGreen",
  className,
  icon,
  animated = false,
}) => {
  const colorClasses = {
    neonGreen: {
      bg: "from-neonGreen/10 to-transparent",
      border: "border-neonGreen/30",
      text: "text-neonGreen",
      iconBg: "bg-neonGreen/10",
      iconBorder: "border-neonGreen/40",
      glow: "shadow-neon-green",
    },
    cyberBlue: {
      bg: "from-cyberBlue/10 to-transparent",
      border: "border-cyberBlue/30",
      text: "text-cyberBlue",
      iconBg: "bg-cyberBlue/10",
      iconBorder: "border-cyberBlue/40",
      glow: "shadow-cyber-blue",
    },
    electricPurple: {
      bg: "from-electricPurple/10 to-transparent",
      border: "border-electricPurple/30",
      text: "text-electricPurple",
      iconBg: "bg-electricPurple/10",
      iconBorder: "border-electricPurple/40",
      glow: "shadow-electric-purple",
    },
  };

  const trendIcon = {
    up: <i className={`fas fa-arrow-trend-up ${colorClasses[color].text} mr-1`}></i>,
    down: <i className="fas fa-arrow-trend-down text-red-400 mr-1"></i>,
    neutral: <i className="fas fa-arrows-left-right text-gray-400 mr-1"></i>,
  };

  return (
    <div
      className={cn(
        "p-4 bg-gradient-to-br border rounded-lg backdrop-blur-sm shadow-sm",
        colorClasses[color].bg,
        colorClasses[color].border,
        animated && "transform hover:scale-[1.02] transition-all duration-300",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={cn(
          "flex items-center gap-2"
        )}>
          {icon && (
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              colorClasses[color].iconBg,
              `border ${colorClasses[color].iconBorder}`,
              animated && "animate-pulse-slow"
            )}>
              <i className={`fas fa-${icon} ${colorClasses[color].text}`}></i>
            </div>
          )}
          <p className="text-xs font-mono font-medium text-matrixGreen/90">{label.toUpperCase()}</p>
        </div>
        
        {trend && (
          <div className={cn(
            "px-1.5 py-0.5 rounded text-xs",
            trend === "up" ? "bg-neonGreen/20 text-neonGreen" : 
            trend === "down" ? "bg-red-500/20 text-red-400" : 
            "bg-gray-500/20 text-gray-400"
          )}>
            {trend === "up" ? "+" : trend === "down" ? "-" : "="}{trendValue?.split(' ')[0]}
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <p className={cn(
          "text-2xl font-future font-bold tracking-wide",
          colorClasses[color].text
        )}>
          {value}
        </p>
        
        {trend && trendValue && (
          <p className="text-xs text-matrixGreen/60 mt-1 flex items-center">
            {trendIcon[trend]} {trendValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
