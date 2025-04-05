import React from "react";
import { cn } from "@/lib/utils";

// Aggiornato per 2025 con animazioni avanzate
export interface LoadingBarProps {
  value: number;
  max?: number;
  color?: "neonGreen" | "cyberBlue" | "electricPurple";
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  label?: string;
  className?: string;
  animated?: boolean; // 2025: Aggiunto controllo per animazioni avanzate
}

const LoadingBar = ({
  value,
  max = 100,
  color = "neonGreen",
  size = "md",
  showPercentage = false,
  label,
  className,
  animated = false,
}: LoadingBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    neonGreen: {
      gradient: "from-neonGreen/50 to-neonGreen",
      text: "text-neonGreen",
      glow: "shadow-neon-green",
      shimmer: "bg-gradient-to-r from-transparent via-neonGreen/30 to-transparent",
      border: "border-neonGreen/30"
    },
    cyberBlue: {
      gradient: "from-cyberBlue/50 to-cyberBlue",
      text: "text-cyberBlue",
      glow: "shadow-cyber-blue",
      shimmer: "bg-gradient-to-r from-transparent via-cyberBlue/30 to-transparent",
      border: "border-cyberBlue/30"
    },
    electricPurple: {
      gradient: "from-electricPurple/50 to-electricPurple",
      text: "text-electricPurple",
      glow: "shadow-electric-purple",
      shimmer: "bg-gradient-to-r from-transparent via-electricPurple/30 to-transparent",
      border: "border-electricPurple/30"
    },
  };
  
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };
  
  return (
    <div className={cn("w-full mb-2", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1.5 text-xs items-center">
          {label && <span className="text-matrixGreen/90 font-mono">{label}</span>}
          {showPercentage && (
            <span className={cn(
              colorClasses[color].text, 
              "font-mono",
              animated && "font-bold"
            )}>
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full relative overflow-hidden bg-spaceBlack/80 rounded-full", 
        sizeClasses[size],
        "border",
        colorClasses[color].border,
        animated && "backdrop-blur-sm"
      )}>
        {/* Base bar */}
        <div
          className={cn(
            "h-full bg-gradient-to-r rounded-full",
            colorClasses[color].gradient,
            sizeClasses[size],
            animated && percentage === 100 && "animate-pulse-glow"
          )}
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Shimmer effect for 2025 */}
        {animated && (
          <div 
            className={cn(
              "absolute inset-0", 
              colorClasses[color].shimmer,
              "animate-shimmer-horizontal"
            )}
            style={{ width: '100%', backgroundSize: '200% 100%' }}
          />
        )}
        
        {/* Particles for high values */}
        {animated && percentage > 75 && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "absolute w-1 h-1 rounded-full",
                  colorClasses[color].text,
                  "animate-particle"
                )}
                style={{ 
                  left: `${Math.random() * percentage}%`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.6,
                  top: '50%'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { LoadingBar };
