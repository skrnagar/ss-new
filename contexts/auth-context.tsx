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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    profile: Profile | null;
    session: Session | null;
  }>({ user: null, profile: null, session: null });

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, headline, position, company")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Exception in fetchProfile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!authState.user) return;
    const profileData = await fetchProfile(authState.user.id);
    setAuthState((prev) => ({ ...prev, profile: profileData }));
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthState((prev) => ({ ...prev, user: session?.user || null, session }));

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setAuthState((prev) => ({ ...prev, profile: profileData }));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState((prev) => ({ ...prev, session, user: session?.user || null }));

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setAuthState((prev) => ({ ...prev, profile: profileData }));
      } else {
        setAuthState((prev) => ({ ...prev, profile: null }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    ...authState,
    isLoading: !authState.user && !authState.profile,
    isAuthenticated: !!authState.user,
    refreshProfile,
  }), [authState]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}