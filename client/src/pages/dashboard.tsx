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
import { formatDate, timeAgo } from "@/lib/utils";

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

  // Get metrics data
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<MetricsData>({
    queryKey: ["/api/metrics"],
  });

  // Create timeline items from posts and trading calls
  useEffect(() => {
    if (!posts || !tradingCalls) return;

    const timeline: TimelineItem[] = [];

    // Add posts to timeline
    posts.slice(0, 5).forEach((post) => {
      timeline.push({
        id: `post-${post.id}`,
        content: post.aiGenerated
          ? "AI generated a post about " + (post.content.substring(0, 30) + "...")
          : "You published a tweet " + (post.content.substring(0, 30) + "..."),
        timestamp: post.createdAt,
        description: post.engagement 
          ? `Generated ${post.engagement.likes} likes, ${post.engagement.retweets} retweets`
          : undefined,
        type: post.imageUrl ? "meme" : "tweet",
      });
    });

    // Add trading calls to timeline
    tradingCalls.slice(0, 3).forEach((call) => {
      timeline.push({
        id: `call-${call.id}`,
        content: `${call.status === "ACTIVE" ? "Generated" : "Closed"} a ${call.position} position on ${call.asset}`,
        timestamp: call.status === "ACTIVE" ? call.startDate : call.endDate || call.startDate,
        description: call.status === "CLOSED" && call.profitLoss
          ? `Result: ${parseFloat(call.profitLoss) > 0 ? "+" : ""}${call.profitLoss}% P/L`
          : undefined,
        type: "other",
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

  // Calculate system health metrics
  const systemResources = 87;
  const apiCredits = 62;
  const learningProgress = 94;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-future font-bold text-neonGreen mb-2">Dashboard</h2>
        <p className="text-matrixGreen/70">System overview and performance metrics</p>
      </div>

      {!isTwitterConnected && (
        <div className="cyber-card rounded-lg p-5 mb-6 border-cyberBlue/30 bg-gradient-to-r from-transparent to-cyberBlue/5">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-12 w-12 rounded-full bg-cyberBlue/10 border border-cyberBlue/30 flex items-center justify-center mr-4">
                <i className="fab fa-twitter text-cyberBlue text-xl"></i>
              </div>
              <div>
                <h3 className="font-mono text-lg text-cyberBlue mb-1">Connect Your Twitter Account</h3>
                <p className="text-sm text-techWhite/70">Connect your Twitter account to enable autonomous posting</p>
              </div>
            </div>
            <Link href="/settings">
              <a>
                <CyberButton
                  iconLeft={<i className="fas fa-plug"></i>}
                >
                  CONNECT ACCOUNT
                </CyberButton>
              </a>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Followers"
          value={metrics?.followers || 0}
          trend="up"
          trendValue="+5% this week"
          color="neonGreen"
        />
        <StatCard
          label="Engagement"
          value={`${metrics?.engagement || 0}%`}
          trend="up"
          trendValue="+18.7% vs last week"
          color="cyberBlue"
        />
        <StatCard
          label="Impressions"
          value={metrics?.impressions.toLocaleString() || "0"}
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
        {/* System Status */}
        <DashboardCard title="System Status" titleColor="cyberBlue">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 flex items-center justify-center border-2 border-neonGreen/40 animate-pulse-glow mr-4">
              <i className="fas fa-microchip text-neonGreen text-xl"></i>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-neonGreen animate-pulse mr-2"></div>
                <p className="text-neonGreen font-bold">ACTIVE</p>
              </div>
              <p className="text-sm text-techWhite/70">NeuraX is online and operational</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <LoadingBar
              label="System Resources"
              value={systemResources}
              color="neonGreen"
              showPercentage
            />
            <LoadingBar
              label="API Credits"
              value={apiCredits}
              color="neonGreen"
              showPercentage
            />
            <LoadingBar
              label="Learning Progress"
              value={learningProgress}
              color="cyberBlue"
              showPercentage
            />
          </div>

          <div className="font-mono text-xs text-techWhite/60 p-3 bg-spaceBlack rounded border border-neonGreen/20">
            <div className="flex items-start">
              <span className="text-neonGreen mr-1">&gt;</span>
              <div>
                <span className="text-neonGreen">LATEST LOG:</span> Successfully analyzed 230 trending posts. Generated 14 content ideas. Scheduled 3 posts for optimal engagement.
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Recent Activity */}
        <DashboardCard title="Recent Activity" className="lg:col-span-2" titleColor="cyberBlue">
          {isLoadingPosts ? (
            <div className="h-48 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-t-neonGreen border-r-neonGreen/50 border-b-neonGreen/20 border-l-neonGreen/20 animate-spin"></div>
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-matrixGreen/70 mb-4">No activity recorded yet</p>
              <Link href="/manual-post">
                <a>
                  <CyberButton
                    iconLeft={<i className="fas fa-plus"></i>}
                  >
                    CREATE YOUR FIRST POST
                  </CyberButton>
                </a>
              </Link>
            </div>
          ) : (
            <Timeline items={timelineItems} />
          )}
        </DashboardCard>

        {/* Trading Overview */}
        <DashboardCard title="Trading Performance" titleColor="cyberBlue">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-3 bg-gradient-to-br from-neonGreen/10 to-transparent border border-neonGreen/30 rounded">
              <p className="text-xs text-matrixGreen/70 mb-1">Success Rate</p>
              <p className="text-xl font-bold text-neonGreen">{successRate.toFixed(1)}%</p>
              <p className="text-xs text-matrixGreen/60">
                <i className="fas fa-check text-neonGreen mr-1"></i> Profitable
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyberBlue/10 to-transparent border border-cyberBlue/30 rounded">
              <p className="text-xs text-matrixGreen/70 mb-1">Avg. ROI</p>
              <p className="text-xl font-bold text-cyberBlue">
                {overallROI > 0 ? "+" : ""}{overallROI.toFixed(2)}%
              </p>
              <p className="text-xs text-matrixGreen/60">
                <i className="fas fa-chart-line text-cyberBlue mr-1"></i> Per trade
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {tradingCalls.slice(0, 3).map((call) => (
              <div 
                key={call.id}
                className="text-sm border border-neonGreen/20 rounded p-2 bg-gradient-to-r from-transparent to-neonGreen/5"
              >
                <div className="flex justify-between items-center">
                  <span className="text-matrixGreen flex items-center">
                    <i className={`${call.asset === 'BTC' ? 'fab fa-bitcoin' : call.asset === 'ETH' ? 'fab fa-ethereum' : `fas fa-${getAssetIcon(call.asset)}`} mr-2 ${call.asset === 'BTC' ? 'text-neonGreen' : call.asset === 'ETH' ? 'text-electricPurple' : 'text-cyberBlue'}`}></i>
                    {call.asset}/USD {call.position}
                  </span>
                  <span className={call.profitLoss && parseFloat(call.profitLoss) > 0 ? 'text-neonGreen' : 'text-red-400'}>
                    {call.profitLoss ? `${parseFloat(call.profitLoss) > 0 ? '+' : ''}${call.profitLoss}%` : 'ACTIVE'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-techWhite/60 mt-1">
                  <span>Entry: ${call.entryPrice}</span>
                  <span>{timeAgo(call.startDate)}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/crypto-trading">
            <a>
              <CyberButton
                className="w-full"
                iconLeft={<i className="fas fa-chart-line"></i>}
              >
                VIEW ALL TRADING CALLS
              </CyberButton>
            </a>
          </Link>
        </DashboardCard>

        {/* Scheduled Posts */}
        <DashboardCard title="Upcoming Posts" className="lg:col-span-2" titleColor="cyberBlue">
          <div className="space-y-3 mb-4">
            {isLoadingPosts ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-t-neonGreen border-r-neonGreen/50 border-b-neonGreen/20 border-l-neonGreen/20 animate-spin"></div>
              </div>
            ) : (
              posts
                ?.filter(post => post.scheduledFor && !post.published)
                .slice(0, 3)
                .map(post => (
                  <div
                    key={post.id}
                    className="border border-neonGreen/30 rounded bg-gradient-to-r from-transparent to-neonGreen/5 p-3"
                  >
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-xs px-2 py-0.5 bg-neonGreen/20 text-neonGreen rounded mr-2">
                          {formatDate(post.scheduledFor)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-matrixGreen mb-2">{post.content}</p>
                    <div className="flex items-center text-xs text-techWhite/60">
                      {post.imageUrl && (
                        <span className="mr-3">
                          <i className="fas fa-image text-cyberBlue mr-1"></i> Image attached
                        </span>
                      )}
                      {post.aiGenerated && (
                        <span>
                          <i className="fas fa-robot text-electricPurple mr-1"></i> AI generated
                        </span>
                      )}
                    </div>
                  </div>
                ))
            )}

            {!isLoadingPosts && (!posts || posts.filter(post => post.scheduledFor && !post.published).length === 0) && (
              <div className="text-center py-8">
                <p className="text-matrixGreen/70 mb-4">No scheduled posts yet</p>
                <Link href="/manual-post">
                  <a>
                    <CyberButton
                      iconLeft={<i className="fas fa-calendar-plus"></i>}
                    >
                      SCHEDULE A POST
                    </CyberButton>
                  </a>
                </Link>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Link href="/manual-post">
              <a>
                <CyberButton
                  iconLeft={<i className="fas fa-edit"></i>}
                >
                  MANUAL POST
                </CyberButton>
              </a>
            </Link>
            <Link href="/ai-autonomous">
              <a>
                <CyberButton
                  iconLeft={<i className="fas fa-robot"></i>}
                >
                  AI AUTONOMOUS
                </CyberButton>
              </a>
            </Link>
          </div>
        </DashboardCard>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
