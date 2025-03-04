
// This is a mock implementation for development
// Replace with actual Supabase client when you have your credentials

// Create a custom event system to simulate Supabase auth state changes
const authStateChangeEvent = new EventTarget();

const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock sign in with:', email);
      // Store mock session in localStorage for persistence
      const user = { email, id: '123', user_metadata: { name: 'Demo User' } };
      localStorage.setItem('mockAuthSession', JSON.stringify(user));
      
      // Dispatch auth state change event
      const event = new CustomEvent('SIGNED_IN', { detail: { user } });
      authStateChangeEvent.dispatchEvent(event);
      
      return { 
        data: { 
          session: { user } 
        }, 
        error: null 
      };
    },
    signUp: async ({ email, password, options }: any) => {
      console.log('Mock sign up with:', email);
      // Store mock session in localStorage for persistence
      const user = { email, id: '123', user_metadata: options?.data || {} };
      localStorage.setItem('mockAuthSession', JSON.stringify(user));
      
      // Dispatch auth state change event
      const event = new CustomEvent('SIGNED_IN', { detail: { user } });
      authStateChangeEvent.dispatchEvent(event);
      
      return { 
        data: { 
          session: { user } 
        }, 
        error: null 
      };
    },
    signInWithOAuth: async ({ provider, options }: any) => {
      console.log('Mock OAuth sign in with:', provider);
      // In a real implementation, this would redirect to the OAuth provider
      
      // Create a mock user for the OAuth provider
      const user = { 
        email: `user@${provider}.com`, 
        id: '123', 
        user_metadata: { 
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
          avatar_url: '/placeholder-user.jpg'
        } 
      };
      
      localStorage.setItem('mockAuthSession', JSON.stringify(user));
      
      // Dispatch auth state change event
      const event = new CustomEvent('SIGNED_IN', { detail: { user } });
      authStateChangeEvent.dispatchEvent(event);
      
      window.location.href = '/feed';
      return { error: null };
    },
    signOut: async () => {
      localStorage.removeItem('mockAuthSession');
      
      // Dispatch auth state change event
      const event = new CustomEvent('SIGNED_OUT', { detail: null });
      authStateChangeEvent.dispatchEvent(event);
      
      return { error: null };
    },
    getSession: async () => {
      // Check local storage for mock session
      const savedSession = localStorage.getItem('mockAuthSession');
      if (savedSession) {
        return { data: { session: { user: JSON.parse(savedSession) } } };
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
      
      // Set up listeners for the auth state change events
      const signedInHandler = (e: any) => {
        callback('SIGNED_IN', { user: e.detail.user });
      };
      
      const signedOutHandler = () => {
        callback('SIGNED_OUT', null);
      };
      
      authStateChangeEvent.addEventListener('SIGNED_IN', signedInHandler);
      authStateChangeEvent.addEventListener('SIGNED_OUT', signedOutHandler);
      
      // Return an object that matches the expected structure
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {
              authStateChangeEvent.removeEventListener('SIGNED_IN', signedInHandler);
              authStateChangeEvent.removeEventListener('SIGNED_OUT', signedOutHandler);
              console.log('Unsubscribed from auth state');
            } 
          } 
        } 
      };
    }
  },
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'profiles' && column === 'id') {
            return { 
              data: { 
                id: value, 
                username: 'demo_user', 
                name: 'Demo User',
                headline: 'ESG Professional',
                bio: 'This is a mock profile for demonstration purposes.',
                avatar_url: '/placeholder-user.jpg'
              } 
            };
          }
          return { data: null };
        },
        order: (orderColumn: string, direction: 'asc' | 'desc' = 'asc') => ({
          limit: (limit: number) => ({
            data: []
          })
        })
      })
    }),
    insert: (data: any) => ({
      select: (columns: string = '*') => ({
        single: async () => ({ data })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data })
      })
    })
  })
};

export const supabase = mockSupabase;
