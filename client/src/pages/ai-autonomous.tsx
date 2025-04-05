import React, { useState } from "react";
import { useTwitter } from "@/hooks/use-twitter";
import { useTrading } from "@/hooks/use-trading";
import { useAI } from "@/hooks/use-ai";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import AIStatus from "@/components/ai/AIStatus";
import AIPersona from "@/components/ai/AIPersona";
import ScheduledContent from "@/components/ai/ScheduledContent";
import TradingTable from "@/components/trading/TradingTable";
import StatCard from "@/components/dashboard/StatCard";
import Timeline from "@/components/dashboard/Timeline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CyberButton } from "@/components/ui/cyber-button";
import { useToast } from "@/hooks/use-toast";
import { TimelineItem } from "@/components/dashboard/Timeline";
// Define an interface for Post that's compatible with what we receive from the API
interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  scheduledFor?: Date;
  published: boolean;
  aiGenerated: boolean;
  engagement?: any;
  createdAt: Date;
}

type MetricsData = {
  id: number;
  userId: number;
  followers: number;
  engagement: number;
  impressions: number;
  aiEfficiency: number;
  date: string;
};

const AIAutonomous = () => {
  const { scheduledPosts, deletePost, createPost } = useTwitter();
  const { tradingCalls, generateCall } = useTrading();
  const { generatePersonaResponse } = useAI();
  const { toast } = useToast();
  
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get metrics data
  const { data: metrics } = useQuery<MetricsData>({
    queryKey: ["/api/metrics"],
  });

  // System metrics
  const systemResources = 87;
  const apiCredits = 62;
  const learningProgress = 94;
  const latestLog = "Successfully analyzed 230 trending posts. Generated 14 content ideas. Scheduled 3 posts for optimal engagement.";

  // AI Persona
  const personaName = "NEURAX-3000";
  const personaRole = "Master Crypto Trader";
  const personaTraits = ["Confident", "Provocative", "Market Guru"];
  const personaPrompt = "How should I respond to market FUD?";
  const personaResponse = generatePersonaResponse(personaPrompt);

  // Handle content generation
  const handleGenerateContent = () => {
    setIsGenerating(true);
    
    // Simulate AI content generation (in real app, this would call the API)
    setTimeout(() => {
      // Generate a random post about crypto
      const topics = [
        "Bitcoin's price movement",
        "Ethereum's recent updates",
        "NFT market trends",
        "DeFi protocols",
        "Crypto regulations",
        "Technical analysis insights"
      ];
      
      const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
      const aiContent = `Just analyzed ${selectedTopic}! The data suggests we're heading for a major shift soon. Who else is seeing these signals? #Crypto #Trading #Analysis`;
      
      // Create the post with the AI generated content
      createPost({
        content: aiContent,
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * Math.floor(Math.random() * 24)), // Random time in next 24h
        aiGenerated: true
      });
      
      setIsGenerating(false);
      setShowGenerateDialog(false);
      
      toast({
        title: "Content Generated",
        description: "New post has been scheduled successfully",
      });
    }, 2000);
  };

  // Handle post editing
  const handleEditPost = (post: Post) => {
    // In a real implementation, this would open an editing modal
    toast({
      title: "Edit Post",
      description: "Post editing is not implemented in this demo",
    });
  };

  // Handle post deletion confirmation
  const handleDeleteConfirm = () => {
    if (selectedPost) {
      deletePost(selectedPost.id);
      setSelectedPost(null);
      setShowDeleteDialog(false);
    }
  };

  // Recent activity items
  const recentActivities: TimelineItem[] = [
    {
      id: 1,
      content: "Posted a trending cryptocurrency analysis",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      description: "Generated 26 engagements, 14 likes, 8 retweets",
      type: "tweet",
    },
    {
      id: 2,
      content: "Replied to 5 comments with witty responses",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      description: "Increased engagement rate by 7.3% in the thread",
      type: "reply",
    },
    {
      id: 3,
      content: "Generated a meme about BTC volatility",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      description: "Viral potential detected: 42 shares in first hour",
      type: "meme",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-future font-bold text-neonGreen mb-2">AI Autonomous Mode</h2>
        <p className="text-matrixGreen/70">Your AI assistant is actively managing your social presence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Engagement"
          value={`${metrics?.engagement || 0}%`}
          trend="up"
          trendValue="+18.7% vs last week"
          color="neonGreen"
        />
        <StatCard
          label="Followers"
          value={metrics?.followers || 0}
          trend="up"
          trendValue="+32 last 24h"
          color="cyberBlue"
        />
        <StatCard
          label="Impressions"
          value={metrics?.impressions ? metrics.impressions.toLocaleString() : "0"}
          trend="up"
          trendValue="7 day avg"
          color="electricPurple"
        />
        <StatCard
          label="AI Efficiency"
          value={`${metrics?.aiEfficiency || 90}%`}
          trend="neutral"
          trendValue="Optimal"
          color="neonGreen"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Status */}
        <AIStatus
          systemResources={systemResources}
          apiCredits={apiCredits}
          learningProgress={learningProgress}
          latestLog={latestLog}
        />

        {/* Performance Metrics */}
        <div className="cyber-card rounded-lg p-5 lg:col-span-2 relative overflow-hidden">
          <h3 className="font-mono text-lg text-cyberBlue mb-4">Performance Metrics</h3>
          
          <Timeline items={recentActivities} className="mb-6" />
        </div>

        {/* Scheduled Content */}
        <ScheduledContent
          className="lg:col-span-2"
          posts={scheduledPosts || []}
          onEdit={handleEditPost}
          onDelete={(postId) => {
            const post = scheduledPosts?.find(p => p.id === postId);
            if (post) {
              setSelectedPost(post);
              setShowDeleteDialog(true);
            }
          }}
          onGenerateNew={() => setShowGenerateDialog(true)}
        />

        {/* AI Persona */}
        <AIPersona
          name={personaName}
          role={personaRole}
          traits={personaTraits}
          prompt={personaPrompt}
          response={personaResponse}
          onAdjustPersonality={() => {
            toast({
              title: "Personality Adjustment",
              description: "Personality adjustment is not implemented in this demo",
            });
          }}
        />

        {/* Trading Table */}
        <TradingTable
          className="lg:col-span-3 cyber-card rounded-lg p-5"
          tradingCalls={tradingCalls || []}
          onViewHistory={() => {
            toast({
              title: "Trading History",
              description: "Trading history view is not implemented in this demo",
            });
          }}
          onGenerateNew={() => {
            toast({
              title: "Generating Trading Call",
              description: "Creating a new AI trading recommendation...",
            });
            generateCall();
          }}
        />
      </div>

      {/* Generate Content Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="bg-cyberDark border border-neonGreen/30 text-techWhite">
          <DialogHeader>
            <DialogTitle className="text-neonGreen font-future text-xl">Generate New Content</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-matrixGreen mb-4">
              The AI will analyze trending topics, your audience preferences, and optimal posting times to generate engaging content.
            </p>
            <div className="space-y-2 font-mono text-xs text-techWhite/60 p-3 bg-spaceBlack rounded border border-neonGreen/20">
              <div className="flex">
                <span className="text-neonGreen mr-2">&gt;</span>
                <span>Analyzing trending topics in crypto space...</span>
              </div>
              <div className="flex">
                <span className="text-neonGreen mr-2">&gt;</span>
                <span>Evaluating audience engagement patterns...</span>
              </div>
              <div className="flex">
                <span className="text-neonGreen mr-2">&gt;</span>
                <span>Determining optimal posting schedule...</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <CyberButton
              onClick={() => setShowGenerateDialog(false)}
              variant="outline"
            >
              CANCEL
            </CyberButton>
            <CyberButton
              onClick={handleGenerateContent}
              disabled={isGenerating}
              iconLeft={isGenerating ? null : <i className="fas fa-robot"></i>}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">
                    <i className="fas fa-circle-notch"></i>
                  </span>
                  GENERATING...
                </>
              ) : (
                "GENERATE NOW"
              )}
            </CyberButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-cyberDark border border-neonGreen/30 text-techWhite">
          <DialogHeader>
            <DialogTitle className="text-red-400 font-future text-xl">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-matrixGreen">
              Are you sure you want to delete this scheduled post?
            </p>
            {selectedPost && (
              <div className="mt-4 p-3 bg-spaceBlack rounded border border-neonGreen/20">
                <p className="text-sm text-techWhite">{selectedPost.content}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <CyberButton
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
            >
              CANCEL
            </CyberButton>
            <CyberButton
              onClick={handleDeleteConfirm}
              className="border-red-500/30 hover:border-red-500/60 hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
              iconLeft={<i className="fas fa-trash-alt"></i>}
            >
              DELETE
            </CyberButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AIAutonomous;
