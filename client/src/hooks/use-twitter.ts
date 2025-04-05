import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Definiamo i tipi basati sullo schema che altrimenti avremmo importato da ../shared/schema
interface User {
  id: number;
  username: string;
  email: string;
  twitterConnected?: boolean;
  twitterUsername?: string;
  twitterId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  createdAt?: Date;
}

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  twitterId?: string;
  scheduledFor?: Date;
  published: boolean;
  aiGenerated: boolean;
  engagement?: any;
  createdAt: Date;
}

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
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Verifichiamo che l'utente abbia le credenziali Twitter (accessToken e twitterId)
  const isTwitterConnected = !!(user?.accessToken && user?.twitterId);

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

  // Invio di un tweet di test "Ciao Mondo"
  const sendTestTweet = async () => {
    if (!isTwitterConnected) {
      toast({
        title: "Twitter non connesso",
        description: "Per favore connetti il tuo account Twitter nelle impostazioni",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const testPostData = {
        content: "Ciao Mondo! Test da NeuraX - Social Media Manager AI 🤖 #NeuraxAI",
        aiGenerated: false
      };
      
      // Usiamo direttamente la mutation per creare il post
      await createPostMutation.mutateAsync(testPostData);
      
      toast({
        title: "Tweet di test inviato!",
        description: "Il tweet 'Ciao Mondo' è stato pubblicato con successo",
      });
      
      return true;
    } catch (error) {
      console.error("Errore nell'invio del tweet di test:", error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il tweet di test. Controlla i logs per maggiori dettagli.",
        variant: "destructive",
      });
      return false;
    }
  };

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
    sendTestTweet // Aggiungiamo la funzione di test
  };
}
