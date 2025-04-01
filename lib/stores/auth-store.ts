
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
};

type AuthStore = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  refreshProfile: async () => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, headline, position, company')
        .eq('id', user.id)
        .single()

      if (error) throw error
      set({ profile: data })
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }
}))

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.getState().setUser(session?.user || null)
  if (session?.user) {
    useAuthStore.getState().refreshProfile()
  } else {
    useAuthStore.getState().setProfile(null)
  }
})
