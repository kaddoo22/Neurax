import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      console.log('User not authenticated, redirecting to login');
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  // Show loading state while authentication state is being determined
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <div className="border border-neonGreen/20 rounded-lg bg-cyberDark/30 backdrop-blur-lg p-6 shadow-glow-sm">
          <Skeleton className="h-8 w-64 bg-cyberDark/50 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 bg-cyberDark/50" />
            <Skeleton className="h-40 bg-cyberDark/50" />
            <Skeleton className="h-40 bg-cyberDark/50" />
          </div>
        </div>
      </div>
    );
  }

  // Render children only if authenticated
  return user ? <>{children}</> : null;
}