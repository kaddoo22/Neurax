import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "neonGreen" | "cyberBlue" | "electricPurple";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendValue,
  color = "neonGreen",
  className,
}) => {
  const colorClasses = {
    neonGreen: {
      bg: "from-neonGreen/10 to-transparent",
      border: "border-neonGreen/30",
      text: "text-neonGreen",
    },
    cyberBlue: {
      bg: "from-cyberBlue/10 to-transparent",
      border: "border-cyberBlue/30",
      text: "text-cyberBlue",
    },
    electricPurple: {
      bg: "from-electricPurple/10 to-transparent",
      border: "border-electricPurple/30",
      text: "text-electricPurple",
    },
  };

  const trendIcon = {
    up: <i className={`fas fa-arrow-up ${colorClasses[color].text} mr-1`}></i>,
    down: <i className="fas fa-arrow-down text-red-400 mr-1"></i>,
    neutral: <i className="fas fa-minus text-gray-400 mr-1"></i>,
  };

  return (
    <div
      className={cn(
        "p-3 bg-gradient-to-br border rounded",
        colorClasses[color].bg,
        colorClasses[color].border,
        className
      )}
    >
      <p className="text-xs text-matrixGreen/70 mb-1">{label}</p>
      <p className={cn("text-xl font-bold", colorClasses[color].text)}>
        {value}
      </p>
      {trend && trendValue && (
        <p className="text-xs text-matrixGreen/60">
          {trendIcon[trend]} {trendValue}
        </p>
      )}
    </div>
  );
};

export default StatCard;
