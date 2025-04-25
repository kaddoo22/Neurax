import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/index";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Simulate a logged in user
  const mockUser: User = {
    id: 1,
    username: "Admin",
    email: "admin@neurax.ai",
    twitterConnected: true,
    twitterUsername: "NeuraXAI",
    twitterId: "123456789"
  };

  return {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: () => {},
    isLoggingIn: false,
    register: () => {},
    isRegistering: false,
    logout: () => setLocation("/dashboard"),
    isLoggingOut: false,
    loginWithTwitter: () => {}
  };
}
