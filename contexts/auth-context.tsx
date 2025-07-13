"use client";

import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, useMemo } from "react";

type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    user: User | null;
    profile: Profile | null;
  }>({ user: null, profile: null });
  const [loading, setLoading] = useState(true); // NEW loading state

  const memoizedAuthValue = useMemo(() => ({
    user: authState.user,
    profile: authState.profile,
    isLoading: loading, // Use the new loading state
    isAuthenticated: !!authState.user
  }), [authState, loading]);

  // Function to fetch profile data
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, headline, position, company")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        console.error("Error code:", error.code, "Message:", error.message);
        return null;
      }

      console.log("Profile data retrieved:", data ? "success" : "not found");
      return data;
    } catch (error) {
      console.error("Exception in fetchProfile:", error);
      return null;
    }
  };

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (!memoizedAuthValue.user) return;

    const profileData = await fetchProfile(memoizedAuthValue.user.id);
    setAuthState((prev) => ({ ...prev, profile: profileData }));
  };

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        console.log("Initializing auth state...");
        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("Session loaded:", !!session);
        setAuthState((prev) => ({ ...prev, user: session?.user || null, session }));

        // Fetch profile if user exists
        if (session?.user) {
          console.log("User found in session, fetching profile...");
          const profileData = await fetchProfile(session.user.id);
          console.log("Profile loaded:", !!profileData);
          setAuthState((prev) => ({ ...prev, profile: profileData }));
        } else {
          console.log("No user in session");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false); // Set loading to false after initial check
      }
    };

    initAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setAuthState((prev) => ({ ...prev, session, user: session?.user || null }));

      // Fetch profile if user exists
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        console.log("Profile data fetched:", profileData ? "found" : "not found");
        setAuthState((prev) => ({ ...prev, profile: profileData }));
      } else {
        setAuthState((prev) => ({ ...prev, profile: null }));
      }
      setLoading(false); // Set loading to false after auth state change
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...memoizedAuthValue, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);