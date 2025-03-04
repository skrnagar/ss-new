
// This is a mock implementation for development
// Replace with actual Supabase client when you have your credentials

const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock sign in with:', email);
      return { 
        data: { 
          session: { user: { email, id: '123', user_metadata: { name: 'Demo User' } } } 
        }, 
        error: null 
      };
    },
    signUp: async ({ email, password, options }: any) => {
      console.log('Mock sign up with:', email);
      return { 
        data: { 
          session: { user: { email, id: '123', user_metadata: options?.data || {} } } 
        }, 
        error: null 
      };
    },
    signInWithOAuth: async ({ provider, options }: any) => {
      console.log('Mock OAuth sign in with:', provider);
      // In a real implementation, this would redirect to the OAuth provider
      window.location.href = '/feed';
      return { error: null };
    },
    getSession: async () => {
      // Check local storage for mock session
      const savedSession = localStorage.getItem('mockAuthSession');
      if (savedSession) {
        return { data: { session: JSON.parse(savedSession) } };
      }
      return { data: { session: null } };
    },
    onAuthStateChange: (callback: any) => {
      // For mock purposes, set an initial state
      setTimeout(() => {
        const savedSession = localStorage.getItem('mockAuthSession');
        if (savedSession) {
          callback('SIGNED_IN', { user: JSON.parse(savedSession) });
        }
      }, 100);
      
      return { 
        subscription: { 
          unsubscribe: () => console.log('Unsubscribed from auth state') 
        } 
      };
    }
  }
};

export const supabase = mockSupabase;
