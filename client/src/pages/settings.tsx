import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTwitter } from "@/hooks/use-twitter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CyberButton } from "@/components/ui/cyber-button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import DashboardCard from "@/components/dashboard/DashboardCard";
import TwitterConnection from "@/components/settings/TwitterConnection";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
  confirmNewPassword: z.string().optional(),
}).refine(data => !data.newPassword || data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

const aiSettingsSchema = z.object({
  contentGeneration: z.boolean(),
  responseTone: z.string(),
  replyToMentions: z.boolean(),
  aiPersonality: z.string(),
  postFrequency: z.string(),
});

const Settings = () => {
  const { user } = useAuth();
  const { isTwitterConnected, initiateTwitterAuth } = useTwitter();
  const { toast } = useToast();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // AI Settings form
  const aiSettingsForm = useForm<z.infer<typeof aiSettingsSchema>>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      contentGeneration: true,
      responseTone: "confident",
      replyToMentions: true,
      aiPersonality: "trader",
      postFrequency: "medium",
    },
  });

  // Handle profile update
  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    setIsUpdatingProfile(true);
    
    // In a real implementation, this would call an API endpoint
    setTimeout(() => {
      setIsUpdatingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    }, 1500);
  };

  // Handle AI settings update
  const onAISettingsSubmit = (values: z.infer<typeof aiSettingsSchema>) => {
    setIsUpdatingSettings(true);
    
    // In a real implementation, this would call an API endpoint
    setTimeout(() => {
      setIsUpdatingSettings(false);
      toast({
        title: "AI Settings Updated",
        description: "Your AI settings have been updated successfully.",
      });
    }, 1500);
  };

  // Handle Twitter connection
  const handleConnectTwitter = async () => {
    try {
      const authUrl = await initiateTwitterAuth();
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate Twitter authentication.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-future font-bold text-neonGreen mb-2">Settings</h2>
        <p className="text-matrixGreen/70">Configure your account and AI preferences</p>
      </div>

      <Tabs defaultValue="profile" className="mb-6">
        <TabsList className="grid grid-cols-3 mb-6 bg-spaceBlack">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-neonGreen/20 data-[state=active]:text-neonGreen"
          >
            <i className="fas fa-user mr-2"></i> Profile
          </TabsTrigger>
          <TabsTrigger 
            value="connections" 
            className="data-[state=active]:bg-cyberBlue/20 data-[state=active]:text-cyberBlue"
          >
            <i className="fas fa-plug mr-2"></i> Connections
          </TabsTrigger>
          <TabsTrigger 
            value="ai" 
            className="data-[state=active]:bg-electricPurple/20 data-[state=active]:text-electricPurple"
          >
            <i className="fas fa-robot mr-2"></i> AI Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <DashboardCard title="Your Profile" titleColor="neonGreen">
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 flex items-center justify-center border border-neonGreen/40 animate-pulse-glow mr-4">
                <i className="fas fa-user-astronaut text-2xl text-neonGreen"></i>
              </div>
              <div>
                <h3 className="text-lg font-medium text-neonGreen">{user?.username}</h3>
                <p className="text-sm text-matrixGreen/70">{user?.email}</p>
                <div className="flex gap-1 mt-1">
                  <div className="px-2 py-1 bg-neonGreen/10 rounded border border-neonGreen/20 text-xs text-neonGreen">
                    PRO
                  </div>
                  <div className="px-2 py-1 bg-electricPurple/10 rounded border border-electricPurple/20 text-xs text-electricPurple">
                    VERIFIED
                  </div>
                </div>
              </div>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-matrixGreen">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-matrixGreen">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Separator className="my-4 bg-neonGreen/20" />
                <h3 className="text-md font-medium text-neonGreen">Change Password</h3>

                <FormField
                  control={profileForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-matrixGreen">Current Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <CyberButton
                    type="button"
                    variant="outline"
                    className="border-red-500/30 hover:border-red-500/60 hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    DELETE ACCOUNT
                  </CyberButton>
                  
                  <CyberButton
                    type="submit"
                    disabled={isUpdatingProfile}
                    iconLeft={isUpdatingProfile ? undefined : <i className="fas fa-save"></i>}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <span className="animate-spin mr-2">
                          <i className="fas fa-circle-notch"></i>
                        </span>
                        UPDATING...
                      </>
                    ) : (
                      "UPDATE PROFILE"
                    )}
                  </CyberButton>
                </div>
              </form>
            </Form>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="connections">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TwitterConnection 
              isConnected={isTwitterConnected}
              onConnect={handleConnectTwitter}
              username={user?.twitterUsername || ""}
            />
            
            <DashboardCard title="API Keys" titleColor="cyberBlue">
              <div className="mb-4">
                <h4 className="text-sm text-matrixGreen mb-2">CoinGecko API</h4>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value="••••••••••••••••••••••••••••••"
                    readOnly
                    className="bg-spaceBlack border-cyberBlue/30 focus:border-cyberBlue text-matrixGreen font-mono"
                  />
                  <CyberButton
                    className="shrink-0"
                    onClick={() => {
                      toast({
                        title: "API Key Copied",
                        description: "API key has been copied to clipboard.",
                      });
                    }}
                  >
                    <i className="fas fa-copy"></i>
                  </CyberButton>
                </div>
                <p className="text-xs text-matrixGreen/50 mt-1">
                  <i className="fas fa-check-circle text-neonGreen mr-1"></i>
                  Connected and working properly
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm text-matrixGreen mb-2">OpenRouter API</h4>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value="••••••••••••••••••••••••••••••"
                    readOnly
                    className="bg-spaceBlack border-cyberBlue/30 focus:border-cyberBlue text-matrixGreen font-mono"
                  />
                  <CyberButton
                    className="shrink-0"
                    onClick={() => {
                      toast({
                        title: "API Key Copied",
                        description: "API key has been copied to clipboard.",
                      });
                    }}
                  >
                    <i className="fas fa-copy"></i>
                  </CyberButton>
                </div>
                <p className="text-xs text-matrixGreen/50 mt-1">
                  <i className="fas fa-check-circle text-neonGreen mr-1"></i>
                  Connected and working properly
                </p>
              </div>
              
              <div>
                <h4 className="text-sm text-matrixGreen mb-2">HuggingFace API</h4>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value="••••••••••••••••••••••••••••••"
                    readOnly
                    className="bg-spaceBlack border-cyberBlue/30 focus:border-cyberBlue text-matrixGreen font-mono"
                  />
                  <CyberButton
                    className="shrink-0"
                    onClick={() => {
                      toast({
                        title: "API Key Copied",
                        description: "API key has been copied to clipboard.",
                      });
                    }}
                  >
                    <i className="fas fa-copy"></i>
                  </CyberButton>
                </div>
                <p className="text-xs text-matrixGreen/50 mt-1">
                  <i className="fas fa-check-circle text-neonGreen mr-1"></i>
                  Connected and working properly
                </p>
              </div>
              
              <Separator className="my-4 bg-cyberBlue/20" />
              
              <CyberButton
                className="w-full"
                onClick={() => {
                  toast({
                    title: "API Settings",
                    description: "API key management is not implemented in this demo.",
                  });
                }}
                iconLeft={<i className="fas fa-key"></i>}
              >
                MANAGE API KEYS
              </CyberButton>
            </DashboardCard>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <DashboardCard title="AI Configuration" titleColor="electricPurple">
            <Form {...aiSettingsForm}>
              <form onSubmit={aiSettingsForm.handleSubmit(onAISettingsSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-electricPurple mb-4">Content Generation</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={aiSettingsForm.control}
                      name="contentGeneration"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-matrixGreen">Autonomous Mode</p>
                            <p className="text-xs text-matrixGreen/70">Allow AI to post content automatically</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-electricPurple"
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={aiSettingsForm.control}
                      name="postFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-matrixGreen">Posting Frequency</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            <CyberButton
                              type="button"
                              variant={field.value === "low" ? "default" : "outline"}
                              className={field.value === "low" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("low")}
                            >
                              LOW (1-2/day)
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "medium" ? "default" : "outline"}
                              className={field.value === "medium" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("medium")}
                            >
                              MEDIUM (3-4/day)
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "high" ? "default" : "outline"}
                              className={field.value === "high" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("high")}
                            >
                              HIGH (5-7/day)
                            </CyberButton>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aiSettingsForm.control}
                      name="replyToMentions"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-matrixGreen">Auto-Reply to Mentions</p>
                            <p className="text-xs text-matrixGreen/70">AI will respond to users who mention you</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-electricPurple"
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                  </div>
                </div>
                
                <Separator className="bg-electricPurple/20" />
                
                <div>
                  <h3 className="text-md font-medium text-electricPurple mb-4">AI Personality</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={aiSettingsForm.control}
                      name="aiPersonality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-matrixGreen">Persona Type</FormLabel>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            <CyberButton
                              type="button"
                              variant={field.value === "trader" ? "default" : "outline"}
                              className={field.value === "trader" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("trader")}
                            >
                              CRYPTO TRADER
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "analyst" ? "default" : "outline"}
                              className={field.value === "analyst" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("analyst")}
                            >
                              MARKET ANALYST
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "educator" ? "default" : "outline"}
                              className={field.value === "educator" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("educator")}
                            >
                              CRYPTO EDUCATOR
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "memer" ? "default" : "outline"}
                              className={field.value === "memer" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("memer")}
                            >
                              CRYPTO MEMER
                            </CyberButton>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aiSettingsForm.control}
                      name="responseTone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-matrixGreen">Tone of Voice</FormLabel>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            <CyberButton
                              type="button"
                              variant={field.value === "confident" ? "default" : "outline"}
                              className={field.value === "confident" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("confident")}
                            >
                              CONFIDENT
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "analytical" ? "default" : "outline"}
                              className={field.value === "analytical" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("analytical")}
                            >
                              ANALYTICAL
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "provocative" ? "default" : "outline"}
                              className={field.value === "provocative" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("provocative")}
                            >
                              PROVOCATIVE
                            </CyberButton>
                            <CyberButton
                              type="button"
                              variant={field.value === "professional" ? "default" : "outline"}
                              className={field.value === "professional" ? "bg-electricPurple/20 border-electricPurple/40" : ""}
                              onClick={() => field.onChange("professional")}
                            >
                              PROFESSIONAL
                            </CyberButton>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="p-4 border border-electricPurple/30 bg-electricPurple/5 rounded">
                  <div className="flex items-start">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-electricPurple/20 to-cyberBlue/20 flex items-center justify-center border border-electricPurple/40 mr-3 shrink-0">
                      <i className="fas fa-robot text-electricPurple"></i>
                    </div>
                    <div>
                      <h4 className="text-sm text-electricPurple font-mono mb-1">AI PERSONALITY PREVIEW</h4>
                      <p className="text-xs text-matrixGreen">
                        {aiSettingsForm.watch("responseTone") === "confident" && "I don't just predict the market, I move it. While everyone debates whether to buy, I've already accumulated a position that would make whales jealous."}
                        {aiSettingsForm.watch("responseTone") === "analytical" && "My analysis indicates a 76% probability of upward movement based on historical patterns, volume analysis, and key support levels at $36,420."}
                        {aiSettingsForm.watch("responseTone") === "provocative" && "While you were FUDing and panic selling, I bought the dip and just made 25% in 48 hours. Still think crypto is a scam? The future doesn't care about your opinion."}
                        {aiSettingsForm.watch("responseTone") === "professional" && "Our latest market research suggests portfolio diversification with 60% tier-1 assets, 30% mid-caps with strong fundamentals, and 10% strategic speculation."}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <CyberButton
                    type="submit"
                    disabled={isUpdatingSettings}
                    iconLeft={isUpdatingSettings ? undefined : <i className="fas fa-robot"></i>}
                  >
                    {isUpdatingSettings ? (
                      <>
                        <span className="animate-spin mr-2">
                          <i className="fas fa-circle-notch"></i>
                        </span>
                        UPDATING...
                      </>
                    ) : (
                      "UPDATE AI SETTINGS"
                    )}
                  </CyberButton>
                </div>
              </form>
            </Form>
          </DashboardCard>
        </TabsContent>
      </Tabs>

      {/* Account Deletion Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-cyberDark border border-red-500/30 text-techWhite">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 font-future text-xl">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-matrixGreen">
              Are you sure you want to delete your account? This action cannot be undone.
              All your data, posts, and settings will be permanently erased.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-spaceBlack/70 p-3 rounded border border-red-500/20 my-4">
            <p className="text-xs text-red-400">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Warning: Your AI model will be terminated and all learned patterns will be lost.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-spaceBlack border-red-500/30 hover:bg-spaceBlack/70 text-matrixGreen">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 text-red-400"
              onClick={() => {
                toast({
                  title: "Account Deletion",
                  description: "Account deletion is not implemented in this demo.",
                });
              }}
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Settings;
