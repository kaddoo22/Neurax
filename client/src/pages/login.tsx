import React, { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  email: z.string().email("Invalid email address"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Login = () => {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    login(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...registerData } = values;
    register(registerData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-repeat">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMzOUZGMTQiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-future text-4xl font-bold text-neonGreen mb-2">
            <span data-text="NeuraX" className="glitch-text">NeuraX</span>
          </h1>
          <p className="text-matrixGreen text-lg">AI Social Media Manager</p>
        </div>

        <Card className="cyber-card backdrop-blur-sm border-neonGreen/20 shadow-lg shadow-neonGreen/10">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-future text-xl text-neonGreen">
                {mode === "login" ? "Authentication" : "Create Account"}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setMode("login")}
                  className={`px-3 py-1 text-xs rounded ${
                    mode === "login"
                      ? "bg-neonGreen/20 text-neonGreen border border-neonGreen/40"
                      : "text-matrixGreen hover:text-neonGreen"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`px-3 py-1 text-xs rounded ${
                    mode === "register"
                      ? "bg-neonGreen/20 text-neonGreen border border-neonGreen/40"
                      : "text-matrixGreen hover:text-neonGreen"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {mode === "login" ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen focus:ring-neonGreen/20 text-matrixGreen"
                            placeholder="Enter your username"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen focus:ring-neonGreen/20 text-matrixGreen"
                            placeholder="Enter your password"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <CyberButton
                    type="submit"
                    className="w-full mt-2"
                    disabled={isLoggingIn}
                    iconLeft={<i className="fas fa-shield-alt"></i>}
                  >
                    {isLoggingIn ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
                  </CyberButton>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen focus:ring-neonGreen/20 text-matrixGreen"
                            placeholder="Choose a username"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen focus:ring-neonGreen/20 text-matrixGreen"
                            placeholder="Enter your email"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen focus:ring-neonGreen/20 text-matrixGreen"
                            placeholder="Create a password"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrixGreen">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="bg-spaceBlack border-neonGreen/30 focus:border-neonGreen focus:ring-neonGreen/20 text-matrixGreen"
                            placeholder="Confirm your password"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <CyberButton
                    type="submit"
                    className="w-full mt-2"
                    disabled={isRegistering}
                    iconLeft={<i className="fas fa-user-plus"></i>}
                  >
                    {isRegistering ? "CREATING ACCOUNT..." : "CREATE NEURAL LINK"}
                  </CyberButton>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center text-xs text-techWhite/60">
              <p>By accessing NeuraX, you agree to</p>
              <p>our Terms of Service and Privacy Policy</p>
              <div className="flex justify-center gap-2 mt-4">
                <span>
                  <i className="fas fa-lock text-neonGreen mr-1"></i> Encrypted
                </span>
                <span>
                  <i className="fas fa-shield-alt text-cyberBlue mr-1"></i> Secured
                </span>
                <span>
                  <i className="fas fa-robot text-electricPurple mr-1"></i> AI-Powered
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
