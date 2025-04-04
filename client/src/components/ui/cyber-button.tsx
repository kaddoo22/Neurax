import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CyberButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant, size, children, iconLeft, iconRight, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "cyber-button relative px-4 py-2 rounded font-mono text-sm text-matrixGreen flex items-center justify-center gap-2 bg-gradient-to-r from-transparent to-[rgba(18,18,18,0.9)] border border-transparent",
          "before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-neonGreen/20 before:to-transparent before:transition-all before:duration-500 before:ease-in-out before:z-[-1]",
          "hover:before:left-[100%] hover:shadow-[0_0_10px_rgba(57,255,20,0.5)] hover:border-neonGreen/40 transition-all duration-300",
          className
        )}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      >
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2">{iconRight}</span>}
      </Button>
    );
  }
);

CyberButton.displayName = "CyberButton";

export { CyberButton };
