
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

// Initialize auth listener to handle auth state changes
if (typeof window !== 'undefined') {
  let isRedirecting = false;
  
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'user authenticated' : 'no session')
    
    // Prevent multiple redirects
    if (isRedirecting) return;
    
    // Handle auth events
    switch (event) {
      case 'SIGNED_OUT':
        isRedirecting = true;
        // Clear any cached auth state
        sessionStorage.removeItem('userSession');
        localStorage.removeItem('supabase.auth.token');
        
        // Hard refresh to ensure all components recognize the user is logged out
        window.location.href = '/';
        break;
        
      case 'SIGNED_IN':
        // The callback route will handle redirects after sign in
        // Don't set isRedirecting here to avoid interfering with the callback
        break;
        
      case 'USER_UPDATED':
        // Force refresh to ensure UI reflects latest user data
        window.location.reload();
        break;
    }
  })
}
