
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true;
    let authTimeout: NodeJS.Timeout;
    
    // Set a maximum timeout for auth checks
    authTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        setIsLoading(false);
        setIsAuthenticated(false);
        toast({
          title: "Authentication timeout",
          description: "Please try signing in again",
          variant: "destructive",
        });
        router.push('/auth/login');
      }
    }, 5000); // 5 second timeout
    
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (data.session) {
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push('/auth/login');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth check failed:', error);
        setIsLoading(false);
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push('/auth/login');
        }
      }
    );

    // Check auth immediately
    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      subscription?.unsubscribe();
    };
  }, [router, toast, isLoading]);

  // Show lightweight loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}
