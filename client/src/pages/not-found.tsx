import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ChevronLeft, Stethoscope } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function NotFound() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  
  // Funzione per eseguire la diagnostica delle API Twitter
  const runTwitterDiagnostics = async () => {
    try {
      const response = await fetch('/api/twitter/diagnostics');
      const data = await response.json();
      console.log("Twitter API diagnostics:", data);
      setDiagnosticData(data);
      toast({
        title: "Diagnostica completata",
        description: "I dati della diagnostica Twitter sono stati recuperati",
      });
    } catch (error) {
      console.error("Errore nella diagnostica Twitter:", error);
      toast({
        title: "Errore diagnostica",
        description: `Si è verificato un errore: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh] flex-col">
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
            
            {/* Pulsante di diagnostica per verificare le credenziali Twitter */}
            <div className="mt-8 pt-4 border-t border-neonGreen/20">
              <p className="text-xs text-matrixGreen/70 mb-2">Strumenti di Diagnostica (Solo Sviluppo)</p>
              <CyberButton 
                onClick={runTwitterDiagnostics}
                className="w-full bg-cyberBlue/20 border-cyberBlue/30 hover:border-cyberBlue/60 text-xs mt-2"
                iconLeft={<Stethoscope className="h-4 w-4" />}
              >
                DIAGNOSI TWITTER API
              </CyberButton>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Visualizzazione dei dati diagnostici */}
      {diagnosticData && (
        <Card className="w-full max-w-md mt-4 border border-cyberBlue/30 bg-cyberDark/80 backdrop-blur-lg shadow-glow-sm">
          <CardContent className="pt-6">
            <h3 className="font-future text-lg font-bold text-cyberBlue mb-2">RISULTATI DIAGNOSTICA</h3>
            <div className="bg-black/50 p-4 rounded font-mono text-xs overflow-auto max-h-60">
              <pre className="text-matrixGreen whitespace-pre-wrap">
                {JSON.stringify(diagnosticData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
