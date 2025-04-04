import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/types";

export function useTwitter() {
  const { toast } = useToast();

  // Connect Twitter account
  const initiateTwitterAuth = async () => {
    try {
      const response = await apiRequest("GET", "/api/twitter/auth");
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error initiating Twitter auth:", error);
      throw error;
    }
  };

  // Check if Twitter is connected
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const isTwitterConnected = user?.twitterConnected || false;

  // Create a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      imageUrl?: string;
      scheduledFor?: Date;
      aiGenerated?: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/scheduled"] });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("DELETE", `/api/posts/${postId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/scheduled"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Get all posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  // Get scheduled posts
  const { data: scheduledPosts, isLoading: isLoadingScheduledPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/scheduled"],
  });

  return {
    isTwitterConnected,
    initiateTwitterAuth,
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    deletePost: deletePostMutation.mutate,
    isDeletingPost: deletePostMutation.isPending,
    posts: posts || [],
    scheduledPosts: scheduledPosts || [],
    isLoadingPosts,
    isLoadingScheduledPosts,
  };
}
