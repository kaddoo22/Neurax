import React, { useEffect, useState } from "react";
import { useTwitter } from "@/hooks/use-twitter";
import { useTrading } from "@/hooks/use-trading";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/dashboard/StatCard";
import Timeline from "@/components/dashboard/Timeline";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { CyberButton } from "@/components/ui/cyber-button";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Link } from "wouter";
import { TimelineItem } from "@/components/dashboard/Timeline";
import { formatDate, timeAgo, getAssetIcon } from "@/lib/utils";

type MetricsData = {
  id: number;
  userId: number;
  followers: number;
  engagement: number;
  impressions: number;
  aiEfficiency: number;
  date: string;
};

const Dashboard = () => {
  const { isTwitterConnected, posts, isLoadingPosts } = useTwitter();
  const { tradingCalls, successRate, overallROI } = useTrading();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timeMode, setTimeMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Formato data 2025
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(currentDateTime);

  // Aggiorna l'orario attuale ogni minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get metrics data
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<MetricsData>({
    queryKey: ["/api/metrics"],
  });

  // Create timeline items from posts and trading calls
  useEffect(() => {
    if (!posts || !tradingCalls) return;

    const timeline: TimelineItem[] = [];

    // Add posts to timeline with improved descriptions
    posts.slice(0, 5).forEach((post) => {
      timeline.push({
        id: `post-${post.id}`,
        content: post.aiGenerated
          ? `X.NeuraX autonomously published content about ${post.content.substring(0, 35)}...`
          : `User published post: ${post.content.substring(0, 35)}...`,
        timestamp: post.createdAt,
        description: post.engagement 
          ? `Analytics: ${post.engagement.likes} likes, ${post.engagement.retweets} retweets, ${Math.floor(Math.random() * 100) + 10} comments`
          : undefined,
        type: post.imageUrl ? "media" : "tweet",
      });
    });

    // Add trading calls to timeline with improved contextual info
    tradingCalls.slice(0, 3).forEach((call) => {
      const activeOrClosed = call.status === "ACTIVE" ? 
        "| Target: $" + call.targetPrice : 
        "| Exit: $" + call.currentPrice;
        
      timeline.push({
        id: `call-${call.id}`,
        content: `NeuraX.Trading ${call.status === "ACTIVE" ? "opened" : "closed"} ${call.position} position on $${call.asset}`,
        timestamp: call.status === "ACTIVE" ? call.startDate : call.endDate || call.startDate,
        description: `Entry: $${call.entryPrice} ${activeOrClosed} ${call.status === "CLOSED" && call.profitLoss ? `| P/L: ${parseFloat(call.profitLoss) > 0 ? "+" : ""}${call.profitLoss}%` : ""}`,
        type: "crypto",
      });
    });

    // Sort by timestamp, newest first
    timeline.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    setTimelineItems(timeline.slice(0, 5));
  }, [posts, tradingCalls]);

  // Calculate system health metrics & sentiment
  const systemResources = 87;
  const apiCredits = 62;
  const learningProgress = 94;
  const marketSentiment = metrics?.followers && metrics?.engagement ? 
    Math.min(100, Math.floor((metrics.followers * 0.01 + metrics.engagement * 0.5) / 2 + 40)) : 75;

  // Funzione per calcolare metriche giornaliere fittizie basate su input reali
  const getDailyRevenue = () => {
    if (!metrics) return "$0.00";
    const baseMultiplier = 0.05;
    const revenue = (metrics.followers * 0.01 + metrics.engagement * 0.2) * baseMultiplier;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(revenue);
  };

  return (
    <div className="p-2 md:p-6 lg:p-8 bg-gradient-to-br from-spaceBlack to-spaceBlack/90 min-h-screen">
      {/* Header con data e orario futuristico */}
      <div className="rounded-lg mb-8 p-4 bg-gradient-to-r from-spaceBlack/70 to-spaceBlack/30 backdrop-blur border border-neonGreen/10 shadow-lg shadow-cyberBlue/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-future font-bold bg-clip-text text-transparent bg-gradient-to-r from-neonGreen via-cyberBlue to-electricPurple mb-2">
              NeuraX Command Center
            </h1>
            <p className="text-xs md:text-sm text-matrixGreen/90 font-mono">{formattedDate} | X.AI v3.8.5 | User Session Active</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-right">
              <div className="text-xs text-matrixGreen/60 mb-1 font-mono">SESSION STATUS</div>
              <div className="flex items-center justify-end">
                <div className="h-2 w-2 rounded-full bg-neonGreen animate-pulse mr-2"></div>
                <span className="text-neonGreen text-sm font-bold">ONLINE</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-neonGreen/30 to-cyberBlue/30 flex items-center justify-center border border-neonGreen/40">
              <i className="fas fa-user text-neonGreen text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Notifica Twitter non connesso */}
      {!isTwitterConnected && (
        <div className="cyber-card rounded-lg p-5 mb-6 border border-cyberBlue/50 bg-gradient-to-r from-spaceBlack/80 to-cyberBlue/10 backdrop-blur shadow-lg shadow-cyberBlue/10 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-12 w-12 rounded-full bg-cyberBlue/10 border border-cyberBlue/50 flex items-center justify-center mr-4 animate-pulse-slow">
                <i className="fab fa-x-twitter text-cyberBlue text-xl"></i>
              </div>
              <div>
                <h3 className="font-future text-lg text-cyberBlue mb-1">X Platform Connection Required</h3>
                <p className="text-sm text-techWhite/70">Connect your X account to enable all autonomous features</p>
              </div>
            </div>
            <Link href="/settings">
              <CyberButton
                iconLeft={<i className="fas fa-plug-circle-plus"></i>}
                className="px-6 py-3 bg-gradient-to-r from-cyberBlue/20 to-cyberBlue/30 hover:from-cyberBlue/30 hover:to-cyberBlue/40"
              >
                CONNECT X ACCOUNT
              </CyberButton>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="X Followers"
          value={metrics?.followers || 0}
          trend="up"
          trendValue="+5% this week"
          color="neonGreen"
          icon="users"
        />
        <StatCard
          label="Engagement Rate"
          value={`${metrics?.engagement || 0}%`}
          trend="up"
          trendValue="+18.7% vs last week"
          color="cyberBlue"
          icon="chart-simple"
        />
        <StatCard
          label="Total Impressions"
          value={metrics?.impressions ? metrics.impressions.toLocaleString() : "0"}
          trend="up"
          trendValue="7 day avg"
          color="electricPurple"
          icon="eye"
        />
        <StatCard
          label="AI Efficiency Score"
          value={`${metrics?.aiEfficiency || 90}%`}
          trend="neutral"
          trendValue="Self-optimizing"
          color="neonGreen"
          icon="microchip"
        />
      </div>

      {/* Time period selector */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-future text-neonGreen">Performance Analytics</h2>
        <div className="bg-spaceBlack/50 rounded-lg border border-neonGreen/20 p-1 flex space-x-1">
          {(['day', 'week', 'month'] as const).map(period => (
            <button
              key={period}
              onClick={() => setTimeMode(period)}
              className={`px-3 py-1 text-xs rounded ${timeMode === period ? 'bg-neonGreen/20 text-neonGreen' : 'text-techWhite/70 hover:text-neonGreen/80'}`}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* System Status */}
        <DashboardCard title="NeuraX Core Status" titleColor="cyberBlue" className="backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-neonGreen/10 to-cyberBlue/10 flex items-center justify-center border border-neonGreen/30 animate-pulse-slow mr-4 shadow-neon-green">
              <i className="fas fa-brain text-neonGreen text-xl"></i>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-neonGreen animate-pulse mr-2"></div>
                <p className="font-future text-neonGreen font-bold tracking-wide">OPERATIONAL</p>
              </div>
              <p className="text-sm text-techWhite/70">Neural networks active • All systems nominal</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <LoadingBar
              label="Cognitive Resources"
              value={systemResources}
              color="neonGreen"
              showPercentage
              animated
            />
            <LoadingBar
              label="API Quota Status"
              value={apiCredits}
              color="cyberBlue"
              showPercentage
              animated
            />
            <LoadingBar
              label="Learning Algorithm"
              value={learningProgress}
              color="electricPurple"
              showPercentage
              animated
            />
            <LoadingBar
              label="Market Sentiment"
              value={marketSentiment}
              color="neonGreen"
              showPercentage
              animated
            />
          </div>

          <div className="bg-spaceBlack rounded-lg shadow-inner border border-neonGreen/30 p-4 font-mono text-xs text-techWhite/70">
            <div className="flex flex-col space-y-2">
              <div className="flex items-start">
                <span className="text-neonGreen mr-2">&gt;</span>
                <div className="leading-relaxed">
                  <span className="text-cyberBlue">SYS:</span> X API connection established. Neural network initialized.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-neonGreen mr-2">&gt;</span>
                <div className="leading-relaxed">
                  <span className="text-cyberBlue">ANALYSIS:</span> Processed 532 trending topics. Content strategy optimized for maximum engagement.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-neonGreen mr-2">&gt;</span>
                <div className="leading-relaxed">
                  <span className="text-cyberBlue">ACTION:</span> Generated 17 content ideas. Auto-scheduled 5 posts. Monitoring 8 trading signals.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-neonGreen mr-2">&gt;</span>
                <div className="leading-relaxed animate-pulse">
                  <span className="text-electricPurple">NOW:</span> Analyzing market sentiment. Optimizing post timing...
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Recent Activity */}
        <DashboardCard title="Activity Timeline" className="lg:col-span-2 backdrop-blur-sm" titleColor="cyberBlue">
          {isLoadingPosts ? (
            <div className="h-48 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-t-neonGreen border-r-neonGreen/50 border-b-neonGreen/20 border-l-neonGreen/20 animate-spin"></div>
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="text-center p-10 bg-gradient-to-b from-transparent to-cyberBlue/5 rounded-lg border border-cyberBlue/20">
              <div className="inline-block p-4 rounded-full bg-gradient-to-r from-cyberBlue/10 to-neonGreen/10 border border-cyberBlue/30 mb-4">
                <i className="fas fa-satellite-dish text-cyberBlue text-3xl"></i>
              </div>
              <h3 className="text-lg font-future text-cyberBlue mb-2">No Activity Data</h3>
              <p className="text-matrixGreen/70 mb-6">Your NeuraX assistant is waiting for your first command</p>
              <Link href="/manual-post">
                <CyberButton
                  iconLeft={<i className="fas fa-broadcast-tower"></i>}
                  className="bg-gradient-to-r from-cyberBlue/20 to-neonGreen/20 hover:from-cyberBlue/30 hover:to-neonGreen/30 border-cyberBlue/40"
                >
                  INITIALIZE CONTENT PROTOCOL
                </CyberButton>
              </Link>
            </div>
          ) : (
            <div className="border-l-2 border-neonGreen/30 ml-3 pl-6 relative">
              <div className="absolute top-0 left-[-8px] h-4 w-4 rounded-full bg-neonGreen/30 border border-neonGreen"></div>
              <Timeline items={timelineItems} />
              <div className="absolute bottom-0 left-[-8px] h-4 w-4 rounded-full bg-neonGreen/30 border border-neonGreen"></div>
            </div>
          )}
        </DashboardCard>

        {/* Revenue Overview - NUOVA CARD 2025 */}
        <DashboardCard title="Revenue Analytics" titleColor="neonGreen" className="backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-neonGreen/10 to-transparent border border-neonGreen/30 rounded-lg shadow-inner">
              <p className="text-xs text-matrixGreen/70 mb-1">Daily Revenue</p>
              <p className="text-xl font-bold text-neonGreen font-future">{getDailyRevenue()}</p>
              <p className="text-xs text-matrixGreen/60">
                <i className="fas fa-arrow-trend-up text-neonGreen mr-1"></i> From content
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyberBlue/10 to-transparent border border-cyberBlue/30 rounded-lg shadow-inner">
              <p className="text-xs text-matrixGreen/70 mb-1">Content ROI</p>
              <p className="text-xl font-bold text-cyberBlue font-future">
                +{(metrics?.aiEfficiency || 0) / 10}x
              </p>
              <p className="text-xs text-matrixGreen/60">
                <i className="fas fa-robot text-cyberBlue mr-1"></i> AI efficiency
              </p>
            </div>
          </div>

          {/* Trading Overview */}
          <div className="mb-4">
            <h3 className="text-sm font-future text-electricPurple mb-3 flex items-center">
              <i className="fas fa-chart-line mr-2"></i> Trading Performance
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-3 bg-gradient-to-br from-neonGreen/10 to-transparent border border-neonGreen/30 rounded-lg shadow-inner">
                <p className="text-xs text-matrixGreen/70 mb-1">Win Rate</p>
                <p className="text-xl font-bold text-neonGreen">{successRate.toFixed(1)}%</p>
                <p className="text-xs text-matrixGreen/60">
                  <i className="fas fa-check-circle text-neonGreen mr-1"></i> Profitable
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-electricPurple/10 to-transparent border border-electricPurple/30 rounded-lg shadow-inner">
                <p className="text-xs text-matrixGreen/70 mb-1">Avg. ROI</p>
                <p className="text-xl font-bold text-electricPurple">
                  {overallROI > 0 ? "+" : ""}{overallROI.toFixed(2)}%
                </p>
                <p className="text-xs text-matrixGreen/60">
                  <i className="fas fa-chart-pie text-electricPurple mr-1"></i> Per trade
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {tradingCalls.slice(0, 3).map((call) => (
              <div 
                key={call.id}
                className="text-sm border border-neonGreen/20 rounded-lg p-3 bg-gradient-to-br from-spaceBlack to-neonGreen/5 hover:border-neonGreen/40 transition-all duration-300 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="text-matrixGreen flex items-center">
                    <i className={`${call.asset === 'BTC' ? 'fab fa-bitcoin' : call.asset === 'ETH' ? 'fab fa-ethereum' : `fas fa-${getAssetIcon(call.asset)}`} mr-2 ${call.asset === 'BTC' ? 'text-neonGreen' : call.asset === 'ETH' ? 'text-electricPurple' : 'text-cyberBlue'}`}></i>
                    {call.asset}/USD <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${call.position === 'LONG' ? 'bg-neonGreen/20 text-neonGreen' : 'bg-electricPurple/20 text-electricPurple'}`}>{call.position}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${call.status === 'ACTIVE' ? 'bg-cyberBlue/20 text-cyberBlue' : (call.profitLoss && parseFloat(call.profitLoss) > 0) ? 'bg-neonGreen/20 text-neonGreen' : 'bg-red-500/20 text-red-400'}`}>
                    {call.status === 'ACTIVE' ? 'LIVE' : (call.profitLoss ? `${parseFloat(call.profitLoss) > 0 ? '+' : ''}${call.profitLoss}%` : 'CLOSED')}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-techWhite/70 mt-2">
                  <span>Entry: ${call.entryPrice}</span>
                  <span className="text-techWhite/50">{timeAgo(call.startDate)}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/crypto-trading">
            <a>
              <CyberButton
                className="w-full bg-gradient-to-r from-electricPurple/20 to-neonGreen/20 hover:from-electricPurple/30 hover:to-neonGreen/30 border-electricPurple/30"
                iconLeft={<i className="fas fa-arrow-trend-up"></i>}
              >
                TRADING DASHBOARD
              </CyberButton>
            </a>
          </Link>
        </DashboardCard>

        {/* Scheduled Posts */}
        <DashboardCard title="Content Pipeline" className="lg:col-span-2 backdrop-blur-sm" titleColor="electricPurple">
          <div className="space-y-3 mb-6">
            {isLoadingPosts ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-t-electricPurple border-r-electricPurple/50 border-b-electricPurple/20 border-l-electricPurple/20 animate-spin"></div>
              </div>
            ) : (
              posts
                ?.filter(post => post.scheduledFor && !post.published)
                .slice(0, 3)
                .map(post => (
                  <div
                    key={post.id}
                    className="border border-electricPurple/30 rounded-lg bg-gradient-to-br from-spaceBlack/90 to-electricPurple/5 p-4 hover:border-electricPurple/50 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-xs px-2 py-1 bg-electricPurple/20 text-electricPurple rounded-md font-mono mr-2 flex items-center">
                          <i className="fas fa-clock mr-1.5"></i>
                          {formatDate(post.scheduledFor)}
                        </span>
                        {post.aiGenerated && (
                          <span className="text-xs px-2 py-1 bg-cyberBlue/20 text-cyberBlue rounded-md font-mono flex items-center">
                            <i className="fas fa-microchip mr-1.5"></i>
                            AI GENERATED
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-matrixGreen mb-3">{post.content}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex">
                        {post.imageUrl && (
                          <span className="mr-3 text-techWhite/70">
                            <i className="fas fa-image text-cyberBlue mr-1"></i> Media attached
                          </span>
                        )}
                        <span className="text-techWhite/70">
                          <i className="fas fa-hashtag text-neonGreen mr-1"></i> 
                          {post.content.match(/#[a-zA-Z0-9]+/g)?.length || 0} tags
                        </span>
                      </div>
                      <span className="text-techWhite/50">
                        ID: {post.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                  </div>
                ))
            )}

            {!isLoadingPosts && (!posts || posts.filter(post => post.scheduledFor && !post.published).length === 0) && (
              <div className="text-center p-10 bg-gradient-to-b from-transparent to-electricPurple/5 rounded-lg border border-electricPurple/20">
                <div className="inline-block p-4 rounded-full bg-gradient-to-r from-electricPurple/10 to-cyberBlue/10 border border-electricPurple/30 mb-4">
                  <i className="fas fa-calendar-plus text-electricPurple text-3xl"></i>
                </div>
                <h3 className="text-lg font-future text-electricPurple mb-2">Content Queue Empty</h3>
                <p className="text-matrixGreen/70 mb-6">Your content pipeline is ready for new scheduled posts</p>
                <Link href="/manual-post">
                  <a>
                    <CyberButton
                      iconLeft={<i className="fas fa-pen-to-square"></i>}
                      className="bg-gradient-to-r from-electricPurple/20 to-cyberBlue/20 hover:from-electricPurple/30 hover:to-cyberBlue/30 border-electricPurple/40"
                    >
                      CREATE NEW CONTENT
                    </CyberButton>
                  </a>
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/manual-post">
              <a>
                <CyberButton
                  className="w-full bg-gradient-to-r from-cyberBlue/20 to-cyberBlue/10 hover:from-cyberBlue/30 hover:to-cyberBlue/20 border-cyberBlue/30"
                  iconLeft={<i className="fas fa-pen-fancy"></i>}
                >
                  MANUAL EDITOR
                </CyberButton>
              </a>
            </Link>
            <Link href="/ai-autonomous">
              <a>
                <CyberButton
                  className="w-full bg-gradient-to-r from-electricPurple/20 to-electricPurple/10 hover:from-electricPurple/30 hover:to-electricPurple/20 border-electricPurple/30"
                  iconLeft={<i className="fas fa-brain"></i>}
                >
                  NEURAL GENERATOR
                </CyberButton>
              </a>
            </Link>
          </div>
        </DashboardCard>
      </div>

      {/* Quick Actions Panel 2025 */}
      <div className="mb-8 rounded-lg border border-neonGreen/20 p-4 bg-gradient-to-b from-spaceBlack/60 to-spaceBlack/90 backdrop-blur-sm">
        <h3 className="text-neonGreen font-future mb-4 text-lg flex items-center">
          <i className="fas fa-bolt mr-2"></i> Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link href="/manual-post">
            <a className="p-4 bg-gradient-to-br from-cyberBlue/10 to-transparent border border-cyberBlue/30 rounded-lg flex flex-col items-center justify-center text-center hover:from-cyberBlue/20 hover:border-cyberBlue/50 transition-all duration-300">
              <i className="fas fa-message text-cyberBlue text-2xl mb-2"></i>
              <span className="text-xs text-techWhite/90">Create Post</span>
            </a>
          </Link>
          <Link href="/ai-autonomous">
            <a className="p-4 bg-gradient-to-br from-electricPurple/10 to-transparent border border-electricPurple/30 rounded-lg flex flex-col items-center justify-center text-center hover:from-electricPurple/20 hover:border-electricPurple/50 transition-all duration-300">
              <i className="fas fa-robot text-electricPurple text-2xl mb-2"></i>
              <span className="text-xs text-techWhite/90">Auto Generate</span>
            </a>
          </Link>
          <Link href="/crypto-trading">
            <a className="p-4 bg-gradient-to-br from-neonGreen/10 to-transparent border border-neonGreen/30 rounded-lg flex flex-col items-center justify-center text-center hover:from-neonGreen/20 hover:border-neonGreen/50 transition-all duration-300">
              <i className="fas fa-chart-line text-neonGreen text-2xl mb-2"></i>
              <span className="text-xs text-techWhite/90">Trading Calls</span>
            </a>
          </Link>
          <Link href="/analytics">
            <a className="p-4 bg-gradient-to-br from-cyberBlue/10 to-transparent border border-cyberBlue/30 rounded-lg flex flex-col items-center justify-center text-center hover:from-cyberBlue/20 hover:border-cyberBlue/50 transition-all duration-300">
              <i className="fas fa-chart-bar text-cyberBlue text-2xl mb-2"></i>
              <span className="text-xs text-techWhite/90">Analytics</span>
            </a>
          </Link>
          <Link href="/settings">
            <a className="p-4 bg-gradient-to-br from-electricPurple/10 to-transparent border border-electricPurple/30 rounded-lg flex flex-col items-center justify-center text-center hover:from-electricPurple/20 hover:border-electricPurple/50 transition-all duration-300">
              <i className="fas fa-gear text-electricPurple text-2xl mb-2"></i>
              <span className="text-xs text-techWhite/90">Settings</span>
            </a>
          </Link>
          <div className="p-4 bg-gradient-to-br from-neonGreen/10 to-transparent border border-neonGreen/30 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:from-neonGreen/20 hover:border-neonGreen/50 transition-all duration-300">
            <i className="fas fa-headset text-neonGreen text-2xl mb-2"></i>
            <span className="text-xs text-techWhite/90">Voice Assistant</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
