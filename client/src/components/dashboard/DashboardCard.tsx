import React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleColor?: "neonGreen" | "cyberBlue" | "electricPurple";
  action?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className,
  titleColor = "cyberBlue",
  action,
}) => {
  const titleColorClass = {
    neonGreen: "text-neonGreen",
    cyberBlue: "text-cyberBlue",
    electricPurple: "text-electricPurple",
  };

  return (
    <div className={cn("cyber-card rounded-lg p-5 relative overflow-hidden", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={cn("font-mono text-lg", titleColorClass[titleColor])}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
};

export default DashboardCard;
