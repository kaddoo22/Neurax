import React from "react";
import { useMetrics } from "@/hooks/use-metrics";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/dashboard/StatCard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MetricsChart from "@/components/analytics/MetricsChart";
import EngagementStats from "@/components/analytics/EngagementStats";
import { CyberButton } from "@/components/ui/cyber-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTwitter } from "@/hooks/use-twitter";
import { LoadingBar } from "@/components/ui/loading-bar";

const Analytics = () => {
  const [timeframe, setTimeframe] = React.useState("week");
  const [topPostType, setTopPostType] = React.useState("engagement");
  const { metrics, isLoading, trends } = useMetrics(timeframe);
  const { posts, isLoadingPosts } = useTwitter();

  // Get top performing posts based on selected type
  const getTopPosts = () => {
    if (!posts) return [];
    
    // Sort posts by engagement for the demo
    return [...posts].sort((a, b) => {
      const aEngagement = a.engagement ? 
        (a.engagement.likes + a.engagement.retweets + a.engagement.replies) : 0;
      const bEngagement = b.engagement ? 
        (b.engagement.likes + b.engagement.retweets + b.engagement.replies) : 0;
      return bEngagement - aEngagement;
    }).slice(0, 3);
  };

  const topPosts = getTopPosts();

  // AI insights - these would be generated via AI in a real implementation
  const aiInsights = [
    "Your engagement rate peaks on Wednesdays between 2-4 PM",
    "Posts with crypto price predictions generate 45% more interactions",
    "Adding images increased your click-through rate by 32%",
    "Followers respond best to confident tone with data-backed statements",
    "Questions at the end of posts get 57% more replies"
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-future font-bold text-neonGreen mb-2">Analytics</h2>
        <p className="text-matrixGreen/70">Performance insights and metrics optimization</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="bg-spaceBlack border-neonGreen/30 text-matrixGreen w-36">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-cyberDark border-neonGreen/30 text-matrixGreen">
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-matrixGreen/70">Timeframe</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <CyberButton
            className="text-xs"
            iconLeft={<i className="fas fa-download"></i>}
          >
            EXPORT DATA
          </CyberButton>
          <CyberButton
            className="text-xs"
            iconLeft={<i className="fas fa-sync"></i>}
          >
            REFRESH
          </CyberButton>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-neonGreen border-r-neonGreen/50 border-b-neonGreen/20 border-l-neonGreen/20 animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Followers"
              value={metrics?.followers || 0}
              trend={trends.followers.direction}
              trendValue={`${trends.followers.value}% vs previous`}
              color="neonGreen"
            />
            <StatCard
              label="Engagement Rate"
              value={`${metrics?.engagement || 0}%`}
              trend={trends.engagement.direction}
              trendValue={`${trends.engagement.value}% vs previous`}
              color="cyberBlue"
            />
            <StatCard
              label="Impressions"
              value={metrics?.impressions ? metrics.impressions.toLocaleString() : "0"}
              trend={trends.impressions.direction}
              trendValue={`${trends.impressions.value}% vs previous`}
              color="electricPurple"
            />
            <StatCard
              label="Click-Through Rate"
              value="3.2%"
              trend="up"
              trendValue="+0.4% vs previous"
              color="neonGreen"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <DashboardCard 
              title="Performance Over Time" 
              className="lg:col-span-2"
              titleColor="cyberBlue"
            >
              <MetricsChart 
                followers={[120, 140, 156, 170, 185, 195, 215]}
                engagement={[2.4, 3.1, 2.8, 3.2, 3.5, 3.2, 3.6]}
                impressions={[850, 920, 1050, 980, 1120, 1250, 1380]}
                timeframe={timeframe}
              />
            </DashboardCard>

            <DashboardCard title="AI Insights" titleColor="electricPurple">
              <div className="mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-electricPurple/20 to-cyberBlue/20 flex items-center justify-center border-2 border-electricPurple/40 animate-pulse-glow mb-3 mx-auto">
                  <i className="fas fa-brain text-electricPurple text-xl"></i>
                </div>
                <p className="text-matrixGreen text-center mb-4">Based on your recent performance, our AI recommends:</p>
              </div>

              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div 
                    key={index} 
                    className="text-xs border border-electricPurple/30 bg-gradient-to-r from-transparent to-electricPurple/5 rounded p-2 text-matrixGreen"
                  >
                    <div className="flex">
                      <span className="text-electricPurple mr-2">•</span>
                      {insight}
                    </div>
                  </div>
                ))}
              </div>

              <CyberButton
                className="w-full mt-4"
                iconLeft={<i className="fas fa-lightbulb"></i>}
              >
                GENERATE MORE INSIGHTS
              </CyberButton>
            </DashboardCard>
          </div>

          <Tabs defaultValue="posts" className="cyber-card rounded-lg p-5 mb-6">
            <TabsList className="grid grid-cols-3 mb-6 bg-spaceBlack">
              <TabsTrigger 
                value="posts" 
                className="data-[state=active]:bg-neonGreen/20 data-[state=active]:text-neonGreen"
              >
                <i className="fas fa-file-alt mr-2"></i> Top Posts
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="data-[state=active]:bg-cyberBlue/20 data-[state=active]:text-cyberBlue"
              >
                <i className="fas fa-users mr-2"></i> Audience
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="data-[state=active]:bg-electricPurple/20 data-[state=active]:text-electricPurple"
              >
                <i className="fas fa-chart-pie mr-2"></i> Content Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-lg text-cyberBlue">Top Performing Posts</h3>
                <div className="flex items-center gap-2">
                  <span className="text-matrixGreen/70 text-sm">Sort by:</span>
                  <Select
                    value={topPostType}
                    onValueChange={setTopPostType}
                  >
                    <SelectTrigger className="bg-spaceBlack border-neonGreen/30 text-matrixGreen w-36 h-8 text-xs">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent className="bg-cyberDark border-neonGreen/30 text-matrixGreen">
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="impressions">Impressions</SelectItem>
                      <SelectItem value="clicks">Clicks</SelectItem>
                      <SelectItem value="shares">Shares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingPosts ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-4 border-t-neonGreen border-r-neonGreen/50 border-b-neonGreen/20 border-l-neonGreen/20 animate-spin"></div>
                </div>
              ) : topPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-matrixGreen/70 mb-4">No posts data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-neonGreen/30 rounded bg-gradient-to-r from-transparent to-neonGreen/5 p-4 hover:border-neonGreen/60 transition-all duration-200"
                    >
                      <p className="text-matrixGreen mb-3">{post.content}</p>
                      
                      {post.imageUrl && (
                        <div className="mb-3 rounded overflow-hidden border border-neonGreen/30 max-w-xs">
                          <img 
                            src={post.imageUrl} 
                            alt="Post image" 
                            className="w-full object-cover"
                          />
                        </div>
                      )}
                      
                      <EngagementStats 
                        likes={post.engagement?.likes || Math.floor(Math.random() * 50)}
                        retweets={post.engagement?.retweets || Math.floor(Math.random() * 20)}
                        replies={post.engagement?.replies || Math.floor(Math.random() * 10)}
                        impressions={post.engagement?.impressions || Math.floor(Math.random() * 1000)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="audience">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-mono text-md text-cyberBlue mb-4">Audience Demographics</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Male</span>
                        <span className="text-neonGreen">68%</span>
                      </div>
                      <LoadingBar value={68} color="neonGreen" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Female</span>
                        <span className="text-cyberBlue">29%</span>
                      </div>
                      <LoadingBar value={29} color="cyberBlue" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Non-binary/Other</span>
                        <span className="text-electricPurple">3%</span>
                      </div>
                      <LoadingBar value={3} color="electricPurple" />
                    </div>
                  </div>
                  
                  <h4 className="font-mono text-sm text-cyberBlue mt-6 mb-4">Age Distribution</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">18-24</span>
                        <span className="text-neonGreen">12%</span>
                      </div>
                      <LoadingBar value={12} color="neonGreen" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">25-34</span>
                        <span className="text-neonGreen">42%</span>
                      </div>
                      <LoadingBar value={42} color="neonGreen" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">35-44</span>
                        <span className="text-cyberBlue">31%</span>
                      </div>
                      <LoadingBar value={31} color="cyberBlue" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">45+</span>
                        <span className="text-electricPurple">15%</span>
                      </div>
                      <LoadingBar value={15} color="electricPurple" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-mono text-md text-cyberBlue mb-4">Geographic Distribution</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">United States</span>
                        <span className="text-neonGreen">34%</span>
                      </div>
                      <LoadingBar value={34} color="neonGreen" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">United Kingdom</span>
                        <span className="text-cyberBlue">18%</span>
                      </div>
                      <LoadingBar value={18} color="cyberBlue" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Singapore</span>
                        <span className="text-electricPurple">12%</span>
                      </div>
                      <LoadingBar value={12} color="electricPurple" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Germany</span>
                        <span className="text-neonGreen">8%</span>
                      </div>
                      <LoadingBar value={8} color="neonGreen" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Japan</span>
                        <span className="text-cyberBlue">6%</span>
                      </div>
                      <LoadingBar value={6} color="cyberBlue" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Other</span>
                        <span className="text-electricPurple">22%</span>
                      </div>
                      <LoadingBar value={22} color="electricPurple" />
                    </div>
                  </div>
                  
                  <h4 className="font-mono text-sm text-cyberBlue mt-6 mb-4">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-neonGreen/20 text-neonGreen rounded border border-neonGreen/30">
                      Cryptocurrency (87%)
                    </span>
                    <span className="text-xs px-2 py-1 bg-cyberBlue/20 text-cyberBlue rounded border border-cyberBlue/30">
                      Trading (72%)
                    </span>
                    <span className="text-xs px-2 py-1 bg-electricPurple/20 text-electricPurple rounded border border-electricPurple/30">
                      Blockchain (65%)
                    </span>
                    <span className="text-xs px-2 py-1 bg-neonGreen/20 text-neonGreen rounded border border-neonGreen/30">
                      Finance (54%)
                    </span>
                    <span className="text-xs px-2 py-1 bg-cyberBlue/20 text-cyberBlue rounded border border-cyberBlue/30">
                      Tech (42%)
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-mono text-md text-cyberBlue mb-4">Content Type Performance</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Market Analysis</span>
                        <span className="text-neonGreen">4.8% Engagement</span>
                      </div>
                      <LoadingBar value={48} max={50} color="neonGreen" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Trading Tips</span>
                        <span className="text-cyberBlue">4.2% Engagement</span>
                      </div>
                      <LoadingBar value={42} max={50} color="cyberBlue" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Memes</span>
                        <span className="text-electricPurple">5.6% Engagement</span>
                      </div>
                      <LoadingBar value={56} max={50} color="electricPurple" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">News</span>
                        <span className="text-neonGreen">3.1% Engagement</span>
                      </div>
                      <LoadingBar value={31} max={50} color="neonGreen" />
                    </div>
                  </div>
                  
                  <h4 className="font-mono text-sm text-cyberBlue mt-6 mb-4">Media Format Performance</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Text Only</span>
                        <span className="text-cyberBlue">2.8% Engagement</span>
                      </div>
                      <LoadingBar value={28} max={50} color="cyberBlue" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Image + Text</span>
                        <span className="text-neonGreen">4.5% Engagement</span>
                      </div>
                      <LoadingBar value={45} max={50} color="neonGreen" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-matrixGreen">Chart + Analysis</span>
                        <span className="text-electricPurple">5.2% Engagement</span>
                      </div>
                      <LoadingBar value={52} max={50} color="electricPurple" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-mono text-md text-cyberBlue mb-4">Optimal Posting Times</h3>
                  
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-center text-xs text-matrixGreen/70">{day}</div>
                    ))}
                    
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <React.Fragment key={hour}>
                        {hour % 3 === 0 && (
                          <div className="col-span-7 text-right text-xs text-matrixGreen/50 pr-2 mt-1">
                            {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
                          </div>
                        )}
                        
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          // Generate a heat value based on day and hour
                          const heatValue = Math.random();
                          const bgColor = 
                            heatValue > 0.8 ? 'bg-neonGreen/80' :
                            heatValue > 0.6 ? 'bg-neonGreen/60' :
                            heatValue > 0.4 ? 'bg-neonGreen/40' :
                            heatValue > 0.2 ? 'bg-neonGreen/20' :
                            'bg-spaceBlack/50';
                          
                          return (
                            <div 
                              key={`${day}-${hour}`}
                              className={`h-3 rounded-sm ${bgColor} border border-neonGreen/10`}
                              title={`${day} at ${hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}`}
                            ></div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-matrixGreen/70">Lower Engagement</span>
                    <div className="flex gap-1 items-center">
                      <div className="h-3 w-3 rounded-sm bg-neonGreen/20 border border-neonGreen/10"></div>
                      <div className="h-3 w-3 rounded-sm bg-neonGreen/40 border border-neonGreen/10"></div>
                      <div className="h-3 w-3 rounded-sm bg-neonGreen/60 border border-neonGreen/10"></div>
                      <div className="h-3 w-3 rounded-sm bg-neonGreen/80 border border-neonGreen/10"></div>
                    </div>
                    <span className="text-xs text-matrixGreen/70">Higher Engagement</span>
                  </div>
                  
                  <div className="p-3 bg-spaceBlack/70 border border-neonGreen/20 rounded mt-4">
                    <h4 className="font-mono text-sm text-cyberBlue mb-2">AI Recommendation</h4>
                    <p className="text-xs text-matrixGreen">
                      Based on your audience activity patterns, the optimal posting times are:
                    </p>
                    <ul className="text-xs text-matrixGreen mt-2 space-y-1">
                      <li className="flex items-center">
                        <span className="text-neonGreen mr-2">•</span>
                        Weekdays: 8-9 AM, 12-1 PM, and 6-8 PM
                      </li>
                      <li className="flex items-center">
                        <span className="text-neonGreen mr-2">•</span>
                        Weekends: 10-11 AM and 7-9 PM
                      </li>
                      <li className="flex items-center">
                        <span className="text-neonGreen mr-2">•</span>
                        Wednesdays show highest overall engagement
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Analytics;
