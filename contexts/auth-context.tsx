
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type Profile = {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  refreshProfile: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (!user) return
    
    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      setIsLoading(true)
      
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)
        
        // Fetch profile if user exists
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initAuth()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user || null)
        
        // Fetch profile if user exists
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }
      }
    )
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
