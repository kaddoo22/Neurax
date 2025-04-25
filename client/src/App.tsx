import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

// Pages
import Dashboard from "@/pages/dashboard";
import AIAutonomous from "@/pages/ai-autonomous";
import ManualPost from "@/pages/manual-post";
import CryptoTrading from "@/pages/crypto-trading";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Components
import Sidebar from "@/components/layout/Sidebar";
import MatrixBackground from "@/components/layout/MatrixBackground";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";

function App() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { lastMessage } = useWebSocket();

  // Handle WebSocket messages for notifications
  useEffect(() => {
    if (lastMessage && user) {
      try {
        switch (lastMessage.type) {
          case 'content_update':
            toast({
              title: 'New Content',
              description: 'A new post has been created by the AI',
            });
            break;
            
          case 'trading_update':
            toast({
              title: 'Trading Call Update',
              description: lastMessage.tradingCall?.status === 'CLOSED' 
                ? `Trading call for ${lastMessage.tradingCall?.asset} has been closed`
                : `New trading call generated for ${lastMessage.tradingCall?.asset}`,
            });
            break;
            
          case 'metrics_update':
            toast({
              title: 'Performance Update',
              description: 'Your account metrics have been updated',
            });
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    }
  }, [lastMessage, toast, user]);

  return (
    <div className="matrix-bg">
      <MatrixBackground />
      
      {/* Scanline effects */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-10 bg-repeat scanning-effect" 
        style={{backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi+vDhQxMDAwMzEIMARKICBBgADegCeilX7IEAAAAASUVORK5CYII=')"}} />
      
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        username={user ? user.username : ''}
      />
      
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-cyberDark/90 backdrop-blur-sm border-b border-neonGreen/30 p-4 z-20 lg:hidden flex justify-between items-center">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="text-techWhite hover:text-neonGreen"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="font-future text-xl font-bold text-neonGreen">NeuraX</h1>
        <div className="rounded-full w-8 h-8 bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 flex items-center justify-center border border-neonGreen/40">
          <i className="fas fa-user-astronaut text-sm text-neonGreen"></i>
        </div>
      </div>
      
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 pb-16 transition-all duration-300">
        <Switch>
          <Route path="/">
            <Dashboard />
          </Route>
          
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          
          <Route path="/ai-autonomous">
            <AIAutonomous />
          </Route>
          
          <Route path="/manual-post">
            <ManualPost />
          </Route>
          
          <Route path="/crypto-trading">
            <CryptoTrading />
          </Route>
          
          <Route path="/analytics">
            <Analytics />
          </Route>
          
          <Route path="/settings">
            <Settings />
          </Route>
          
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
