import React, { useState } from "react";
import { useTwitter } from "@/hooks/use-twitter";
import { useAI } from "@/hooks/use-ai";
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
import { Textarea } from "@/components/ui/textarea";
import { CyberButton } from "@/components/ui/cyber-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const postSchema = z.object({
  content: z.string().min(1, "Content is required").max(280, "Maximum 280 characters allowed"),
  imagePrompt: z.string().optional(),
  scheduledFor: z.string().optional(),
});

const ManualPost = () => {
  const { isTwitterConnected, createPost } = useTwitter();
  const { generateText, isGeneratingText, generatedText, generateImage, isGeneratingImage, generatedImage } = useAI();
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState<string>("compose");
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Setup form
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      imagePrompt: "",
      scheduledFor: "",
    },
  });

  // AI content generation
  const handleAiGenerate = () => {
    const topicInput = document.getElementById("topic") as HTMLInputElement;
    const contentTypeSelect = document.getElementById("contentType") as HTMLSelectElement;
    
    if (!topicInput || !contentTypeSelect || !topicInput.value) {
      toast({
        title: "Error",
        description: "Please enter a topic for AI generation",
        variant: "destructive",
      });
      return;
    }
    
    const topic = topicInput.value;
    const contentType = contentTypeSelect.value as "tweet" | "thread" | "reply" | "meme";
    
    // AI processing animation
    setAiProgress(0);
    const interval = setInterval(() => {
      setAiProgress((prev) => {
        const newValue = prev + Math.random() * 15;
        return newValue >= 100 ? 100 : newValue;
      });
    }, 200);
    
    // Generate content
    generateText({
      topic,
      contentType,
      tone: "confident,trader",
      maxLength: 280,
    });
    
    // Cleanup interval after generation
    setTimeout(() => {
      clearInterval(interval);
      setAiProgress(100);
    }, 2000);
  };

  // AI image generation
  const handleImageGenerate = () => {
    const imagePrompt = form.getValues("imagePrompt");
    
    if (!imagePrompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt for image generation",
        variant: "destructive",
      });
      return;
    }
    
    generateImage({ prompt: imagePrompt });
  };

  // Apply AI generated content to form
  const applyGeneratedContent = () => {
    if (generatedText) {
      form.setValue("content", generatedText);
    }
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof postSchema>) => {
    if (!isTwitterConnected) {
      toast({
        title: "Twitter Not Connected",
        description: "Please connect your Twitter account in Settings",
        variant: "destructive",
      });
      return;
    }
    
    setIsPosting(true);
    
    // Prepare post data
    const postData: any = {
      content: values.content,
      aiGenerated: false,
    };
    
    // Add image if available
    if (imagePreview) {
      postData.imageUrl = imagePreview;
    }
    
    // Add scheduled time if set
    if (values.scheduledFor) {
      postData.scheduledFor = new Date(values.scheduledFor).toISOString();
    }
    
    // Create the post
    createPost(postData);
    
    // Reset form after submission
    setTimeout(() => {
      form.reset();
      setImagePreview(null);
      setIsPosting(false);
      
      toast({
        title: "Success",
        description: values.scheduledFor 
          ? "Post scheduled successfully" 
          : "Post published successfully",
      });
    }, 1500);
  };

  // Update image preview when AI generates one
  React.useEffect(() => {
    if (generatedImage) {
      setImagePreview(generatedImage);
    }
  }, [generatedImage]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-future font-bold text-neonGreen mb-2">Manual Post</h2>
        <p className="text-matrixGreen/70">Create and schedule posts with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="cyber-card rounded-lg p-5 relative overflow-hidden">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-2 mb-6 bg-spaceBlack">
                <TabsTrigger value="compose" className="data-[state=active]:bg-neonGreen/20 data-[state=active]:text-neonGreen">
                  <i className="fas fa-edit mr-2"></i> Compose
                </TabsTrigger>
                <TabsTrigger value="ai-assist" className="data-[state=active]:bg-cyberBlue/20 data-[state=active]:text-cyberBlue">
                  <i className="fas fa-robot mr-2"></i> AI Assist
                </TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <TabsContent value="compose">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-matrixGreen">Post Content</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="What's happening in the crypto world?"
                                className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen resize-none h-32"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs">
                              <FormMessage className="text-red-400" />
                              <span className={`${field.value.length > 280 ? 'text-red-400' : 'text-matrixGreen/70'}`}>
                                {field.value.length}/280
                              </span>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imagePrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-matrixGreen">Image Generation Prompt</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Describe the image you want to generate"
                                  className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                                />
                              </FormControl>
                              <CyberButton
                                type="button"
                                onClick={handleImageGenerate}
                                disabled={isGeneratingImage || !field.value}
                                className="whitespace-nowrap"
                              >
                                {isGeneratingImage ? (
                                  <>
                                    <span className="animate-spin mr-2">
                                      <i className="fas fa-circle-notch"></i>
                                    </span>
                                    GENERATING...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-image mr-2"></i>
                                    GENERATE
                                  </>
                                )}
                              </CyberButton>
                            </div>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="scheduledFor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-matrixGreen">Schedule Post (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="datetime-local"
                                className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <CyberButton
                          type="submit"
                          className="w-full"
                          disabled={isPosting || !isTwitterConnected}
                          iconLeft={<i className="fas fa-paper-plane"></i>}
                        >
                          {isPosting ? (
                            <>
                              <span className="animate-spin mr-2">
                                <i className="fas fa-circle-notch"></i>
                              </span>
                              PUBLISHING...
                            </>
                          ) : form.watch("scheduledFor") ? (
                            "SCHEDULE POST"
                          ) : (
                            "PUBLISH NOW"
                          )}
                        </CyberButton>
                        
                        {!isTwitterConnected && (
                          <p className="text-red-400 text-xs mt-2 text-center">
                            <i className="fas fa-exclamation-triangle mr-1"></i>
                            Twitter account not connected. Please visit Settings.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ai-assist">
                    <div className="space-y-4">
                      <div>
                        <label className="text-matrixGreen text-sm mb-1 block">Topic</label>
                        <Input
                          id="topic"
                          placeholder="e.g., Bitcoin price prediction, NFT trends, DeFi protocols"
                          className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen"
                        />
                      </div>
                      
                      <div>
                        <label className="text-matrixGreen text-sm mb-1 block">Content Type</label>
                        <Select defaultValue="tweet" id="contentType">
                          <SelectTrigger className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen text-matrixGreen">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent className="bg-cyberDark border-neonGreen/30 text-matrixGreen">
                            <SelectItem value="tweet">Tweet</SelectItem>
                            <SelectItem value="thread">Thread Starter</SelectItem>
                            <SelectItem value="reply">Reply</SelectItem>
                            <SelectItem value="meme">Meme Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="pt-2">
                        <CyberButton
                          type="button"
                          className="w-full"
                          onClick={handleAiGenerate}
                          disabled={isGeneratingText}
                          iconLeft={<i className="fas fa-magic"></i>}
                        >
                          {isGeneratingText ? (
                            <>
                              <span className="animate-spin mr-2">
                                <i className="fas fa-circle-notch"></i>
                              </span>
                              AI WRITING...
                            </>
                          ) : (
                            "GENERATE WITH AI"
                          )}
                        </CyberButton>
                      </div>
                      
                      {aiProgress > 0 && (
                        <div className="py-2">
                          <LoadingBar
                            value={aiProgress}
                            color="cyberBlue"
                            showPercentage
                            label="AI Processing"
                          />
                        </div>
                      )}
                      
                      {generatedText && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-spaceBlack border border-cyberBlue/30 rounded p-4">
                            <h4 className="font-mono text-sm text-cyberBlue mb-2">AI Generated Content:</h4>
                            <p className="text-matrixGreen">{generatedText}</p>
                          </div>
                          
                          <CyberButton
                            type="button"
                            className="w-full"
                            onClick={applyGeneratedContent}
                            iconLeft={<i className="fas fa-check"></i>}
                          >
                            USE THIS CONTENT
                          </CyberButton>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="cyber-card rounded-lg p-5 relative overflow-hidden">
            <h3 className="font-mono text-lg text-cyberBlue mb-4">Post Preview</h3>
            
            <div className="border border-neonGreen/20 rounded-lg p-4 bg-spaceBlack">
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 flex items-center justify-center border border-neonGreen/40 mr-3">
                  <i className="fas fa-user text-neonGreen"></i>
                </div>
                <div>
                  <p className="font-semibold text-neonGreen">NeuraX</p>
                  <p className="text-xs text-matrixGreen/70">@neurax_ai</p>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-matrixGreen">
                  {form.watch("content") || "Your post content will appear here"}
                </p>
              </div>
              
              {imagePreview && (
                <div className="mb-3 rounded overflow-hidden border border-neonGreen/30">
                  <img 
                    src={imagePreview} 
                    alt="Generated preview" 
                    className="w-full max-h-64 object-cover"
                  />
                </div>
              )}
              
              <div className="flex justify-between text-xs text-matrixGreen/50">
                <span>{new Date().toLocaleTimeString()} · {new Date().toLocaleDateString()}</span>
                <span>
                  <i className="fab fa-twitter text-cyberBlue"></i>
                </span>
              </div>
            </div>
            
            <Separator className="my-6 bg-neonGreen/20" />
            
            <div>
              <h4 className="font-mono text-sm text-cyberBlue mb-3">Posting Tips</h4>
              
              <ul className="space-y-2 text-sm text-matrixGreen/80">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-neonGreen mt-1 mr-2"></i>
                  <span>Use hashtags wisely - 2-3 relevant tags perform best</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-neonGreen mt-1 mr-2"></i>
                  <span>Ask questions to encourage engagement from followers</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-neonGreen mt-1 mr-2"></i>
                  <span>Include visual content for higher engagement rates</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-neonGreen mt-1 mr-2"></i>
                  <span>Best posting times: 8-10am, 12-1pm, and 6-8pm</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ManualPost;
