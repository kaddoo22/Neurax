import React from "react";
import { cn } from "@/lib/utils";

interface LoadingBarProps {
  value: number;
  max?: number;
  color?: "neonGreen" | "cyberBlue" | "electricPurple";
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

const LoadingBar = ({
  value,
  max = 100,
  color = "neonGreen",
  size = "md",
  showPercentage = false,
  label,
  className,
}: LoadingBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    neonGreen: "from-neonGreen/50 to-neonGreen",
    cyberBlue: "from-cyberBlue/50 to-cyberBlue",
    electricPurple: "from-electricPurple/50 to-electricPurple",
  };
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };
  
  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1 text-xs">
          {label && <span className="text-matrixGreen">{label}</span>}
          {showPercentage && (
            <span className={`text-${color}`}>{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full relative overflow-hidden bg-[rgba(18,18,18,0.6)] rounded")}>
        <div
          className={cn(
            "h-full bg-gradient-to-r",
            colorClasses[color],
            sizeClasses[size],
            percentage === 100 && "animate-pulse-glow"
          )}
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Animated loading effect */}
        <div 
          className={cn(
            "absolute inset-0 loading-bar", 
            sizeClasses[size]
          )}
        >
          <div className="h-full w-full"></div>
        </div>
      </div>
    </div>
  );
};

export { LoadingBar };
