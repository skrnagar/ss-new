"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

const PRESENCE_CHANNEL = "presence:app-wide";

type OnlinePresenceContextValue = {
  /** True if this user's presence is tracked on the channel (subscribed + tracked). */
  isPresenceReady: boolean;
  isUserOnline: (userId: string | undefined | null) => boolean;
};

const OnlinePresenceContext = createContext<OnlinePresenceContextValue>({
  isPresenceReady: false,
  isUserOnline: () => false,
});

function collectUserIdsFromPresenceState(state: Record<string, unknown>): Set<string> {
  const ids = new Set<string>();
  for (const presences of Object.values(state)) {
    if (!Array.isArray(presences)) continue;
    for (const row of presences) {
      if (row && typeof row === "object" && "userId" in row) {
        const uid = (row as { userId?: string }).userId;
        if (uid) ids.add(uid);
      }
    }
  }
  return ids;
}

export function OnlinePresenceProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [onlineIds, setOnlineIds] = useState<Set<string>>(() => new Set());
  const [isPresenceReady, setIsPresenceReady] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const applyPresenceState = useCallback((channel: ReturnType<typeof supabase.channel>) => {
    setOnlineIds(collectUserIdsFromPresenceState(channel.presenceState() as Record<string, unknown>));
  }, []);

  useEffect(() => {
    if (!userId) {
      setOnlineIds(new Set());
      setIsPresenceReady(false);
      return;
    }

    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        applyPresenceState(channel);
      })
      .on("presence", { event: "join" }, () => {
        applyPresenceState(channel);
      })
      .on("presence", { event: "leave" }, () => {
        applyPresenceState(channel);
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ userId });
        setIsPresenceReady(true);
        applyPresenceState(channel);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setIsPresenceReady(false);
      }
    });

    channelRef.current = channel;

    return () => {
      setIsPresenceReady(false);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [userId, applyPresenceState]);

  const isUserOnline = useCallback(
    (otherId: string | undefined | null) => {
      if (!otherId) return false;
      return onlineIds.has(otherId);
    },
    [onlineIds]
  );

  const value = useMemo(
    () => ({ isPresenceReady, isUserOnline }),
    [isPresenceReady, isUserOnline]
  );

  return <OnlinePresenceContext.Provider value={value}>{children}</OnlinePresenceContext.Provider>;
}

export function useOnlinePresence() {
  return useContext(OnlinePresenceContext);
}
