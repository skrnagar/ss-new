
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
    
    // Check authentication on mount - use more efficient approach
    const checkAuth = async () => {
      try {
        // Get existing session without making a new request if possible
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          toast({
            title: "Authentication required",
            description: "Please sign in to access this page",
            variant: "destructive",
          });
          router.push('/auth/login');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth check failed:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        if (session) {
          setIsAuthenticated(true);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          router.push('/auth/login');
        }
      }
    );

    // Check auth after setting up listener to avoid race conditions
    checkAuth();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router, toast]);

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}
