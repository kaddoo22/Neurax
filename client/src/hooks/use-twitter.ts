import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Definiamo i tipi basati sullo schema che altrimenti avremmo importato da ../shared/schema
interface TwitterAccount {
  id: number;
  userId: number;
  twitterId: string;
  twitterUsername: string;
  accountName: string;
  profileImageUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  isDefault: boolean;
  createdAt?: Date;
}

interface User {
  id: number;
  username: string;
  email: string;
  twitterConnected?: boolean;
  twitterUsername?: string;
  twitterAccounts?: TwitterAccount[];
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
      
      // Debug delle informazioni sull'URL di autenticazione
      console.log("[DEBUG] Twitter auth URL generato dal server:", data.url);
      
      // Verifica se l'URL è corretto (ha S256 come code_challenge_method)
      if (data.url.includes('code_challenge_method=plain') || data.url.includes('localhost')) {
        console.error("[ERRORE] URL di autenticazione Twitter non valido. Contattare il supporto.");
        throw new Error("URL di autenticazione non valido. Usa l'URL generato dal server.");
      }
      
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

  // Verifichiamo che l'utente abbia almeno un account Twitter collegato
  const isTwitterConnected = !!user?.twitterConnected;
  
  // Ottieni gli account Twitter dell'utente
  const { data: twitterAccounts, isLoading: isLoadingTwitterAccounts } = useQuery<TwitterAccount[]>({
    queryKey: ["/api/twitter/accounts"],
    // Esegui la query solo se l'utente è loggato e ha Twitter connesso
    enabled: !!user?.id && isTwitterConnected
  });

  // Create a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      imageUrl?: string;
      scheduledFor?: Date;
      aiGenerated?: boolean;
      twitterAccountId?: number; // ID dell'account Twitter da utilizzare
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
  const sendTestTweet = async (accountId?: number) => {
    if (!isTwitterConnected) {
      toast({
        title: "Twitter non connesso",
        description: "Per favore connetti il tuo account Twitter nelle impostazioni",
        variant: "destructive",
      });
      return;
    }
    
    // Verifica se è stato specificato un account o usa il default
    const defaultTwitterAccount = twitterAccounts?.find(account => account.isDefault);
    if (!defaultTwitterAccount && !accountId) {
      toast({
        title: "Nessun account Twitter predefinito",
        description: "Imposta un account Twitter predefinito o specifica un ID account",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const testPostData = {
        content: "Ciao Mondo! Test da NeuraX - Social Media Manager AI 🤖 #NeuraxAI",
        aiGenerated: false,
        // Usa l'accountId specificato o l'ID dell'account predefinito
        twitterAccountId: accountId || defaultTwitterAccount?.id
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

  // Imposta un account Twitter come default
  const setDefaultAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest("POST", `/api/twitter/accounts/default/${accountId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/twitter/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account impostato come default",
        description: "L'account Twitter selezionato è ora il tuo account predefinito"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: `Impossibile impostare l'account come default: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Elimina un account Twitter
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest("DELETE", `/api/twitter/accounts/${accountId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/twitter/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account eliminato",
        description: "L'account Twitter è stato rimosso correttamente"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: `Impossibile eliminare l'account: ${error.message}`,
        variant: "destructive"
      });
    }
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
    sendTestTweet, // Funzione di test
    twitterAccounts: twitterAccounts || [],
    isLoadingTwitterAccounts,
    setDefaultAccount: setDefaultAccountMutation.mutate,
    isSettingDefaultAccount: setDefaultAccountMutation.isPending,
    deleteAccount: deleteAccountMutation.mutate,
    isDeletingAccount: deleteAccountMutation.isPending,
    // Ottieni l'account predefinito se presente
    defaultAccount: twitterAccounts?.find(account => account.isDefault)
  };
}
