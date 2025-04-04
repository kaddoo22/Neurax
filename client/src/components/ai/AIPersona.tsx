import React from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { CyberButton } from "@/components/ui/cyber-button";

interface AIPersonaProps {
  name: string;
  role: string;
  traits: string[];
  prompt?: string;
  response?: string;
  onAdjustPersonality?: () => void;
  className?: string;
}

const AIPersona: React.FC<AIPersonaProps> = ({
  name,
  role,
  traits,
  prompt,
  response,
  onAdjustPersonality,
  className,
}) => {
  return (
    <DashboardCard title="AI Persona" className={className}>
      <div className="h-40 w-40 mx-auto rounded-full bg-gradient-to-r from-neonGreen/20 via-cyberBlue/20 to-electricPurple/20 flex items-center justify-center border-2 border-neonGreen/40 animate-pulse-glow mb-4 relative overflow-hidden">
        <i className="fas fa-robot text-6xl text-neonGreen"></i>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-spaceBlack/50 rounded-full"></div>
      </div>

      <div className="text-center mb-5">
        <h4 className="text-neonGreen font-future text-xl mb-1">{name}</h4>
        <p className="text-xs text-matrixGreen/70 mb-2">Impersonating: {role}</p>
        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {traits.map((trait, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-0.5 rounded ${
                index % 3 === 0
                  ? "bg-neonGreen/20 text-neonGreen"
                  : index % 3 === 1
                  ? "bg-cyberBlue/20 text-cyberBlue"
                  : "bg-electricPurple/20 text-electricPurple"
              }`}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {prompt && response && (
        <div className="bg-gradient-to-b from-cyberDark to-spaceBlack border border-neonGreen/20 rounded p-3 font-mono text-xs">
          <p className="text-matrixGreen mb-2">
            <span className="text-neonGreen">PROMPT:</span> {prompt}
          </p>
          <p className="text-techWhite/80">{response}</p>
        </div>
      )}

      <CyberButton
        className="w-full mt-4"
        onClick={onAdjustPersonality}
        iconLeft={<i className="fas fa-sliders-h"></i>}
      >
        ADJUST PERSONALITY
      </CyberButton>
    </DashboardCard>
  );
};

export default AIPersona;
