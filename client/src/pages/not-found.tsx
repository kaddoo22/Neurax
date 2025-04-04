import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border border-neonGreen/30 bg-cyberDark/80 backdrop-blur-lg shadow-glow-sm">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="inline-block p-3 rounded-full bg-gradient-to-br from-red-500/20 to-red-800/20 border border-red-500/40 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="font-future text-3xl font-bold text-red-500 mb-2 glitch-text" data-text="ERROR 404">ERROR 404</h1>
            <div className="text-matrixGreen text-xs tracking-widest uppercase font-mono mb-4">NEURAL PATHWAY NOT FOUND</div>
            
            <div className="h-2 w-full bg-gradient-to-r from-red-500/20 via-red-500/80 to-red-500/20 my-6"></div>
            
            <p className="mt-4 text-sm text-techWhite/80 font-mono">
              <span className="text-red-400">[SYSTEM ALERT]:</span> The requested neural pathway has been disconnected or does not exist in the matrix.
            </p>
            
            <div className="mt-6 flex justify-center">
              <CyberButton 
                onClick={() => navigate("/")}
                iconLeft={<ChevronLeft className="h-4 w-4" />}
                className="text-sm"
              >
                RETURN TO DASHBOARD
              </CyberButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
